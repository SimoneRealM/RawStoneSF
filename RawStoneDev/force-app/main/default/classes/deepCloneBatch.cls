public class deepCloneBatch implements Database.Batchable<SObject>, Database.Stateful {
    private String      parentApiName;
    private Id 	        oldParentId;
    private Id 	        newParentId;
    private String      childApiName;
    private String      childRelApiName;
    private String      grandchildApiName;
    private String      grandchildRelApiName;
    private String      initParameter;
    private Map<Id, Id> oldToNewIdMap  = new Map<Id, Id>();
    List <String>       oldChildrenIds = new List<String>();

    public deepCloneBatch(String parentApiName,Id oldParentId, Id newParentId, String childApiName, String childRelApiName, String grandchildApiName, String grandchildRelApiName, String initParameter) {
        this.parentApiName        = parentApiName;
        this.oldParentId          = oldParentId;
        this.newParentId          = newParentId;
        this.childApiName         = childApiName;
        this.childRelApiName      = childRelApiName;
        this.grandchildApiName    = grandchildApiName;
        this.grandchildRelApiName = grandchildRelApiName;
        this.initParameter        = initParameter == null ? '0' : initParameter;
    }

    public deepCloneBatch(String parentApiName,Id oldParentId, Id newParentId, String childApiName, String childRelApiName, String grandchildApiName, String grandchildRelApiName, String initParameter, Map<Id,Id> oldToNewIdMap, List<String> oldChildrenIds) {
        this.parentApiName        = parentApiName;
        this.oldParentId          = oldParentId;
        this.newParentId          = newParentId;
        this.childApiName         = childApiName;
        this.childRelApiName      = childRelApiName;
        this.grandchildApiName    = grandchildApiName;
        this.grandchildRelApiName = grandchildRelApiName;
        this.initParameter        = initParameter == null ? '0' : initParameter;
        this.oldToNewIdMap        = oldToNewIdMap;
        this.oldChildrenIds       = oldChildrenIds;
    }

    public Database.QueryLocator start(Database.BatchableContext bc) 
    {
        String queryString = '';
        try
        {
            System.debug('childApiName: ' + childApiName);
            if(initParameter == '0')
            {
                System.debug('child context');
                queryString =   'SELECT ' + 
        				    deepClone.getAllFields(childApiName) + 
            				' FROM '  + childApiName    + 
            				' WHERE ' + childRelApiName + ' = :oldParentId';
            	System.debug('queryString: ' + queryString);
            }
            else
            {
                System.debug('dentro else');
                queryString =   'SELECT ' + 
                                deepClone.getAllFields(grandchildApiName) + 
                                ' FROM '  + grandchildApiName    + 
                                ' WHERE ' + grandchildRelApiName + ' IN (' + '\'' + String.join(oldChildrenIds, '\',\'') + '\'' + ')';
                System.debug('last query ' + queryString);
                System.debug('oldToNewIdMap numero chiavi ' + oldToNewIdMap.keySet().size());
                System.debug('oldChildrenIds numero nipoti ' + oldChildrenIds.size());
                System.debug('oldChildrenIds ' + oldChildrenIds.toString());
            }
        }
        catch(Exception ex)
        {
            System.debug('Exception: ' + ex.getMessage());
        }
       
        
		return Database.getQueryLocator(queryString);
    }

    public void execute(Database.BatchableContext bc, List<SObject> records) {
        //##### CLONAZIONE FIGLI #####
        if(initParameter == '0'){ 					
            List<SObject> childToClone = new List<SObject>();
            
            for (Integer i = 0;  i < records.size(); i++){
                SObject clonedChild = records[i].clone(false, true, false, false);
                System.debug('clonedChild: ' + clonedChild);
                clonedChild.put(parseIdField(childRelApiName), newParentId); 
                oldChildrenIds.add(records[i].Id);
                childToClone.add(clonedChild);
            } 
            System.debug('childToClone: ' + childToClone);
            
            if (!childToClone.isEmpty()) {
                insert childToClone;
                for (Integer i = 0; i < records.size(); i++) {
                    oldToNewIdMap.put((Id)records[i].get('Id'), childToClone[i].Id);
                }
            }
        //##### CLONAZIONE NIPOTI #####    
        }else{ 					                    
            List<SObject> grandchildToClone = new List<SObject>();
            
            for (Integer i = 0;  i < records.size(); i++){
                SObject clonedGrandchild = records[i].clone(false, true, false, false);
                clonedGrandchild.put(parseIdField(grandchildRelApiName), oldToNewIdMap.get((Id)records[i].get(parseIdField(grandchildRelApiName)))); 
                grandchildToClone.add(clonedGrandchild);
            } 
            
            if (!grandchildToClone.isEmpty()) {
                insert grandchildToClone;
            }            
        }
    }

    public void finish(Database.BatchableContext bc) {
        if(initParameter == '0'){           //contesto figlio
            String jobID = Database.executeBatch(new deepCloneBatch(parentApiName, oldParentId, newParentId, childApiName, childRelApiName, grandchildApiName, grandchildRelApiName, '1', oldToNewIdMap, oldChildrenIds));
        }else if(initParameter == '1'){     //contesto nipote
            deepCloneDone__e cloneDoneEvent = new deepCloneDone__e(NewObjId__c = newParentId);
            EventBus.publish(cloneDoneEvent);
        }else if(initParameter == '2'){     //clone solo figlio
            deepCloneDone__e cloneDoneEvent = new deepCloneDone__e(NewObjId__c = newParentId);
            EventBus.publish(cloneDoneEvent);
        }
    }

    public static String parseIdField(String idField){
        if(idField.contains('__r')){
            return (idField.split('__r')[0] + '__c');
        }else{
            return idField.replace('.', '');
        }
    }
}