public class ClearUICache {
    @AuraEnabled
    public static void clearCache() {
        // This method doesn't need to do anything - 
        // just calling it will force a cache refresh
        System.debug('Clearing UI cache for EmployeeOrgChart components');
    }
}