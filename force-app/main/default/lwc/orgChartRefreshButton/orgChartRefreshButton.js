import { LightningElement, track } from 'lwc';
import refreshCache from '@salesforce/apex/RefreshOrgChartCache.refreshCache';

export default class OrgChartRefreshButton extends LightningElement {
    @track isRefreshing = false;
    @track showSuccess = false;
    @track showError = false;
    @track errorMessage = '';
    
    refreshCache() {
        // Reset states
        this.isRefreshing = true;
        this.showSuccess = false;
        this.showError = false;
        
        refreshCache()
            .then(() => {
                // Success
                this.isRefreshing = false;
                this.showSuccess = true;
                
                // Auto-hide success message after 3 seconds
                setTimeout(() => {
                    this.showSuccess = false;
                }, 3000);
            })
            .catch(error => {
                // Error
                this.isRefreshing = false;
                this.showError = true;
                this.errorMessage = error.body ? error.body.message : 'Unknown error refreshing cache';
            });
    }
}