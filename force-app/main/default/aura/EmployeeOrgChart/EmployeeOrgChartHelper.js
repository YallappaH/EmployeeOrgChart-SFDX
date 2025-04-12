({    // Method to load all employees
    loadAllEmployees: function(component) {
        console.log('Loading all employees...');
        var action = component.get("c.getAllEmployeesWithHierarchy");
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var employees = response.getReturnValue();
                
                // Process employees to remove duplicates
                employees = this.removeDuplicateEmployees(employees);
                
                component.set("v.employees", employees);
                
                // Also load root employees for the hierarchy
                this.loadRootEmployees(component);
                
                // Load department stats
                this.loadDepartmentStats(component, '');
            } else {
                console.error('Error loading all employees', response.getError());
            }
        });
        
        $A.enqueueAction(action);
    },
    
    // Method to remove duplicate employees from the data
    removeDuplicateEmployees: function(employees) {
        // Create a map to detect duplicates
        var employeeMap = new Map();
        var duplicatesFound = [];
        var cleanedEmployees = [];
        
        // First identify duplicates
        employees.forEach(function(emp) {
            if (employeeMap.has(emp.Id)) {
                duplicatesFound.push(emp.Id);
            } else {
                employeeMap.set(emp.Id, emp);
                cleanedEmployees.push(emp);
            }
        });
        
        if (duplicatesFound.length > 0) {
            console.log('Removed ' + duplicatesFound.length + ' duplicate employee records');
        }
        
        return cleanedEmployees;
    },
    
    // Existing loadRootEmployees method from original file
    loadRootEmployees: function(component) {
        var action = component.get("c.getRootEmployees");
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var rootEmployees = response.getReturnValue();
                
                // Find Omer Ansari and make sure he's the only root
                var isOmerPresent = false;
                var omerEmployee = null;
                
                rootEmployees.forEach(function(emp) {
                    if (emp.Name === 'Omer Ansari') {
                        isOmerPresent = true;
                        omerEmployee = emp;
                    }
                });
                
                // If Omer is found, make him the only root
                if (isOmerPresent && omerEmployee) {
                    // Set only Omer as the root employee
                    component.set("v.rootEmployees", [omerEmployee]);
                } else {
                    component.set("v.rootEmployees", rootEmployees);
                }
                
                console.log('Root employees loaded:', rootEmployees.length);
                
                // Process after a delay to ensure DOM is ready
                setTimeout(function() {
                    this.fixDuplicateEmployeeNodes(component);
                }.bind(this), 500);
            } else {
                console.error('Error loading root employees', response.getError());
            }
        });
        
        $A.enqueueAction(action);
    },

    // Department filtering method
    loadEmployeesByDepartment: function(component, department) {
        console.log('Filtering by department:', department);
        
        // First, load all employees for this department to get the full dataset
        var action = component.get("c.getEmployeesByDepartment");
        action.setParams({
            "department": department
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var employees = response.getReturnValue();
                
                // Process employees to remove duplicates
                employees = this.removeDuplicateEmployees(employees);
                
                component.set("v.employees", employees);
                
                console.log('Filtered to department:', department, 'Found employees:', employees.length);
                
                // Now load the root employees for this department
                this.loadRootEmployeesByDepartment(component, department);
                
                // Load department stats
                this.loadDepartmentStats(component, department);
                
                // Fix duplicate employee nodes after loading
                setTimeout(function() {
                    this.fixDuplicateEmployeeNodes(component);
                }.bind(this), 500);
            } else {
                console.error('Error loading department employees', response.getError());
            }
        });
        
        $A.enqueueAction(action);
    },
    
    // Load root employees filtered by department
    loadRootEmployeesByDepartment: function(component, department) {
        console.log('Loading root employees for department:', department);
        
        // Get the hierarchical view
        var action = component.get("c.getHierarchicalEmployees");
        action.setParams({
            "department": department
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var employees = response.getReturnValue();
                
                // Find employees with no manager or manager outside the department
                var rootEmployees = [];
                var empMap = new Map();
                
                // Build map for quick lookup
                employees.forEach(function(emp) {
                    empMap.set(emp.Id, emp);
                });
                
                // Find root employees
                employees.forEach(function(emp) {
                    if (!emp.Manager__c || !empMap.has(emp.Manager__c)) {
                        rootEmployees.push(emp);
                    }
                });
                
                component.set("v.rootEmployees", rootEmployees);
                console.log('Root employees for department loaded:', rootEmployees.length);
            } else {
                console.error('Error loading root employees for department', response.getError());
            }
        });
        
        $A.enqueueAction(action);
    },

    // Department stats method
    loadDepartmentStats: function(component, department) {
        console.log('Loading stats for department:', department);
        
        var action = component.get("c.getDepartmentStats");
        action.setParams({
            "department": department
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var stats = response.getReturnValue();
                component.set("v.departmentStats", stats);
                console.log('Department stats loaded:', stats);
            } else {
                console.error('Error loading department stats', response.getError());
            }
        });
        
        $A.enqueueAction(action);
    },
    
    // Method to fetch employee details
    fetchEmployeeDetails: function(component, employeeId) {
        console.log('Fetching details for employee ID:', employeeId);
        
        var action = component.get("c.getEmployeeDetails");
        action.setParams({
            "employeeId": employeeId
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var details = response.getReturnValue();
                component.set("v.selectedEmployeeDetails", details);
            } else {
                console.error('Error fetching employee details', response.getError());
            }
        });
        
        $A.enqueueAction(action);
    },
    
    // Method for DOM manipulation
    setupDirectDOMManipulation: function(component) {
        console.log('Setting up direct DOM manipulation...');
        
        // Used for the hide contractors functionality
        if (component.get("v.hideContractors")) {
            // Hide contractors initially if the setting is enabled
            this.directlyHideContractors(component);
        }
        
        // Fix any duplicate DOM nodes
        this.fixDuplicateEmployeeNodes(component);
    },
    
    // Fix duplicate employee nodes in the DOM
    fixDuplicateEmployeeNodes: function(component) {
        console.log('Checking for duplicate employee nodes in the DOM...');
        
        // Wait for DOM to be fully rendered
        setTimeout(function() {
            // Create a map to track unique employee names and their DOM nodes
            var employeeNodeMap = new Map();
            var duplicateNodes = [];
            
            // Find all employee cards in the DOM
            var employeeCards = document.querySelectorAll('.employee-card');
            
            employeeCards.forEach(function(card) {
                var employeeName = card.querySelector('.employee-name');
                if (employeeName) {
                    var name = employeeName.textContent.trim();
                    
                    // If we've seen this name before, it's a duplicate
                    if (employeeNodeMap.has(name)) {
                        // Check if this is Yallappa H specifically
                        if (name === 'Yallappa H') {
                            var container = card.closest('.branch-container');
                            if (container) {
                                duplicateNodes.push(container);
                                container.style.display = 'none';
                                console.log('Found and hid duplicate Yallappa H node');
                            }
                        }
                    } else {
                        // First time seeing this name
                        employeeNodeMap.set(name, card);
                    }
                }
            });
            
            console.log('Found and hid ' + duplicateNodes.length + ' duplicate employee nodes');
        }, 1000);
    },
    
    // SIMPLIFIED AND DIRECT METHOD to hide contractors only
    directlyHideContractors: function(component) {
        console.log('Directly hiding ONLY contractor employees...');
        
        // First, remove any existing hiding styles
        this.clearContractorHidingStyles();
        
        // Get all employees from the component
        var allEmployees = component.get("v.employees");
        if (!allEmployees) {
            console.log('No employee data available');
            return;
        }
        
        // Create arrays to store contractor and FTE employee names
        var contractorNames = [];
        var fteNames = [];
        
        // Sort employees by type
        allEmployees.forEach(function(emp) {
            if (emp.Employee_Type__c === 'Contractor') {
                contractorNames.push(emp.Name);
            } else {
                fteNames.push(emp.Name);
            }
        });
        
        console.log('Found ' + contractorNames.length + ' contractors and ' + fteNames.length + ' FTEs in data');
        
        // If no contractors found in the data, return early
        if (contractorNames.length === 0) {
            console.log('No contractors found in employee data');
            return;
        }
        
        // Now find all employee cards in the DOM
        var employeeCards = document.querySelectorAll('.employee-card');
        var hiddenCount = 0;
        
        // Hide only cards where the name matches a contractor name
        employeeCards.forEach(function(card) {
            var nameElement = card.querySelector('.employee-name');
            if (nameElement) {
                var name = nameElement.textContent.trim();
                
                // If this employee is in our contractor list, hide it
                if (contractorNames.includes(name)) {
                    var branchContainer = card.closest('.branch-container');
                    if (branchContainer) {
                        branchContainer.style.display = 'none';
                        branchContainer.classList.add('hidden-contractor');
                    } else {
                        card.style.display = 'none';
                        card.classList.add('hidden-contractor');
                    }
                    hiddenCount++;
                    console.log('Hiding contractor: ' + name);
                } else if (fteNames.includes(name)) {
                    // Ensure FTEs are visible
                    if (card.style.display === 'none') {
                        card.style.display = '';
                        card.classList.remove('hidden-contractor');
                    }
                    
                    var branchContainer = card.closest('.branch-container');
                    if (branchContainer && branchContainer.classList.contains('hidden-contractor')) {
                        branchContainer.style.display = '';
                        branchContainer.classList.remove('hidden-contractor');
                    }
                }
            }
        });
        
        console.log('Successfully hidden ' + hiddenCount + ' contractor nodes');
        
        // Fix duplicate nodes again after hiding contractors
        setTimeout(function() {
            this.fixDuplicateEmployeeNodes(component);
        }.bind(this), 300);
    },
    
    // Method to clear contractor hiding styles
    clearContractorHidingStyles: function() {
        // Remove any style rules we added
        var styleSheet = document.styleSheets[0];
        try {
            for (var i = 0; i < styleSheet.cssRules.length; i++) {
                var rule = styleSheet.cssRules[i];
                if (rule.selectorText && (
                    rule.selectorText.includes('Contractor') || 
                    rule.selectorText.includes('contractor') ||
                    rule.selectorText.includes('hidden-contractor')
                )) {
                    styleSheet.deleteRule(i);
                    i--; // Adjust index after deletion
                }
            }
        } catch(e) {
            console.error('Error cleaning up style rules:', e);
        }
        
        // Also manually show all elements that might have been hidden
        document.querySelectorAll('.hidden-contractor').forEach(function(el) {
            el.classList.remove('hidden-contractor');
            el.style.display = '';
        });
    },
    
    // Method to show all employees
    directlyShowAllEmployees: function(component) {
        console.log('Directly showing all employees...');
        
        // Clear any contractor-hiding styles
        this.clearContractorHidingStyles();
        
        // Show all branch containers that were hidden
        var allBranchContainers = document.querySelectorAll('.branch-container');
        allBranchContainers.forEach(function(container) {
            container.style.display = '';
            container.classList.remove('hidden-contractor');
        });
        
        // Also ensure any directly hidden cards are shown
        var allCards = document.querySelectorAll('.employee-card');
        allCards.forEach(function(card) {
            card.style.display = '';
            card.classList.remove('hidden-contractor');
        });
        
        console.log('Showed all branch containers and cards');
        
        // But keep duplicates hidden
        this.fixDuplicateEmployeeNodes(component);
    },
    
    // Method to verify hierarchy connections
    verifyHierarchyConnections: function(component) {
        console.log('Verifying hierarchy connections in the org chart...');
        
        // Get all employees
        var allEmployees = component.get("v.employees");
        if (!allEmployees || allEmployees.length === 0) {
            console.warn('No employees available to verify');
            return;
        }
        
        // Build a map of employees by ID for quicker lookup
        var employeesById = new Map();
        allEmployees.forEach(function(emp) {
            employeesById.set(emp.Id, emp);
        });
        
        // Build a map of manager ID to direct reports
        var managerToReportsMap = new Map();
        allEmployees.forEach(function(emp) {
            if (emp.Manager__c) {
                if (!managerToReportsMap.has(emp.Manager__c)) {
                    managerToReportsMap.set(emp.Manager__c, []);
                }
                managerToReportsMap.get(emp.Manager__c).push(emp);
            }
        });
        
        // Get all cards from the DOM and build a map of card elements by employee name
        var employeeCards = document.querySelectorAll('.employee-card');
        var cardsByEmployeeName = new Map();
        
        employeeCards.forEach(function(card) {
            var nameElement = card.querySelector('.employee-name');
            if (nameElement) {
                var name = nameElement.textContent.trim();
                cardsByEmployeeName.set(name, card);
            }
        });
        
        // Check for the problematic employees mentioned in the issue description
        var problemEmployees = ['Uday Vadlamudi', 'Yallappa H'];
        problemEmployees.forEach(function(empName) {
            // Find the employee record
            var employee = allEmployees.find(function(e) { return e.Name === empName; });
            if (!employee) {
                console.warn('Problem employee not found:', empName);
                return;
            }
            
            console.log('Checking problem employee:', empName);
            
            // Find the manager
            if (employee.Manager__c) {
                var manager = employeesById.get(employee.Manager__c);
                if (manager) {
                    console.log('  Correct manager for', empName, 'is:', manager.Name);
                    
                    // Find the card for this employee
                    var employeeCard = cardsByEmployeeName.get(empName);
                    if (employeeCard) {
                        // Verify that it's properly under the correct manager
                        var parentCard = this.findParentCardElement(employeeCard);
                        if (parentCard) {
                            var parentName = parentCard.querySelector('.employee-name');
                            if (parentName) {
                                var parentNameText = parentName.textContent.trim();
                                if (parentNameText !== manager.Name) {
                                    console.error('  HIERARCHY MISMATCH:', empName, 
                                                'is showing under', parentNameText, 
                                                'but should be under', manager.Name);
                                } else {
                                    console.log('  Hierarchy connection is correct:', 
                                               empName, 'is properly under', manager.Name);
                                }
                            }
                        }
                    }
                }
            }
        }.bind(this));
        
        // Check for general inconsistencies in the hierarchy
        console.log('Checking all employees for hierarchy inconsistencies...');
        var inconsistencies = 0;
        
        allEmployees.forEach(function(emp) {
            if (emp.Manager__c) {
                var manager = employeesById.get(emp.Manager__c);
                if (manager) {
                    // Find the cards for both
                    var employeeCard = cardsByEmployeeName.get(emp.Name);
                    var managerCard = cardsByEmployeeName.get(manager.Name);
                    
                    if (employeeCard && managerCard) {
                        // Check if the employee card is in the correct hierarchy
                        var parentCard = this.findParentCardElement(employeeCard);
                        if (parentCard) {
                            var parentName = parentCard.querySelector('.employee-name');
                            if (parentName) {
                                var parentNameText = parentName.textContent.trim();
                                if (parentNameText !== manager.Name) {
                                    console.warn('Hierarchy mismatch:', emp.Name, 
                                               'is showing under', parentNameText, 
                                               'but should be under', manager.Name);
                                    inconsistencies++;
                                }
                            }
                        }
                    }
                }
            }
        }.bind(this));
        
        if (inconsistencies > 0) {
            console.error('Found', inconsistencies, 'hierarchy inconsistencies that need to be fixed');
        } else {
            console.log('No hierarchy inconsistencies found. Organization chart is displayed correctly.');
        }
    },
    
    findParentCardElement: function(cardElement) {
        // Navigate up to find the branch container
        var branchContainer = cardElement.closest('.branch-container');
        if (!branchContainer) {
            return null;
        }
        
        // Navigate up to direct-reports and then to parent node
        var directReports = branchContainer.closest('.direct-reports');
        if (!directReports) {
            return null;
        }
        
        // Find the parent employee-node or employee-node-root
        var parentNode = directReports.closest('.employee-node, .employee-node-root');
        if (!parentNode) {
            return null;
        }
        
        // Return the parent card
        return parentNode.querySelector('.employee-card');
    },
    
    // Method for zooming
    updateZoomLevel: function(component, newZoomLevel) {
        component.set('v.zoomLevel', newZoomLevel);
        var container = document.querySelector('.org-hierarchy-container');
        if (container) {
            container.style.transform = 'scale(' + newZoomLevel/100 + ')';
        }
    },
    
    // Training filtering methods
    filterEmployeesByTraining: function(component, courseName) {
        console.log('Filtering by training course:', courseName);
        // Implementation would connect to backend for filtering
    },
    
    toggleCompletedTrainingDisplay: function(component, showCompleted) {
        console.log('Toggling completed training display:', showCompleted);
        // Implementation would update UI accordingly
    },
    
    togglePastDueHighlighting: function(component, highlightPastDue) {
        console.log('Toggling past due highlighting:', highlightPastDue);
        // Implementation would update UI accordingly
    }
})