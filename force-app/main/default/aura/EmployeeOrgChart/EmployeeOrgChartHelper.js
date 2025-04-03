({
    loadAllEmployees: function(component) {
        // Get all employees with hierarchy
        var action = component.get('c.getAllEmployeesWithHierarchy');
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                var employees = response.getReturnValue();
                console.log('Loaded', employees.length, 'employees');
                component.set('v.employees', employees);
            } else {
                console.error('Error loading employees:', response.getError());
            }
        });
        
        $A.enqueueAction(action);
    },
    
    loadEmployeesByDepartment: function(component, department) {
        // Get employees by department
        var action = component.get('c.getEmployeesByDepartment');
        action.setParams({
            department: department
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                var employees = response.getReturnValue();
                console.log('Loaded', employees.length, 'employees for department:', department);
                component.set('v.employees', employees);
            } else {
                console.error('Error loading employees by department:', response.getError());
            }
        });
        
        $A.enqueueAction(action);
    },
    
    loadRootEmployees: function(component) {
        // Get root employees (employees with no manager)
        var action = component.get('c.getRootEmployees');
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                var rootEmployees = response.getReturnValue();
                console.log('Loaded', rootEmployees.length, 'root employees');
                component.set('v.rootEmployees', rootEmployees);
            } else {
                console.error('Error loading root employees:', response.getError());
            }
        });
        
        $A.enqueueAction(action);
    },
    
    loadRootEmployeesByDepartment: function(component, department) {
        // Get all employees
        var action = component.get('c.getEmployeesByDepartment');
        action.setParams({
            department: department
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                var employees = response.getReturnValue();
                
                // Filter to find employees in this department with no manager
                // or with managers outside the department
                var rootEmployees = employees.filter(function(emp) {
                    // Include if no manager
                    if (!emp.Manager__c) {
                        return true;
                    }
                    
                    // Include if manager is outside the department
                    return employees.every(function(possibleManager) {
                        return possibleManager.Id !== emp.Manager__c;
                    });
                });
                
                console.log('Identified', rootEmployees.length, 'root employees for department:', department);
                component.set('v.rootEmployees', rootEmployees);
            } else {
                console.error('Error loading employees for root identification:', response.getError());
            }
        });
        
        $A.enqueueAction(action);
    },
    
    loadDepartmentStats: function(component, department) {
        // Get department stats
        var action = component.get('c.getDepartmentStats');
        action.setParams({
            department: department
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                var stats = response.getReturnValue();
                console.log('Loaded stats for', department || 'All Departments', ':', stats);
                component.set('v.stats', stats);
            } else {
                console.error('Error loading department stats:', response.getError());
            }
        });
        
        $A.enqueueAction(action);
    },
    
    loadEmployeeDetails: function(component, employeeId) {
        // Get employee details
        var action = component.get('c.getEmployeeDetails');
        action.setParams({
            employeeId: employeeId
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                var details = response.getReturnValue();
                console.log('Loaded employee details:', details);
                component.set('v.employeeDetails', details);
            } else {
                console.error('Error loading employee details:', response.getError());
            }
        });
        
        $A.enqueueAction(action);
    }
})