({
    doInit: function(component, event, helper) {
        console.log('EmployeeOrgChart initialized');
        
        // Load employees
        helper.loadAllEmployees(component);
        
        // Load root employees
        helper.loadRootEmployees(component);
        
        // Load department stats
        helper.loadDepartmentStats(component, '');
    },
    
    filterByDepartment: function(component, event, helper) {
        var department = event.currentTarget.dataset.department || '';
        console.log('Filtering by department:', department);
        
        // Update selected department
        component.set('v.selectedDepartment', department);
        
        // Clear selected employee
        component.set('v.showEmployeeDetails', false);
        component.set('v.selectedEmployee', {});
        component.set('v.employeeDetails', {});
        
        // Get employees for this department
        if (department) {
            helper.loadEmployeesByDepartment(component, department);
            helper.loadRootEmployeesByDepartment(component, department);
        } else {
            helper.loadAllEmployees(component);
            helper.loadRootEmployees(component);
        }
        
        // Update department stats
        helper.loadDepartmentStats(component, department);
    },
    
    handleEmployeeSelect: function(component, event, helper) {
        var employee = event.getParam('employee');
        console.log('Employee selected:', employee.Name);
        
        // Set the selected employee
        component.set('v.selectedEmployee', employee);
        component.set('v.showEmployeeDetails', true);
        
        // Load employee details
        helper.loadEmployeeDetails(component, employee.Id);
    },
    
    selectManager: function(component, event, helper) {
        var managerId = component.get('v.employeeDetails.managerId');
        if (managerId) {
            console.log('Selecting manager with ID:', managerId);
            
            // Find the manager in the employees list
            var employees = component.get('v.employees');
            var manager = employees.find(function(emp) {
                return emp.Id === managerId;
            });
            
            if (manager) {
                // Set the selected employee to the manager
                component.set('v.selectedEmployee', manager);
                
                // Load employee details for the manager
                helper.loadEmployeeDetails(component, managerId);
            }
        }
    }
})