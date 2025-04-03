#!/bin/bash

# Exit on any error
set -e

# Deploy only UI components
echo "Deploying UI components..."
sfdx force:source:deploy -p force-app/main/default/aura

echo "
IMPORTANT: After deployment, users may need to clear their browser cache to see the changes.
Navigate to Lightning Component > Developer Console > Clear Cache to enforce UI refresh."

# Create a script to refresh the cache
echo "
Creating a script to refresh the cache..."

# Deploy the cache refresh class
echo "Deploying the cache refresh class..."
sfdx force:source:deploy -p force-app/main/default/classes/RefreshOrgChartCache.cls -u i360Dev

echo "Deployment complete!"