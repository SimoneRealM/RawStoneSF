@isTest
public class QuotePDFControllerTest 
{

    @isTest
    static void makeData() 
    {
        // Create a test Account record
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        // Create a test Opportunity record related to the test Account
        Opportunity testOpportunity = new Opportunity(
            AccountId = testAccount.Id,
            Name = 'Test Opportunity',
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30),
            Commission__c = 10.0
        );
        insert testOpportunity;

        Quote__c testQuote = new Quote__c(
            Project__c = testOpportunity.Id,
            Terms__c = '1;2;3;4'
        );
        insert testQuote;

        // Create a test Box record related to the test Quote
        Box__c testBox = new Box__c(Quote__c = testQuote.Id, Name = 'Test Box');
        insert testBox;

        // Create a test Part record related to the test Box
        Part__c testPart = new Part__c(
            Box__c = testBox.Id,
            Quantity__c = 1
        );
        insert testPart;
        
		ApexPages.currentPage().getParameters().put('id', testQuote.Id);
        QuotePDFController controller = new QuotePDFController();
        Test.startTest();
        	controller.getBoxes();
        	controller.getAllBoxes();
        	controller.partUpdate();
        Test.stopTest();
        
    }
    
}