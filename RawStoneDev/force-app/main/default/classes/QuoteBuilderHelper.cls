public with sharing class QuoteBuilderHelper 
{
	@AuraEnabled
	public static Map<String, Object> retrieveBoxAndPart(String recordId)
	{
		System.debug('retrieveBoxAndPart Start Method');
		System.debug('quoteId: ' + recordId);
		Map<String, Object> mapReturn = new Map<String, Object>();
		try 
		{
			Map<Id, Box__c> mapBox = new Map<Id, Box__c>();
			Map<Box__c, Part__c> mapBoxPart = new Map<Box__c, Part__c>();
			List<Box__c> boxList = [SELECT Id, Name, Q1__c, Q2__c, Q3__c, Q4__c, Q5__c FROM Box__c WHERE Quote__c =: recordId];
			/*for(Box__c box: boxList) mapBox.put(box.Id, box);
			List<Part__c> partList = [SELECT Id, Box__c, GameComponent__c, Dimension__c, Printing__c, Material__c, Finish__c, Quantity__c, UnitOfMeasure__c, Remark__c, DevelopingCNY__c, PlateChangeCNY__c, 
											PriceQ1CNY__c, PriceQ2CNY__c, PriceQ3CNY__c, PriceQ4CNY__c, PriceQ5CNY__c 
									FROM Part__c WHERE Box__c IN: mapBox.KeySet()];*/

			
			/*mapReturn.put('BoxList', boxList);
			mapReturn.put('PartList', partList);*/

			List<Box__c> boxListTest = [SELECT Id, Name, Q1__c, Q2__c, Q3__c, Q4__c, Q5__c,
										(SELECT Id, Box__c, Index__c, GameComponent__r.Name, Dimension__c, Printing__c, PrintingTxt__c, Material__c, Finish__c, FinishTxt__c, Quantity__c, UnitOfMeasure__c, Remark__c, 
											DevelopingCNY__c, PlateChangeCNY__c, PriceQ1CNY__c, PriceQ2CNY__c, PriceQ3CNY__c, PriceQ4CNY__c, PriceQ5CNY__c 
											FROM Parts__r ORDER BY Index__c ASC
										) 
										FROM Box__c WHERE Quote__c =: recordId ORDER BY CreatedDate ASC];
			System.debug('boxListTest: ' + boxListTest);
			for(Box__c box: boxListTest)
			{
				System.debug('box: ' + box);
				mapBox.put(box.Id, box);
			}
			mapReturn.put('FullBox', mapBox);
			System.debug('mapReturn size' + mapReturn.size());
		} 
		catch (Exception ex) 
		{
			throw new AuraHandledException(ex.getMessage());
		}
		return mapReturn;
	}

	@AuraEnabled
	public static Map<String, List<Product2>> retrieveGameComponent()
	{
		Map<String, List<Product2>> mapGame = new Map<String, List<Product2>>();
		try 
		{ 
			mapGame.put('GameList', [SELECT Id, Name FROM Product2 ORDER BY Name ASC]);
		} 
		catch (Exception e) 
		{
			throw new AuraHandledException(e.getMessage());
		}
		return mapGame;
	}

	@AuraEnabled
	public static Map<String, Object> saveNewBox(Object newBox, String quoteId, String context)
	{
		System.debug('SaveNewBox Start Method - Context: ' + context);
		Map<String, Object> mapResponse = new Map<String, Object>();
		try 
		{
			System.debug('newBox: ' + newBox);
			System.debug('quoteId: ' + quoteId);
			Map<Object, Object> newBoxMap = (Map<Object, Object>)newBox;
			System.debug('newBoxMap: ' + newBoxMap);
			List<Part__c> partList = new List<Part__c>();
			if('ClonedBox'.equalsIgnoreCase(context))
			{
				return cloneBox(newBoxMap);
			}
			else 
			{
				System.debug('newBoxMap: ' + newBoxMap);
				String name = 'Cloned'.equalsIgnoreCase(context) ? 'New Box Cloned' : (String)newBoxMap.get('Name');
				Decimal quantity1 = String.isBlank((String.valueOf(newBoxMap.get('Q1__c')))) ? 0 : (Decimal.valueOf(String.valueOf(newBoxMap.get('Q1__c'))));
				Decimal quantity2 = String.isBlank((String.valueOf(newBoxMap.get('Q2__c')))) ? 0 : (Decimal.valueOf(String.valueOf(newBoxMap.get('Q2__c'))));
				Decimal quantity3 = String.isBlank((String.valueOf(newBoxMap.get('Q3__c')))) ? 0 : (Decimal.valueOf(String.valueOf(newBoxMap.get('Q3__c'))));
				Decimal quantity4 = String.isBlank((String.valueOf(newBoxMap.get('Q4__c')))) ? 0 : (Decimal.valueOf(String.valueOf(newBoxMap.get('Q4__c'))));
				Decimal quantity5 = String.isBlank((String.valueOf(newBoxMap.get('Q5__c')))) ? 0 : (Decimal.valueOf(String.valueOf(newBoxMap.get('Q5__c'))));
	
				Box__c box = new Box__c
				(
					Id = ('Box Modified'.equalsIgnoreCase(context)) ? String.valueOf(newBoxMap.get('Id')) : null,
					Name  = name,
					Q1__c = quantity1,
					Q2__c = quantity2,
					Q3__c = quantity3,
					Q4__c = quantity4,
					Q5__c = quantity5,
					Quote__c = quoteId
				);
				upsert box;
				
				if(!'Box Modified'.equalsIgnoreCase(context))
				{
					if (newBoxMap.containsKey('Parts__r')) 
					{
						System.debug('parts: ' + newBoxMap.get('Parts__r'));
						Decimal index = 0;
						for(Part__c part: [SELECT Id, Index__c FROM Part__c WHERE QuoteId__c =: quoteId ORDER BY Index__c DESC])
						{
							index = part.Index__c;
						}
	
						for(Object part: (List<Object>)newBoxMap.get('Parts__r'))
						{
							System.debug('part: ' + part);
							System.debug('index clone: ' + (index + 1));
							Map<Object, Object> partMap = (Map<Object, Object>) part;
							partList.add(generateNewPart(part, (String)partMap.get('Id'), box.Id, context, index + 1));
						}
						System.debug('partList: ' + partList);
					}
					if(!partList.isEmpty()) insert partList;
	
					mapResponse.put('PartList', partList);
				}
				mapResponse.put('Box', box);
				mapResponse.put('Status', 200);
			}
		} 
		catch (Exception e) 
		{
			mapResponse.put('Error', e.getMessage());
			throw new AuraHandledException(e.getMessage());
		}
		return mapResponse;
	}

	public static Map<String, Object> cloneBox(Map<Object, Object> newBoxMap)
	{
		System.debug('Clone Box Method Start');
		Map<String, Object> mapResponse = new Map<String, Object>();

		String boxId = (String)((Map<Object, Object>)(((List<Object>)newBoxMap.get('Parts__r'))[0])).get('Box__c');
		System.debug('boxId: ' + boxId);
		Box__c box = [SELECT Id, Name, Q1__c, Q2__c, Q3__c, Q4__c, Q5__c, Quote__c FROM Box__c WHERE Id =: boxId];
		System.debug('box: ' + box);
		Box__c boxCloned = box.clone(false, true, false, false);
		System.debug('boxCloned: ' + boxCloned);
		insert boxCloned;

        List<Part__c> partListCloned = new List<Part__c>();
        for(Part__c part: [SELECT Id, Box__c, Index__c, GameComponent__r.Name, Dimension__c, Printing__c, 
								  Material__c, Finish__c, Quantity__c, UnitOfMeasure__c, Remark__c, DevelopingCNY__c, 
								  PlateChangeCNY__c, PriceQ1CNY__c, PriceQ2CNY__c, PriceQ3CNY__c, PriceQ4CNY__c, PriceQ5CNY__c 
							FROM Part__c WHERE Box__c = :box.Id ORDER BY Index__c ASC])
		{
            Part__c partChild = part.clone(false, true, false, false);
            partChild.Box__c = boxCloned.Id;
            partListCloned.add(partChild);
        }
        System.debug('partListCloned: '+ partListCloned);
        insert partListCloned;

		mapResponse.put('Box', boxCloned);
		mapResponse.put('Status', 200);

		System.debug('Clone Box Method End');
		return mapResponse;
	}

	@AuraEnabled
	public static Map<String, Object> saveNewPart(Object newPart, String quoteId, String boxId, String context)
	{
		System.debug('saveNewPart - context: ' + context);
		Map<String, Object> mapResponse = new Map<String, Object>();
		System.debug('newPart: ' + newPart);
		try 
		{
			List<Part__c> listParts = new List<Part__c>();
			Decimal index = 0; 
			Map<String, Decimal> mapPartIndex = new Map<String, Decimal>();
			//for(Part__c part: [SELECT Id, Index__c FROM Part__c WHERE QuoteId__c =: quoteId ORDER BY Index__c DESC LIMIT 1])
			for(Part__c part: [SELECT Id, Index__c FROM Part__c WHERE QuoteId__c =: quoteId ORDER BY Index__c DESC LIMIT 1])
			{
				//index = part.Index__c;
				mapPartIndex.put(part.Id, part.Index__c);
			}
			System.debug('index: ' + index);
			integer i = 0;
			if('SaveAllNewParts'.equalsIgnoreCase(context)) 
			{
				List<Object> listObjectParts = (List<Object>)newPart;
				System.debug('listObjectParts size: ' + listObjectParts.size());

				for(Object part: listObjectParts)
				{
					Map<Object, Object> newPartMap = (Map<Object, Object>)part;
					System.debug('newPartMap get index: ' + (Decimal)newPartMap.get('Index__c'));
					listParts.add(generateNewPart(part, quoteId, boxId, context, mapPartIndex.get((String)newPartMap.get('Id'))));
					
					/*if(mapPartIndex.containsKey((String)newPartMap.get('Id')))
					{
						listParts.add(generateNewPart(part, quoteId, boxId, context, mapPartIndex.get((String)newPartMap.get('Id'))));
					}
					else 
					{
						System.debug('dentro else');
						listParts.add(generateNewPart(part, quoteId, boxId, context, mapPartIndex.get((String)newPartMap.get('Id'))));
					}*/
					///i++;
				}
				System.debug('listParts:' + listParts);
				upsert listParts;
				mapResponse.put('listParts', listParts);
				System.debug('mapResponse:' + mapResponse);
			}
			else if('UpdateAllParts'.equalsIgnoreCase(context)) 
			{
				List<Object> listObjectParts = (List<Object>)newPart;
				for(Object part: listObjectParts)
				{
					System.debug('part: ' + part);
					listParts.add(generateNewPart(part, quoteId, boxId, 'Edit Part', index == null ? 0 : index + i));
					System.debug('listParts: ' + listParts);
				}
				if(!listParts.isEmpty()) update listParts;
			}
			else 
			{
				Part__c part = generateNewPart(newPart, quoteId, boxId, context, index + 1);
				upsert part;
				mapResponse.put('Part', part);
			}
			System.debug('mapResponse: ' + mapResponse);
			mapResponse.put('Status', 200);
		} 
		catch (Exception e) 
		{
			mapResponse.put('Error', e.getMessage());
			throw new AuraHandledException(e.getMessage());
		}
		return mapResponse;
	}

	@AuraEnabled
	public static Part__c generateNewPart(Object newPart, String quoteId, String boxId, String context, Decimal index)
	{
		System.debug('generateNewPart Start Method - context: ' + context);
		Part__c part = new Part__c();
		try 
		{
			System.debug('newPart: ' + newPart);
			System.debug('Index: ' + index);
			Map<Object, Object> newPartMap = (Map<Object, Object>)newPart;
			System.debug('newPartMap: ' + newPartMap);

			part = new Part__c();
			if('Cloned'.equalsIgnoreCase(context) || 'Edit Part'.equalsIgnoreCase(context))
			{
				System.debug('parts Id: ' + (String)newPartMap.get('Id'));
				System.debug('GameComponent__r: ' + newPartMap.get('GameComponent__r'));
				if('Edit Part'.equalsIgnoreCase(context)) part.Id = (String)newPartMap.get('Id');
				
				Map<Object, Object> gameComponentMap = (Map<Object, Object>) newPartMap.get('GameComponent__r');
				String gameComponentId = (String)gameComponentMap.get('Id');
				String nameGameComponent = (String)gameComponentMap.get('Name');
				System.debug('nameGameComponent: ' + nameGameComponent);
				part.GameComponent__c =  gameComponentId;
				//part.index__c = index;
			}
			else 
			{
				part.GameComponent__c =  String.isBlank((String)newPartMap.get('Component')) ? null : String.valueOf(newPartMap.get('Component')); //commentato 12 gennaio
			}

			System.debug('(startsWith a02? ' + (String)newPartMap.get('Id'));

			//if( ((String)newPartMap.get('Id')).startsWith('a02') && (!'Cloned'.equalsIgnoreCase(context)))  //prod deve essere a04
						
			Schema.DescribeSObjectResult r = Part__c.sObjectType.getDescribe();
			String keyPrefix = r.getKeyPrefix();
			if( ((String)newPartMap.get('Id')).startsWith(keyPrefix) && (!'Cloned'.equalsIgnoreCase(context)))  //prod deve essere a04
			{
				System.debug('dentro 212');
				part.Id = (String)newPartMap.get('Id');
			}
			
			System.debug('Quantity__c : ' + newPartMap.get('Quantity__c') );
			System.debug('DevelopingCNY__c : ' + newPartMap.get('DevelopingCNY__c') );
			System.debug('DevelopingCNY__c is blank? ' + newPartMap.get('DevelopingCNY__c') );
			//part.Quantity__c =        (newPartMap.get('Quantity__c') == null      || String.isBlank((String)newPartMap.get('Quantity__c')))      ? 0 : (Integer)newPartMap.get('Quantity__c'); 
			part.Quantity__c = newPartMap.get('Quantity__c') == null ? 0 : (Decimal)newPartMap.get('Quantity__c'); 
			
			part.DevelopingCNY__c =   newPartMap.get('DevelopingCNY__c') == null ? 0 : (Decimal)newPartMap.get('DevelopingCNY__c'); 
			//part.DevelopingCNY__c =   (Decimal)newPartMap.get('DevelopingCNY__c');
			
			part.PlateChangeCNY__c =   newPartMap.get('PlateChangeCNY__c') == null ? 0 : (Decimal)newPartMap.get('PlateChangeCNY__c'); 
		
			part.Dimension__c =      String.isBlank((String)newPartMap.get('Dimension__c')) ? null : String.valueOf(newPartMap.get('Dimension__c'));
			part.Printing__c =       String.isBlank((String)newPartMap.get('Printing__c')) ? null : String.valueOf(newPartMap.get('Printing__c'));
			part.Material__c =       String.isBlank((String)newPartMap.get('Material__c')) ? null : String.valueOf(newPartMap.get('Material__c'));
			part.Finish__c =         String.isBlank((String)newPartMap.get('Finish__c')) ? null : String.valueOf(newPartMap.get('Finish__c'));
			part.Remark__c =         String.isBlank((String)newPartMap.get('Remark__c')) ? null : String.valueOf(newPartMap.get('Remark__c'));
			
			part.PriceQ1CNY__c =   newPartMap.get('PriceQ1CNY__c') == 0 ? 0 : (Decimal)newPartMap.get('PriceQ1CNY__c'); 
			part.PriceQ2CNY__c =   newPartMap.get('PriceQ2CNY__c') == 0 ? 0 : (Decimal)newPartMap.get('PriceQ2CNY__c'); 
			part.PriceQ3CNY__c =   newPartMap.get('PriceQ3CNY__c') == 0 ? 0 : (Decimal)newPartMap.get('PriceQ3CNY__c'); 
			part.PriceQ4CNY__c =   newPartMap.get('PriceQ4CNY__c') == 0 ? 0 : (Decimal)newPartMap.get('PriceQ4CNY__c'); 
			part.PriceQ5CNY__c =   newPartMap.get('PriceQ5CNY__c') == 0 ? 0 : (Decimal)newPartMap.get('PriceQ5CNY__c'); 
			
			
			System.debug('newPartMap get index: ' + newPartMap.get('Index__c'));
			System.debug('index: ' + index);
			
			//if(index == null || 'SaveAllNewParts'.equalsIgnoreCase(context)) part.Index__c = (Decimal)newPartMap.get('Index__c');
			//if((index == null || 'SaveAllNewParts'.equalsIgnoreCase(context)) && (!'Cloned'.equalsIgnoreCase(context))) { part.Index__c = (Decimal)newPartMap.get('Index__c'); }
			part.Index__c = (Decimal)newPartMap.get('Index__c');
			part.Box__c =            boxId;
		} 
		catch (Exception e) 
		{
			throw new AuraHandledException(e.getMessage());
		}
		return part;
	}

	@AuraEnabled
	public static Map<String, Object> deleteBox(String boxIdToDelete)
	{
		System.debug('deleteBox Start Method.');
		Map<String, Object> mapResponse = new Map<String, Object>();
		try 
		{
			System.debug('boxIdToDelete: ' + boxIdToDelete);
			Box__c boxToDelete = new Box__c(Id = boxIdToDelete);
			delete boxToDelete;
			//mapResponse.put('Box', box);
			mapResponse.put('Status', 200);
		} 
		catch (Exception e) 
		{
			throw new AuraHandledException(e.getMessage());
		}
		return mapResponse;
	}

	@AuraEnabled
	public static Map<String, Object> deletePart(String partIdToDelete, Object boxId)
	{
		System.debug('deletedeletePartBox Start Method.');
		Map<String, Object> mapResponse = new Map<String, Object>();
		try 
		{
			System.debug('box Id: ' + boxId);
			System.debug('partIdToDelete: ' + partIdToDelete);
			Part__c boxToDelete = new Part__c(Id = partIdToDelete);
			delete boxToDelete;

			Id idBox = (Id)boxId;

			List<Part__c> partList = [SELECT Id, Index__c FROM Part__c WHERE Box__c =: idBox ORDER BY Index__c ASC];
			for(integer i=0; i<partList.size(); i++)
			{
				partList[i].Index__c = i;
			}
			update partList;
			System.debug('partList: ' + partList);

			mapResponse.put('Status', 200);
		} 
		catch (Exception e) 
		{
			throw new AuraHandledException(e.getMessage());
		}
		return mapResponse;
	}

	@AuraEnabled
	public static Map<String, String> updateQuote(String quoteId, String discount, String exchangeRate, String markup, String discountSelected)
	{
		Map<String, String> mapResponse = new Map<String, String>();
		try 
		{
			System.debug('discount: ' + discount);
			System.debug('exchangeRate: ' + exchangeRate);
			System.debug('markup: ' + markup);
			System.debug('discountSelected: ' + discountSelected);
			Decimal discountField;
			if(discountSelected != null) discountField = Decimal.valueOf(String.valueOf(discountSelected.replace('%', '')));

			Quote__c quote = [SELECT Id, Discount__c, ExchangeRate__c, MarkUp__c FROM Quote__c WHERE Id =: quoteId LIMIT 1];
			quote.Discount__c = discountField == null ? quote.Discount__c : discountField;
			quote.ExchangeRate__c = String.isBlank(exchangeRate) ? quote.ExchangeRate__c : Decimal.valueOf(exchangeRate);
			quote.MarkUp__c = String.isBlank(markup) ? quote.MarkUp__c : Decimal.valueOf(markup);
			update quote;
			
			mapResponse.put('Status', 'OK');
		} 
		catch (Exception e) 
		{
			mapResponse.put('Error', e.getMessage());
			throw new AuraHandledException(e.getMessage());
		}
		return mapResponse;
	}

	@AuraEnabled
	public static Map<String, String> createNewGame(String gameName)
	{
		Map<String, String> mapResponse = new Map<String, String>();
		try 
		{    
			System.debug('gameName: ' + gameName);
			if(gameName != null && gameName != '')
			{
				Product2 newGame = new Product2(Name = gameName, IsActive = true);
				insert newGame;
				mapResponse.put('Status', 'Success');
				mapResponse.put('GameId', newGame.Id);
				mapResponse.put('Name', newGame.Name);
			}
			else 
			{
				mapResponse.put('Status', 'Error');
				mapResponse.put('Message', 'The name of the game was not included.');
			}
		} 
		catch (Exception e) 
		{
			throw new AuraHandledException(e.getMessage());
		}
		return mapResponse;
	}

	@AuraEnabled
	public static Object createNewGameFromPart(Object gameListToInsert, String quoteId, String boxId, String context)
	{
		System.debug('createNewGameFromPart - context: ' + context);
		Map<Object, Object> partMapToUpdate = new Map<Object, Object>();
		Map<String, Object> mapPartProduct = new Map<String, Object>();
		Map<String, String > mapPartIdProduct = new Map<String, String>();
		Map<String, Object> mapResponse = new Map<String, Object>();
		List<Object> listNewPart = new List<Object>();
		try 
		{
			System.debug('gameListToInsert: ' + gameListToInsert);
			Map<Object, Object> mapParts = (Map<Object, Object>)gameListToInsert;
			System.debug('mapParts: ' + mapParts);
			//List<Object> listParts = (List<Object>)gameListToInsert;
			//System.debug('listParts: ' + listParts);
			List<Product2> listProdToInsert = new List<Product2>();
			Set<String> listProductName = new Set<String>();
			Set<String> listProductNameToQuery = new Set<String>();
			Map<String, List<Product2>> mapListProdToInsert = new Map<String, List<Product2>>();
			Boolean newProduct = false;
			//for(Object part: listParts)
			for(Object part: mapParts.values())
			{
				System.debug('part: ' + part);

				Map<Object, Object> partMap = (Map<Object, Object>)part;
				System.debug('partMap.get GameComponent__c: ' + partMap.get('GameComponent__c'));
				if(partMap.get('GameComponent__c') == null || (String)partMap.get('GameComponent__c') == '')
				{
					Map<Object, Object> game = (Map<Object, Object>)partMap.get('GameComponent__r');
					
					System.debug('game: ' + game);
					mapPartProduct.put((String)game.get('Name'), partMap); //ERROR - CON LO STESSO PRODOTTO, VERRA' PERSA UNA PARTE
					listProductNameToQuery.add((String)game.get('Name'));
					
					mapPartIdProduct.put((String)partMap.get('Id'), (String)game.get('Name'));
					System.debug('mapPartIdProduct: ' + mapPartIdProduct);
					
					//listProdToInsert.add(new Product2(Name = (String)game.get('Name'), isActive = true));
					listProductName.add((String)game.get('Name'));
					System.debug('listProductName: ' + listProductName);
				}
				else if(partMap.get('GameComponent__c') != null || (String)partMap.get('GameComponent__c') != '')
				{
					System.debug('dentro component != null');
					Map<Object, Object> game = (Map<Object, Object>)partMap.get('GameComponent__r');
					listProductNameToQuery.add((String)game.get('Name'));
					System.debug('game: ' + game);
					
					System.debug('get Id: ' + (String)game.get('Id'));
					mapPartProduct.put((String)game.get('Name'), partMap); 
					//listPartToUpdate.add(new Product2(Name = (String)game.get('Name'), isActive = true));
					mapPartIdProduct.put((String)partMap.get('Id'), (String)game.get('Name'));
					System.debug('mapPartIdProduct: ' + mapPartIdProduct);
					if((String)game.get('Id') == '' || (String)game.get('Id') == null)
					{
						listProductName.add((String)game.get('Name'));
						//listProdToInsert.add(new Product2(Name = (String)game.get('Name'), isActive = true));
						//mapListProdToInsert.put('New'+i, new Product2(Name = (String)game.get('Name'), isActive = true));
					}
				}
				else 
				{
					mapPartProduct.put('', partMap);
				}
			}
			System.debug('mapPartProduct: ' + mapPartProduct);
			System.debug('mapPartProduct size: ' + mapPartProduct.size());
			System.debug('listProductName: ' + listProductName);
			
			for(String prod: listProductName) listProdToInsert.add(new Product2(Name = prod, isActive = true));
			System.debug('listProdToInsert: ' + listProdToInsert);
			if(!listProdToInsert.isEmpty()) upsert listProdToInsert;
			
			//for(Product2 product: listPartToUpdate)
			Map<String, Id> mapIdProduct = new Map<String, Id>();
			for(Product2 product: [SELECT Id, Name FROM Product2 WHERE Name IN: listProductNameToQuery ])
			{
				System.debug('Product Id: ' + product.Id);
				System.debug('Get Part from map:' + mapPartProduct.get(product.Name));
				mapIdProduct.put(product.Name, product.Id);
			}

			for(Object part: mapParts.values())
			{
				System.debug('part: ' + part);
				partMapToUpdate = (Map<Object, Object>)part;
				Map<Object, Object> gameComponent = (Map<Object, Object>)partMapToUpdate.get('GameComponent__r');
				System.debug('gameComponent: ' + gameComponent);
				
				gameComponent.put('Id', mapIdProduct.get((String)gameComponent.get('Name')));
				System.debug('gameComponent: ' + gameComponent);
				
				partMapToUpdate.put('Component', mapIdProduct.get((String)gameComponent.get('Name')));
				listNewPart.add(partMapToUpdate);
				System.debug('listNewPart: ' + listNewPart);
			}
			
			System.debug('partMapToUpdate: ' + partMapToUpdate);
			mapResponse = saveNewPart(listNewPart, quoteId, boxId, context);
			
			System.debug('mapResponse: ' + mapResponse);
		} 
		catch (Exception e) 
		{
			throw new AuraHandledException(e.getMessage());
		}
		return mapResponse; 
	}

	@AuraEnabled
	public static AccordionQuoteBuilder__c getAccordionFlag()
	{
		return AccordionQuoteBuilder__c.getOrgDefaults();
	}

}
