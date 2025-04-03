#!/bin/bash

# Exit on any error
set -e

# Deploy metadata
sfdx force:source:deploy -p force-app

# Run any post-deployment scripts if needed
# For example, create sample data
sfdx force:apex:execute -f scripts/apex/createSampleData.apex

echo "Deployment completed successfully!"