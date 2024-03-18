public class deepClone {
    
    /*
        Class Usage Overview

        This class facilitates the cloning of all children and, if needed, grandchildren associated with a primary record.

        ### PARAMETERS EXPLANATION

        parentApiName        : API Name of the primary record for cloning.                            (Example: Parent__c)
        parentId             : ID of the primary record to clone.                                     (Example: a1234567890123)
        childApiName         : API Name of the child records to clone.                                (Example: Child__c)
        childRelApiName      : API Name of the lookup relationship pointing to the parent ID.         (Example: LookupToParent__r.Id)
        grandchildApiName    : API Name of the grandchildren records to clone.                        (Example: Grandchild__c)
        grandchildRelApiName : API Name of the lookup relationship pointing to the child ID.          (Example: LookupToChild__r.Id)
        inputParameter       : 
                null: 'Clone both Children and Grandchildren'
                '2' : 'Clone only Children'

        ### RESULT HANDLING

        Upon completion, a deepCloneDone__e event is triggered after cloning the last grandchild or child, based on the input parameter.
    */


    public static void deepCloneRecord(String parentApiName, Id parentId, String childApiName, String childRelApiName, String grandchildApiName, String grandchildRelApiName, String inputParameter) {
        SObject parentRecord = Database.query('SELECT ' + getAllFields(parentApiName) + ' FROM ' + parentApiName + ' WHERE Id = :parentId');
        SObject clonedParent = parentRecord.clone(false, true, false, false);
        insert clonedParent;
        String jobID = Database.executeBatch(new deepCloneBatch(parentApiName, parentId,clonedParent.Id, childApiName, childRelApiName, grandchildApiName, grandchildRelApiName, inputParameter));
    }

    public static String getAllFields(String objectName) {
        String query = '';
        Map<String, Schema.SObjectField> fields = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
        System.debug('field: ' + fields);
        for (String fieldName : fields.keySet()) {
            query += (query.length() > 0 ? ', ' : '') + fieldName;
        }
        System.debug('query: ' + query);
        return query;
    }
}