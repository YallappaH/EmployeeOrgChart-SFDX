public with sharing class EmployeeOrgChartController {
    
    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getHierarchicalEmployees(String department) {
        String query = 'SELECT Id, Name, Department__c, Employee_Type__c, ' +
                       'Manager__c, Manager__r.Name, Job_Title__c, ' +
                       'Role_Category__c, Product_Line__c, ' +
                       'Manager_Stats__c, Product_Manager_Stats__c, Engineer_Stats__c, ' +
                       '(SELECT Id, Name, Job_Title__c, Department__c, Role_Category__c FROM DirectReports__r) ' +
                       'FROM Employee__c ';
        
        if (String.isNotBlank(department)) {
            query += 'WHERE Department__c = :department ';
        }
        
        query += 'ORDER BY Job_Title__c, Name';
        
        return Database.query(query);
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getEmployeesByDepartment(String department) {
        if (String.isBlank(department)) {
            return [
                SELECT Id, Name, Employee_Type__c, Department__c, Manager__c, 
                       Job_Title__c, Role_Category__c, Product_Line__c, 
                       Manager__r.Name
                FROM Employee__c
            ];
        }
        
        return [
            SELECT Id, Name, Employee_Type__c, Department__c, Manager__c, 
                   Job_Title__c, Role_Category__c, Product_Line__c, 
                   Manager__r.Name
            FROM Employee__c 
            WHERE Department__c = :department
        ];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getAllEmployeesWithHierarchy() {
        return [SELECT Id, Name, Department__c, Employee_Type__c, Manager__c, 
                       Job_Title__c, Role_Category__c, Product_Line__c, 
                       Manager__r.Name,
                       (SELECT Id, Name, Department__c, Employee_Type__c, Job_Title__c, 
                        Role_Category__c, Manager__c, Manager__r.Name 
                        FROM DirectReports__r ORDER BY Name ASC)
                FROM Employee__c 
                ORDER BY Department__c, Name];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getManagerHierarchy(Id managerId) {
        // First, get the manager's record
        Employee__c manager = [
            SELECT Id, Name, Department__c, Employee_Type__c, Manager__c, 
                   Job_Title__c, Role_Category__c, Product_Line__c, 
                   Manager__r.Name
            FROM Employee__c
            WHERE Id = :managerId
        ];
        
        // Create a set to store all employee IDs in the hierarchy
        Set<Id> hierarchyIds = new Set<Id>();
        hierarchyIds.add(managerId); // Add the manager ID
        
        // Get all employees to check for reports
        List<Employee__c> allEmployees = [
            SELECT Id, Name, Department__c, Employee_Type__c, Manager__c, 
                   Job_Title__c, Role_Category__c, Product_Line__c, 
                   Manager__r.Name
            FROM Employee__c
        ];
        
        // Build a map of manager ID to their direct reports
        Map<Id, List<Employee__c>> managerToReportsMap = new Map<Id, List<Employee__c>>();
        for (Employee__c emp : allEmployees) {
            if (emp.Manager__c != null) {
                if (!managerToReportsMap.containsKey(emp.Manager__c)) {
                    managerToReportsMap.put(emp.Manager__c, new List<Employee__c>());
                }
                managerToReportsMap.get(emp.Manager__c).add(emp);
            }
        }
        
        // Recursively find all employees in the hierarchy
        findAllReports(managerId, managerToReportsMap, hierarchyIds);
        
        // Query for all employees in the hierarchy with their direct reports
        return [
            SELECT Id, Name, Department__c, Employee_Type__c, Manager__c, 
                   Job_Title__c, Role_Category__c, Product_Line__c, 
                   Manager__r.Name,
                   (SELECT Id, Name, Job_Title__c, Department__c, Role_Category__c, 
                    Employee_Type__c FROM DirectReports__r)
            FROM Employee__c
            WHERE Id IN :hierarchyIds
            ORDER BY Department__c, Name
        ];
    }
    
    // Helper method to recursively find all reports in a hierarchy
    private static void findAllReports(Id managerId, Map<Id, List<Employee__c>> managerToReportsMap, Set<Id> hierarchyIds) {
        if (managerToReportsMap.containsKey(managerId)) {
            for (Employee__c directReport : managerToReportsMap.get(managerId)) {
                hierarchyIds.add(directReport.Id);
                findAllReports(directReport.Id, managerToReportsMap, hierarchyIds);
            }
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getDepartmentStats(String department) {
        // Use separate queries to count employees by type
        Map<String, Object> stats = new Map<String, Object>();
        
        // Get total employees
        AggregateResult[] totalResults;
        if (String.isBlank(department)) {
            totalResults = [
                SELECT COUNT(Id) totalEmployees, COUNT_DISTINCT(Department__c) departmentCount
                FROM Employee__c
            ];
        } else {
            totalResults = [
                SELECT COUNT(Id) totalEmployees
                FROM Employee__c
                WHERE Department__c = :department
            ];
        }
        
        // Get FTE count
        AggregateResult[] fteResults;
        if (String.isBlank(department)) {
            fteResults = [
                SELECT COUNT(Id) fteCount
                FROM Employee__c
                WHERE Employee_Type__c = 'FTE'
            ];
        } else {
            fteResults = [
                SELECT COUNT(Id) fteCount
                FROM Employee__c
                WHERE Department__c = :department AND Employee_Type__c = 'FTE'
            ];
        }
        
        // Get Contractor count
        AggregateResult[] contractorResults;
        if (String.isBlank(department)) {
            contractorResults = [
                SELECT COUNT(Id) contractorCount
                FROM Employee__c
                WHERE Employee_Type__c = 'Contractor'
            ];
        } else {
            contractorResults = [
                SELECT COUNT(Id) contractorCount
                FROM Employee__c
                WHERE Department__c = :department AND Employee_Type__c = 'Contractor'
            ];
        }
        
        // Process results and populate stats map
        if (!totalResults.isEmpty()) {
            stats.put('totalEmployees', totalResults[0].get('totalEmployees'));
            
            // Add department count if available and no specific department filter
            if (String.isBlank(department) && totalResults[0].get('departmentCount') != null) {
                stats.put('departmentCount', totalResults[0].get('departmentCount'));
            }
        } else {
            stats.put('totalEmployees', 0);
            if (String.isBlank(department)) {
                stats.put('departmentCount', 0);
            }
        }
        
        // Process FTE count
        if (!fteResults.isEmpty() && fteResults[0].get('fteCount') != null) {
            stats.put('fteCount', fteResults[0].get('fteCount'));
        } else {
            stats.put('fteCount', 0);
        }
        
        // Process contractor count
        if (!contractorResults.isEmpty() && contractorResults[0].get('contractorCount') != null) {
            stats.put('contractorCount', contractorResults[0].get('contractorCount'));
        } else {
            stats.put('contractorCount', 0);
        }
        
        return stats;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getRootEmployees() {
        return [
            SELECT Id, Name, Employee_Type__c, Department__c, Manager__c, 
                   Job_Title__c, Role_Category__c, Product_Line__c, 
                   Manager__r.Name, 
                   (SELECT Id, Name FROM DirectReports__r)
            FROM Employee__c 
            WHERE Manager__c = null
            ORDER BY Name ASC
        ];
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getEmployeeDetails(Id employeeId) {
        Employee__c emp = [SELECT Id, Name, Department__c, Employee_Type__c, Job_Title__c, 
                           Role_Category__c, Product_Line__c, 
                           Manager__r.Name, Manager__r.Id,
                           (SELECT Id, Name FROM DirectReports__r)
                           FROM Employee__c 
                           WHERE Id = :employeeId];
        
        // Count direct reports
        Integer directReportCount = 0;
        if (emp.DirectReports__r != null) {
            directReportCount = emp.DirectReports__r.size();
        }
        
        // Create the details map
        Map<String, Object> details = new Map<String, Object>{
            'name' => emp.Name,
            'department' => emp.Department__c,
            'employeeType' => emp.Employee_Type__c,
            'jobTitle' => emp.Job_Title__c,
            'roleCategory' => emp.Role_Category__c,
            'productLine' => emp.Product_Line__c,
            'directReportCount' => directReportCount
        };
        
        // Add manager info if present
        if (emp.Manager__r != null && emp.Manager__r.Id != null) {
            details.put('managerName', emp.Manager__r.Name);
            details.put('managerId', emp.Manager__r.Id);
        }
        
        return details;
    }
}