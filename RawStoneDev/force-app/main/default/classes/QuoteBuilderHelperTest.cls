@isTest
public class QuoteBuilderHelperTest 
{
    @TestSetup
    static void makeData()
    {
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
    static void retrieveBoxAndPartTest()
    {
        Quote__c quote = [SELECT Id FROM Quote__c LIMIT 1];

        Test.startTest();
			QuoteBuilderHelper.retrieveBoxAndPart(quote.Id);
        Test.stopTest();
    }

	@IsTest
	static void retrieveGameComponentTest()
	{
		Test.startTest();
			QuoteBuilderHelper.retrieveGameComponent();
		Test.stopTest();
	}

	@IsTest
	static void saveNewBoxTest()
	{
		Box__c box = [SELECT Id, Quote__c FROM Box__c LIMIT 1];
		Part__c part = [SELECT Id, Quantity__c FROM Part__c LIMIT 1];
		Product2 gameComp = [SELECT Id FROM Product2 LIMIT 1];
		System.debug('TEST part Id: ' + part.Id);

		Map<Object, Object> newPartMap = new Map<Object, Object>{
			'Id' => gameComp.Id,
			'Name' => 'TestName'
		};
		System.debug('TEST newPartMap: ' + newPartMap);

		Map<Object, Object> partsMap = new Map<Object, Object>{
			'Id' => part.Id,
			'GameComponent__r' => newPartMap,
			'Quantity__c' => part.Quantity__c,
			'DevelopingCNY__c' => 20,
			'PlateChangeCNY__c' => 30,
			'Dimension__c' => 'Dimension',
			'Printing__c' => '4/0c',
			'Material__c' => 'Test',
			'Finish__c' => 'Test',
			'Remark__c' => 'Test',
			'PriceQ1CNY__c' => 2, 
			'PriceQ2CNY__c' => 2, 
			'PriceQ3CNY__c' => 2, 
			'PriceQ4CNY__c' => 2, 
			'PriceQ5CNY__c' => 2,
			'Box__c' => box.Id
		};

		List<Object> partList = new List<Object>();
		partList.add(partsMap);

		Map<Object, Object> newBox = new Map<Object, Object>{
			'Q1__c' => 10,
			'Q2__c' => 20,
			'Q3__c' => 30,
			'Q4__c' => 40,
			'Q5__c' => 50,
			'Parts__r' => partList
		};

		Test.startTest();
			QuoteBuilderHelper.saveNewBox(newBox, box.Quote__c, 'Box Modified');
			QuoteBuilderHelper.saveNewBox(newBox, box.Quote__c, 'Cloned');
		Test.stopTest();
		
	}

	@IsTest
	static void saveNewPartTest()
	{
		Box__c box = [SELECT Id, Quote__c FROM Box__c LIMIT 1];
		Part__c part = [SELECT Id, Quantity__c FROM Part__c LIMIT 1];
		Product2 gameComp = [SELECT Id FROM Product2 LIMIT 1];

		Map<Object, Object> newPartMap = new Map<Object, Object>{
			'Id' => gameComp.Id,
			'Name' => 'TestName'
		};

		Map<Object, Object> partsMap = new Map<Object, Object>{
			'Id' => part.Id,
			'GameComponent__r' => newPartMap,
			'Quantity__c' => part.Quantity__c,
			'DevelopingCNY__c' => 20,
			'PlateChangeCNY__c' => 30,
			'Dimension__c' => 'Dimension',
			'Printing__c' => '4/0c',
			'Material__c' => 'Test',
			'Finish__c' => 'Test',
			'Remark__c' => 'Test',
			'PriceQ1CNY__c' => 2, 
			'PriceQ2CNY__c' => 2, 
			'PriceQ3CNY__c' => 2, 
			'PriceQ4CNY__c' => 2, 
			'PriceQ5CNY__c' => 2,
			'Box__c' => box.Id
		};

		List<Object> partList = new List<Object>();
		partList.add(partsMap);

		Test.startTest();
			QuoteBuilderHelper.saveNewPart(partList, box.Quote__c, box.Id, 'SaveAllNewParts');
			QuoteBuilderHelper.saveNewPart(partList, box.Quote__c, box.Id, 'UpdateAllParts');
		Test.stopTest();
	}

	@IsTest
	static void deleteBoxTest()
	{
		Box__c box = [SELECT Id, Quote__c FROM Box__c LIMIT 1];

		Test.startTest();
			QuoteBuilderHelper.deleteBox(box.Id);
		Test.stopTest();
	}

	@IsTest
	static void deletePartTest()
	{
		Part__c part = [SELECT Id, Quantity__c FROM Part__c LIMIT 1];

		Test.startTest();
			QuoteBuilderHelper.deletePart(part.Id);
		Test.stopTest();
	}
    
    @IsTest
    static void updateQuoteTest()
    {
        Quote__c quote = [SELECT Id FROM Quote__c LIMIT 1];
        Test.startTest();
        QuoteBuilderHelper.updateQuote(quote.Id, '10', '20', '2', '10');
        QuoteBuilderHelper.createNewGame('New Game');
        QuoteBuilderHelper.createNewGame('');

        Test.stopTest();
    }
    
    @IsTest
    static void createNewGameFromPartTest()
    {
        Box__c box = [SELECT Id, Quote__c FROM Box__c LIMIT 1];
		Part__c part = [SELECT Id, Quantity__c FROM Part__c LIMIT 1];
		Product2 gameComp = [SELECT Id FROM Product2 LIMIT 1];

		Map<Object, Object> newPartMap = new Map<Object, Object>{
			'Id' => gameComp.Id,
			'Name' => 'TestName'
		};

		Map<Object, Object> partsMap = new Map<Object, Object>{
			'Id' => part.Id,
			'GameComponent__r' => newPartMap,
			'Quantity__c' => part.Quantity__c,
			'DevelopingCNY__c' => 20,
			'PlateChangeCNY__c' => 30,
			'Dimension__c' => 'Dimension',
			'Printing__c' => '4/0c',
			'Material__c' => 'Test',
			'Finish__c' => 'Test',
			'Remark__c' => 'Test',
			'PriceQ1CNY__c' => 2, 
			'PriceQ2CNY__c' => 2, 
			'PriceQ3CNY__c' => 2, 
			'PriceQ4CNY__c' => 2, 
			'PriceQ5CNY__c' => 2,
			'Box__c' => box.Id
		};

		Map<Object, Object> partsMap2 = new Map<Object, Object>{
			'Id' => part.Id,
			'GameComponent__r' => newPartMap,
			'GameComponent__c' => newPartMap.get('Id'),
			'Quantity__c' => part.Quantity__c,
			'DevelopingCNY__c' => 20,
			'PlateChangeCNY__c' => 30,
			'Dimension__c' => 'Dimension',
			'Printing__c' => '4/0c',
			'Material__c' => 'Test',
			'Finish__c' => 'Test',
			'Remark__c' => 'Test',
			'PriceQ1CNY__c' => 2, 
			'PriceQ2CNY__c' => 2, 
			'PriceQ3CNY__c' => 2, 
			'PriceQ4CNY__c' => 2, 
			'PriceQ5CNY__c' => 2,
			'Box__c' => box.Id
		};

		List<Object> partList = new List<Object>();
		partList.add(partsMap);
        Map<Object, Object> mapDefinitive = new Map<Object, Object>{'Test' => partsMap};
        Map<Object, Object> mapDefinitive2 = new Map<Object, Object>{'Test' => partsMap2};
        
        Test.startTest();
        	QuoteBuilderHelper.createNewGameFromPart(mapDefinitive, box.Quote__c, box.Id, 'SaveAllNewParts');
        	QuoteBuilderHelper.createNewGameFromPart(mapDefinitive, box.Quote__c, box.Id, 'UpdateAllParts');
        	QuoteBuilderHelper.createNewGameFromPart(mapDefinitive2, box.Quote__c, box.Id, 'SaveAllNewParts');
        Test.stopTest();
    }



}