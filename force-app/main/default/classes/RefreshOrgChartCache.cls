public class RefreshOrgChartCache {
    @AuraEnabled
    public static void refreshCache() {
        // This method doesn't need to do anything - 
        // just calling a server-side method will force a cache refresh
        System.debug('Refreshing cache for EmployeeOrgChart components');
    }
}
