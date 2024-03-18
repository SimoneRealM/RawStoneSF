public with sharing class LookupCtrl 
{
	@AuraEnabled(cacheable=true)
	public static List<SObject> findRecords(String searchKey, String objectApiName, List<String> keyFields, String additionalField, String selectedRecords, String fixedWhereClause) 
	{
		return findFilteredRecords(searchKey, '', objectApiName, keyFields, additionalField, selectedRecords, fixedWhereClause);
	}

	@AuraEnabled(cacheable=true)
	public static List<SObject> findFilteredRecords(String searchKey, String filterKey, String objectApiName, List<String> keyFields, String additionalField, String selectedRecords, String fixedWhereClause) 
	{
		List<SObject> records =  new List<SObject>();
		// If there no key return the empty list
		if(String.isEmpty(searchKey)) { return records; }

		// The Id field is always retrieved, than the key field and the eventual additionalField
		Set<String> fieldsSet = new Set<String>{'Id'};
		fieldsSet.addAll(keyFields);
		if(String.isNotEmpty(additionalField)) { fieldsSet.add(additionalField); }
		String fieldsString = String.join(new List<String>(fieldsSet), ', ');

		// Setup the wehere clause
		String whereClause = 'WHERE ';
		if(keyFields.size() == 1) 
		{
			whereClause += keyFields[0] + ' LIKE \''+ searchKey +'%\'';
		} 
		else 
		{
			List<String> alternativeValues = new List<String>();
			for(String key : keyFields)
			{
				alternativeValues.add(key + ' LIKE \''+ searchKey +'%\'');
			}
			whereClause += '(' + String.join(alternativeValues, ' OR ') + ')';
		}
		if(String.isNotEmpty(selectedRecords))
		{
			Set<Id> setSelectedRecords = (Set<Id>) JSON.deserialize(selectedRecords, Set<Id>.class);
			if(!setSelectedRecords.isEmpty()) { whereClause += ' AND Id NOT IN: setSelectedRecords'; }
		}
		if(String.isNotEmpty(filterKey)) { whereClause += ' AND ' + additionalField + ' LIKE \''+ filterKey +'%\''; }

		if(String.isNotEmpty(fixedWhereClause)) { whereClause += ' AND ' + fixedWhereClause; }

		// Prepare the soql and get the records
		String soql = 'SELECT ' + fieldsString + ' FROM ' + objectApiName + ' ' + whereClause + ' ORDER BY ' + String.join(keyFields, ', ') + ' LIMIT 100';
		System.debug('SOQL: ' + soql);
		records = Database.query(soql);
		
		return records;
	}
}