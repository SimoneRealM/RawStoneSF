public class QuotePDFController {
    
    public String currentRecordId {get;set;}
    public list<Box__c> boxes{get;set;}
    public list<Box__c> allBoxes{get;set;}
    public Quote__c quotes{get;set;}
    public list<String> terms{get;set;}
    
    public QuotePDFController() 
    {
    	this.currentRecordId  = ApexPages.CurrentPage().getparameters().get('id');
        
        boxes = [SELECT Id, Quote__c, Name,
                 		TotalPriceFUPQ1__c, TotalPriceFUPQ2__c,TotalPriceFUPQ3__c,TotalPriceFUPQ4__c,TotalPriceFUPQ5__c,
                        TotalPriceCNYQ1__c, TotalPriceCNYQ2__c, TotalPriceCNYQ3__c, TotalPriceCNYQ4__c, TotalPriceCNYQ5__c,
                 		Q1__c, Q2__c, Q3__c,Q4__c , Q5__c, Quote__r.ExchangeRate__c,
                 		PriceQ1FUP__c, PriceQ2FUP__c, PriceQ3FUP__c, PriceQ4FUP__c, PriceQ5FUP__c,
                 		DevelopingFUP__c, PlateChangeFUP__c,
                        DevelopingCNY__c, PlateChangeCNY__c,
                 (SELECT Name, Index__c, GameComponent__c, Dimension__c, Printing__c, Material__c, Finish__c, Quantity__c, UnitOfMeasure__c, box__r.Quote__r.ExchangeRate__c, GameComponent__r.Name,
                  		Remark__c, DevelopingFUP__c, PlateChangeFUP__c, PriceQ1FUP__c, PriceQ2FUP__c, PriceQ3FUP__c, PriceQ4FUP__c, PriceQ5FUP__c FROM Parts__r ORDER BY Index__c asc) 
                 FROM Box__c 
                 WHERE Quote__c =:currentRecordId
                ];
        
        allBoxes = [SELECT Id, name, Quote__c, Quote__r.TotalPriceQ1FUP__c, Quote__r.TotalPriceQ2FUP__c, Quote__r.TotalPriceQ3FUP__c, Quote__r.TotalPriceQ4FUP__c, Quote__r.TotalPriceQ5FUP__c,
                    		Quote__r.TotalPlateChange__c, PlateChangeFUP__c, Quote__r.TotalDeveloping__c, DevelopingFUP__c, 
                    		TotalPriceFUPQ1__c, TotalPriceFUPQ2__c, TotalPriceFUPQ3__c, TotalPriceFUPQ4__c, TotalPriceFUPQ5__c,
                    		Q1__c, Q2__c, Q3__c,Q4__c , Q5__c
                    FROM Box__c 
                    WHERE Quote__c =:currentRecordId
                   ];
        
        quotes = [SELECT id, ExchangeRate__c, Name, createddate, LastModifiedBy.Name, toLabel(Terms__c), ExpirationDate__c, BillingAddress__c,
                  	 	 TotalPriceQ1FUP__c, TotalPriceQ2FUP__c, TotalPriceQ3FUP__c, TotalPriceQ4FUP__c, TotalPriceQ5FUP__c,
                         TotalPriceQ1CNY__c, TotalPriceQ2CNY__c, TotalPriceQ3CNY__c, TotalPriceQ4CNY__c, TotalPriceQ5CNY__c,
                  		 TotalDeveloping__c, TotalPlateChange__c,
                         TotalDevelopingCNY__c, TotalPlateChangeCNY__c,
                         Project__r.Account.name, Project__r.Project_Code__c,
                         Project__r.Account.BillingStreet, Project__r.Account.BillingCity, Project__r.Account.BillingState, Project__r.Account.BillingPostalCode
                  FROM Quote__c 
                  WHERE id =:currentRecordId];
        
        String termsInline = string.valueof(quotes.Terms__c);
        if(String.isNotEmpty(termsInline)) terms = termsInline.split(';');
        system.debug('terms: '+terms);
    }
    
	@AuraEnabled
    public List<Box__c> getBoxes(){
        return boxes;
    }
    
    public List<Box__c> getAllBoxes(){
        return allBoxes;
    }
    
    public PageReference partUpdate() 
    {
        list<Part__c> partToUpdate = new list<Part__c>();
        for(Box__c b:boxes){
            for(Part__c p : b.Parts__r){
                partToUpdate.add(p);
                system.debug('dimension: '+p.Dimension__c);
            }
        }
        //system.debug('list to update: '+partToUpdate);
        //update partToUpdate;
        return null;
    }
}