# Contributing to the Employee Org Chart

Thank you for your interest in contributing to the Employee Org Chart project! This guide will help you get started with the development process and explain how to contribute effectively.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Code Style and Standards](#code-style-and-standards)
6. [Testing](#testing)
7. [Submitting Changes](#submitting-changes)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli) - Latest version
- [Git](https://git-scm.com/downloads) - Latest version
- [Visual Studio Code](https://code.visualstudio.com/) with [Salesforce Extension Pack](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode) installed
- [Node.js](https://nodejs.org/) - LTS version

### Cloning the Repository

```bash
# Clone the repository
git clone https://github.com/YallappaH/EmployeeOrgChart-SFDX.git
cd EmployeeOrgChart-SFDX

# Install dependencies
npm install
```

## Development Environment

### Setting Up a Scratch Org

```bash
# Create a scratch org
sf org create scratch -f config/project-scratch-def.json -a OrgChartDev

# Push the source to your scratch org
sf project deploy start

# Import sample data (if available)
sf data import tree -p data/Employee__c-plan.json

# Open the scratch org
sf org open
```

### Setting Up an Existing Org

```bash
# Authenticate with your org
sf org login web -a YourOrgAlias

# Deploy the source to your org
sf project deploy start -o YourOrgAlias
```

## Project Structure

The project follows the standard Salesforce DX structure:

```
EmployeeOrgChart-SFDX/
├── force-app/               # Main source directory
│   └── main/default/
│       ├── aura/           # Aura components
│       ├── classes/        # Apex classes
│       ├── lwc/            # Lightning Web Components
│       └── objects/        # Custom objects and fields
├── scripts/                # Utility scripts
├── config/                 # Configuration files
├── data/                   # Sample data files
└── README.md               # Project documentation
```

### Key Components

- **EmployeeNode** - The recursive component that displays each employee in the hierarchy
- **EmployeeOrgChart** - The main container component for the org chart
- **EmployeeOrgChartController** - The Apex controller providing data to the UI

## Development Workflow

1. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**

   - Develop and test your changes in your scratch org
   - Follow the code style guidelines
   
3. **Pull the Latest Changes**

   ```bash
   git pull origin main
   ```

4. **Merge Conflicts (if any)**

   - Resolve any merge conflicts
   - Test again after resolving conflicts

5. **Push Your Branch**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**

   - Open a pull request on GitHub
   - Fill in the pull request template
   - Wait for code review and approval

## Code Style and Standards

### Apex Standards

- Follow [Salesforce Apex Code Style Guide](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_dev_guide.htm)
- Use meaningful variable and method names
- Include ApexDocs for classes and methods
- Write SOQL queries with proper filtering
- Include error handling in all operations

### JavaScript Standards

- Follow ESLint recommendations
- Use modern JavaScript (ES6+) syntax
- Keep component files under 500 lines if possible
- Use meaningful variable and function names
- Comment complex logic

### CSS Standards

- Follow BEM naming conventions where appropriate
- Use SLDS classes where possible
- Custom CSS should be minimal and well-documented

## Testing

### Apex Tests

- All Apex classes should have corresponding test classes
- Test classes should aim for 85%+ code coverage
- Test positive and negative scenarios
- Use proper asserts to validate behavior

### Lightning Component Testing

- Test component behavior manually in different contexts
- Document edge cases and how they're handled

### Running Tests

```bash
# Run all tests
sf apex test run --code-coverage -r human

# Run specific test class
sf apex test run -t EmployeeOrgChartControllerTest -r human
```

## Submitting Changes

### Pull Request Process

1. Ensure your code is properly tested
2. Update documentation if needed
3. Create a pull request with a clear description
4. Reference any related issues
5. Wait for code review and address any feedback
6. Once approved, your PR will be merged

### Contribution Guidelines

- Keep contributions focused on a single feature or bug fix
- Follow the existing code style
- Include tests for new functionality
- Update documentation as needed
- Be respectful and constructive in code reviews

## Questions?

If you have any questions or need help, please create an issue on GitHub or reach out to the project maintainers directly.

Thank you for contributing to the Employee Org Chart project!
