# Employee Organization Chart - Salesforce DX Project

A Salesforce application for visualizing the organizational structure of employees within the company.

## Overview

This project implements a dynamic organizational chart that visually represents the employee hierarchy. The chart utilizes color-coding to distinguish between different departments and supports both regular employees and contractors.

## Key Features

- Interactive organizational hierarchy visualization
- Color-coded departments for easy identification
- Support for collapsible/expandable nodes
- Different styling for FTE vs. Contractor employees
- Detailed employee information panel

## Department Color Scheme

The application uses the following color scheme to differentiate departments:

| Department     | Border Color | Background Color | Description               |
|----------------|--------------|------------------|---------------------------|
| Data Cloud     | #F5C93D      | #FFFAED          | Yellow                    |
| Viz            | #98CEF5      | #F4FAFF          | Blue                      |
| Snowflake      | #87CEFA      | #F0F8FF          | Green                     |
| EDH            | #E0B1E0      | #FCF5FC          | Purple/Pink               |
| Data Tools     | #9FD19F      | #F5FFF5          | Light Blue                |
| Core Infra     | #B8B8D1      | #F8F8FF          | Light Blue                |
| Indirect Labor | #A9A9A9      | #F0F0F0          | Grey                      |

## Deployment

To deploy this project to a Salesforce org:

```bash
# Deploy all components
./deploy.sh

# Deploy only UI components
./deploy-ui-update.sh

# Clear the cache after deployment
sfdx force:apex:execute -f scripts/refresh-cache.apex -u your-org-alias
```

## Development

This project follows the standard Salesforce DX project structure:

```
force-app/
├── main/
│   └── default/
│       ├── aura/             # Lightning Aura components
│       ├── classes/          # Apex classes
│       ├── lwc/              # Lightning Web Components
│       └── objects/          # Custom objects and fields
```

## Maintenance

For details on maintaining and extending this application, see the [MAINTENANCE_GUIDE.md](MAINTENANCE_GUIDE.md) file.

## Color Configuration

The color scheme can be updated by modifying the CSS files:
- `force-app/main/default/aura/EmployeeNode/EmployeeNode.css`
- `force-app/main/default/aura/EmployeeOrgChart/EmployeeOrgChart.css`

See [color-mapping.txt](color-mapping.txt) for detailed color assignments.