global class QuoteDeepClone {
    
    @InvocableMethod (label='Deep Clone')
    public static void DeepClone(List<InputVariables> InputVariables) {

        Id oldRecordId = InputVariables.get(0).recordId;
        deepClone.deepCloneRecord('quote__c', oldRecordId, 'box__c', 'quote__r.id', 'Part__c', 'box__r.id', null);
        
    }
    public class InputVariables{
        @invocableVariable
        public Id recordId;
    }
}