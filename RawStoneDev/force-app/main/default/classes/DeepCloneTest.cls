@IsTest
public class DeepCloneTest 
{
	@TestSetup
    static void makeData()
    {
        Account testAccount = new Account(Name = 'Test Account', Description = 'Test Description'); insert testAccount;
        
        Product2 gameComp = new Product2(
			Name = 'Test Game Component',
			IsActive = true
		);
		insert gameComp;

		Opportunity oppty = new Opportunity(
			Name = 'Test Oppty',
			StageName = 'Closed Won',
			Commission__c = 20,
			CloseDate = Date.today()+10
		);
		insert oppty;

        Quote__c quote = new Quote__c(
			Project__c = oppty.Id
		);
		insert quote;

        Box__c box = new Box__c(
			Quote__c = quote.Id
        );
        insert box;

		Part__c part = new Part__c(
			Box__c = box.Id,
			Quantity__c = 10
		);
		insert part;
    }
    
    @IsTest
    static void deepCloneRecordTest()
    {
		Part__c part = [SELECT Id, Box__c, Box__r.Quote__c FROM Part__c LIMIT 1];

        Test.startTest();
			deepClone.deepCloneRecord('Quote__c', part.Box__r.Quote__c, 'Box__c', 'Quote__r.Id', 'Part__C', 'Box__r.Quote__r.Id', '0');
		Test.stopTest();
    }

}