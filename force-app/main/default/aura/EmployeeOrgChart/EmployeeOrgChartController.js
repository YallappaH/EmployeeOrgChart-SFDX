({    doInit: function(component, event, helper) {
        console.log('EmployeeOrgChart initialization');
        
        // Load all employees first
        helper.loadAllEmployees(component);
        
        // Setup hide contractors button event listener after page load
        window.setTimeout(function() {
            helper.setupDirectDOMManipulation(component);
            
            // Verify all connections in DOM after load
            helper.verifyHierarchyConnections(component);
        }, 1000);
    },
    
    refreshHierarchy: function(component, event, helper) {
        console.log('Manually refreshing hierarchy connections...');
        helper.verifyHierarchyConnections(component);
    },
    
    handleEmployeeSelect: function(component, event, helper) {
        var selectedEmployee = event.getParam("employee");
        console.log('Selected employee:', selectedEmployee.Name);
        
        component.set("v.selectedEmployee", selectedEmployee);
        
        // Fetch detailed employee information
        helper.fetchEmployeeDetails(component, selectedEmployee.Id);
    },
    
    filterByDepartment: function(component, event, helper) {
        // Get the department name from the clicked element's data attribute
        var department = event.currentTarget.dataset.department;
        
        // Log the department for debugging
        console.log('User clicked on department:', department);
        
        // Update UI to highlight selected department
        document.querySelectorAll('.department-item').forEach(function(item) {
            item.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
        
        // Set the selected department in the component attribute
        component.set("v.selectedDepartment", department);
        
        // Call the helper method to load employees for this department
        helper.loadEmployeesByDepartment(component, department);
        
        // Apply hide contractors functionality if it's currently active
        if (component.get("v.hideContractors")) {
            // Add a small delay to ensure DOM is updated before hiding contractors
            setTimeout(function() {
                helper.directlyHideContractors(component);
            }, 500);
        }
    },
    
    toggleContractors: function(component, event, helper) {
        // Get the checkbox value directly
        var hideContractors = event.getSource().get("v.checked");
        console.log('Hide Contractors toggled to:', hideContractors);
        
        // Set the value to the component attribute
        component.set("v.hideContractors", hideContractors);
        
        // Debug the value to console
        console.log('Attribute v.hideContractors value is now:', component.get("v.hideContractors"));
        
        if (hideContractors) {
            helper.directlyHideContractors(component);
        } else {
            helper.directlyShowAllEmployees(component);
        }
    },
    
    closeDetailPanel: function(component, event, helper) {
        console.log('Closing detail panel');
        component.set("v.selectedEmployee", null);
        component.set("v.selectedEmployeeDetails", null);
    },
    
    navigateToManager: function(component, event, helper) {
        var selectedEmployee = component.get("v.selectedEmployee");
        
        if (selectedEmployee && selectedEmployee.Manager__r) {
            // Get all employees
            var allEmployees = component.get("v.employees");
            
            // Find manager's full employee record
            var managerEmployee = null;
            for (var i = 0; i < allEmployees.length; i++) {
                if (allEmployees[i].Id === selectedEmployee.Manager__r.Id) {
                    managerEmployee = allEmployees[i];
                    break;
                }
            }
            
            if (managerEmployee) {
                // Set the manager as the selected employee
                component.set("v.selectedEmployee", managerEmployee);
                
                // Fetch details for the manager
                helper.fetchEmployeeDetails(component, managerEmployee.Id);
                
                console.log('Navigated to manager:', managerEmployee.Name);
            }
        }
    },
    
    refreshOrgChart: function(component, event, helper) {
        console.log('Refreshing organization chart data...');
        
        // Show a toast message
        var toastEvent = $A.get("e.force:showToast");
        if (toastEvent) {
            toastEvent.setParams({
                title: "Refreshing Data",
                message: "Refreshing organization chart data. Please wait...",
                type: "info"
            });
            toastEvent.fire();
        }
        
        // Call the helper method to reload all employees
        helper.loadAllEmployees(component);
    },
    
    // Zoom functionality for vertical layout
    zoomIn: function(component, event, helper) {
        var currentZoom = component.get("v.zoomLevel");
        var newZoom = Math.min(currentZoom + 10, 150); // Max zoom 150%
        component.set("v.zoomLevel", newZoom);
        helper.updateZoomLevel(component, newZoom);
        console.log('Zoom level increased to: ' + newZoom + '%');
    },
    
    zoomOut: function(component, event, helper) {
        var currentZoom = component.get("v.zoomLevel");
        var newZoom = Math.max(currentZoom - 10, 50); // Min zoom 50%
        component.set("v.zoomLevel", newZoom);
        helper.updateZoomLevel(component, newZoom);
        console.log('Zoom level decreased to: ' + newZoom + '%');
    },
    
    resetZoom: function(component, event, helper) {
        component.set("v.zoomLevel", 100);
        helper.updateZoomLevel(component, 100);
        console.log('Zoom level reset to 100%');
    },
    
    // Training Filter Functions
    filterByTraining: function(component, event, helper) {
        var selectedCourse = event.getSource().get("v.value");
        console.log('Filtering by training course:', selectedCourse);
        
        // Implement training filter logic (this would be expanded in a real implementation)
        helper.filterEmployeesByTraining(component, selectedCourse);
    },
    
    toggleCompletedTrainings: function(component, event, helper) {
        var showCompleted = event.getSource().get("v.checked");
        console.log('Show completed trainings toggled to:', showCompleted);
        
        // Implement toggle logic
        helper.toggleCompletedTrainingDisplay(component, showCompleted);
    },
    
    togglePastDueHighlight: function(component, event, helper) {
        var highlightPastDue = event.getSource().get("v.checked");
        console.log('Highlight past due trainings toggled to:', highlightPastDue);
        
        // Implement highlight logic
        helper.togglePastDueHighlighting(component, highlightPastDue);
    }
})