# Employee Org Chart Maintenance Guide

This document outlines how to maintain and update the Employee Org Chart data going forward, including best practices for adding new employees, updating reporting relationships, and modifying the visualization.

## Table of Contents
1. [Understanding the Data Model](#understanding-the-data-model)
2. [Adding New Employees](#adding-new-employees)
3. [Updating Reporting Structure](#updating-reporting-structure)
4. [Modifying Department Categories](#modifying-department-categories)
5. [Updating Visualization Styles](#updating-visualization-styles)
6. [Troubleshooting Common Issues](#troubleshooting-common-issues)
7. [GitHub Integration](#github-integration)

## Understanding the Data Model

The Employee Org Chart is built on a simple but powerful data model:

- **Employee__c** custom object - Represents each employee in the organization
- Key fields:
  - **Name** - Employee's full name (ExternalId for upserts)
  - **Department__c** - Department picklist (Data Cloud, Viz, EDH, Snowflake, Data Tools, Core Infra)
  - **Employee_Type__c** - Employee type (FTE, Contractor)
  - **Manager__c** - Lookup to another Employee__c record (establishes hierarchy)
  - **Job_Title__c** - Employee's job title
  - **Role_Category__c** - Role category picklist
  - **Product_Line__c** - Product line the employee works on

The hierarchy is displayed based on the Manager__c relationship field, which creates a self-referential tree structure.

## Adding New Employees

### Method 1: Using Apex Script (Recommended)

For adding multiple employees at once, create an Apex script:

```apex
// Create a list for new employees
List<Employee__c> emps = new List<Employee__c>();

// Add employees
emps.add(new Employee__c(
    Name = 'New Employee Name',
    Job_Title__c = 'Job Title',
    Department__c = 'Department',  // Use picklist value
    Employee_Type__c = 'FTE',      // FTE or Contractor
    Product_Line__c = 'Product Line'
));

// Insert the records
insert emps;

// Set up reporting relationships
Map<String, Id> nameToIdMap = new Map<String, Id>();
for (Employee__c e : [SELECT Id, Name FROM Employee__c]) {
    nameToIdMap.put(e.Name, e.Id);
}

List<Employee__c> updates = new List<Employee__c>();
if (nameToIdMap.containsKey('New Employee Name') && nameToIdMap.containsKey('Manager Name')) {
    updates.add(new Employee__c(
        Id = nameToIdMap.get('New Employee Name'), 
        Manager__c = nameToIdMap.get('Manager Name')
    ));
}

update updates;
```

Run the script using the Salesforce CLI:
```bash
sf apex run --file your_script.apex -o i360Dev
```

### Method 2: Using Salesforce UI

For quick one-off additions:

1. Go to the App Launcher > Custom Apps > Employee Management
2. Click on the "Employees" tab
3. Click "New" button
4. Fill in the required fields, including:
   - Employee Name
   - Department
   - Employee Type
   - Manager (Lookup to another employee)
   - Job Title
   - Role Category
   - Product Line (if applicable)
5. Click "Save"

### Method 3: Using Data Loader or SFDX Data Import

For bulk additions:

1. Prepare a CSV file with the required fields
2. Use Salesforce Data Loader or SFDX CLI:
   ```bash
   sf data import tree -f employee-data.json -u i360Dev
   ```

## Updating Reporting Structure

### Method 1: Using Apex Script

For targeted updates of reporting structures, create an Apex script:

```apex
// Update specific employees' reporting relationships
try {
    // Get manager's ID
    Employee__c manager = [SELECT Id FROM Employee__c WHERE Name = 'Manager Name' LIMIT 1];
    
    // Get employees to update
    List<Employee__c> empsToUpdate = [
        SELECT Id, Name, Department__c
        FROM Employee__c 
        WHERE Name IN ('Employee1', 'Employee2', 'Employee3')
    ];
    
    // Update the manager reference and department if needed
    for(Employee__c emp : empsToUpdate) {
        emp.Manager__c = manager.Id;
        
        // Also ensure Department__c matches the manager's team if needed
        emp.Department__c = 'Department';
    }
    
    // Update the records
    update empsToUpdate;
    
    System.debug('Successfully updated ' + empsToUpdate.size() + ' employees');
} catch(Exception e) {
    System.debug('Error updating employees: ' + e.getMessage());
}
```

### Method 2: Using Salesforce UI

For updating individual reporting relationships:

1. Go to the App Launcher > Custom Apps > Employee Management
2. Click on the "Employees" tab
3. Click on the employee record you want to update
4. Click "Edit" button
5. Update the "Manager" lookup field
6. Click "Save"

## Modifying Department Categories

To add or modify the department picklist values:

1. Update the `Department__c.field-meta.xml` file:
   ```xml
   <valueSetDefinition>
       <sorted>false</sorted>
       <value>
           <fullName>New Department</fullName>
           <default>false</default>
           <label>New Department</label>
       </value>
       <!-- Other values here -->
   </valueSetDefinition>
   ```

2. Add corresponding CSS styles to `EmployeeNode.css`:
   ```css
   .THIS .employee-card.New_Department {
       border-left: 8px solid #COLOR_CODE;
       background-color: #BACKGROUND_COLOR;
   }
   ```

3. And to `EmployeeOrgChart.css`:
   ```css
   .THIS .department-item.new-department {
       background-color: #BACKGROUND_COLOR;
       border-left-color: #COLOR_CODE;
   }
   ```

4. Deploy the updated metadata:
   ```bash
   sf project deploy start --source-dir force-app/main/default/objects/Employee__c/fields --target-org i360Dev
   sf project deploy start --source-dir force-app/main/default/aura --target-org i360Dev
   ```

## Updating Visualization Styles

### Modifying Department Colors

To update the department colors, edit the CSS files:

1. In `EmployeeNode.css`, modify the department class styles:
   ```css
   .THIS .employee-card.Data_Cloud {
       border-left: 8px solid #F5C93D;  /* Yellow */
       background-color: #FFFAED;
   }

   .THIS .employee-card.Viz {
       border-left: 8px solid #98CEF5;  /* Blue */
       background-color: #F4FAFF;
   }
   
   /* Other departments... */
   ```

2. In `EmployeeOrgChart.css`, update the matching department colors:
   ```css
   .THIS .department-item.data-cloud {
       background-color: #FFFAED;
       border-left-color: #F5C93D;
   }
   
   .THIS .department-item.viz {
       background-color: #F4FAFF;
       border-left-color: #98CEF5;
   }
   
   /* Other departments... */
   ```

### Modifying Employee Type Styling

To enhance the distinction between FTEs and Contractors:

1. In `EmployeeNode.css`:
   ```css
   .THIS .employee-card.FTE {
       border: 1px solid #e5e5e5;
   }

   .THIS .employee-card.Contractor {
       border: 1px dashed #aaaaaa;
       opacity: 0.9;
       background-image: repeating-linear-gradient(
           45deg,
           rgba(0, 0, 0, 0.02),
           rgba(0, 0, 0, 0.02) 10px,
           rgba(0, 0, 0, 0) 10px,
           rgba(0, 0, 0, 0) 20px
       );
   }
   ```

2. In `EmployeeOrgChart.css`:
   ```css
   .THIS .employee-type-badge.FTE {
       background-color: #DFF0D8;
       color: #3C763D;
   }

   .THIS .employee-type-badge.Contractor {
       background-color: #F2DEDE;
       color: #A94442;
       border: 1px dashed #ebccd1;
   }
   ```

3. Deploy the CSS changes:
   ```bash
   sf project deploy start --source-dir force-app/main/default/aura --target-org i360Dev
   ```

## Troubleshooting Common Issues

### Deployment Issues

If you encounter errors when deploying, check the following:

1. **Syntax Errors in Components**:
   - Ensure there are no syntax errors in your Lightning components
   - Check expressions in class attributes, especially in concatenated strings
   - Simplify complex expressions by breaking them into multiple attributes

2. **Order of Deployment**:
   - Always deploy in the correct order:
     1. Objects and fields first
     2. Apex classes second
     3. Lightning components last

3. **API Version Mismatches**:
   - Ensure all components use the same API version
   - Check the meta.xml files for version inconsistencies

### Visualization Issues

If the org chart doesn't display correctly:

1. **CSS Issues**:
   - Check if CSS changes were deployed correctly
   - Try refreshing your browser cache (Ctrl+F5 or Cmd+Shift+R)

2. **Data Issues**:
   - Verify that employees have correct department values
   - Check manager relationships to ensure hierarchy is correct

3. **JavaScript Errors**:
   - Open browser console to check for JavaScript errors
   - Verify that event handlers are working correctly

### Employee Not Showing in the Hierarchy

If an employee is not appearing in the org chart:

1. Check that the employee record exists:
   ```apex
   List<Employee__c> employees = [
       SELECT Id, Name, Manager__r.Name 
       FROM Employee__c 
       WHERE Name = 'Employee Name'
   ];
   System.debug(employees);
   ```

2. Verify the Manager relationship:
   ```apex
   Employee__c employee = [
       SELECT Id, Name, Manager__c, Manager__r.Name 
       FROM Employee__c 
       WHERE Name = 'Employee Name'
   ];
   System.debug('Manager: ' + (employee.Manager__r != null ? employee.Manager__r.Name : 'NULL'));
   ```

3. Ensure the department value is valid:
   ```apex
   Employee__c employee = [
       SELECT Id, Name, Department__c 
       FROM Employee__c 
       WHERE Name = 'Employee Name'
   ];
   System.debug('Department: ' + employee.Department__c);
   ```

## GitHub Integration

For better code management and collaboration, it's recommended to store the org chart code in GitHub.

### Setting Up GitHub Repository

1. Create a new repository on GitHub:
   ```bash
   # Initialize Git repository
   cd /Users/yhuchchannavar/Documents/EmployeeOrgChart-SFDX
   git init
   
   # Add .gitignore file
   echo ".sfdx/" > .gitignore
   echo ".sf/" >> .gitignore
   echo "node_modules/" >> .gitignore
   
   # Add and commit files
   git add .
   git commit -m "Initial commit"
   
   # Add remote repository
   git remote add origin https://github.com/yourusername/EmployeeOrgChart-SFDX.git
   
   # Push to GitHub
   git push -u origin main
   ```

### Workflow for Updates

When making changes:

1. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes to the files

3. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

4. Push to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request on GitHub for review

6. After approval, merge into main branch

### Deploying from GitHub

To deploy changes from GitHub to your org:

1. Clone the repository (if not already done):
   ```bash
   git clone https://github.com/yourusername/EmployeeOrgChart-SFDX.git
   cd EmployeeOrgChart-SFDX
   ```

2. Pull the latest changes:
   ```bash
   git pull origin main
   ```

3. Deploy to your org:
   ```bash
   sf project deploy start --source-dir force-app --target-org i360Dev
   ```

By following these maintenance guidelines, you'll be able to keep the Employee Org Chart up-to-date as your organization evolves and easily manage changes to the visualization and data structure.