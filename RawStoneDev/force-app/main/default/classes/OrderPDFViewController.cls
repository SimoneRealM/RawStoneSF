public class OrderPDFViewController {
    private static final List<String> ORDER_ITEM_FIELDS = new List<String> {
        'Id'                      , 'ListPrice__c'                     ,
        'AvailableQuantity'       , 'Note__c'                          ,
        'Company__c'              , 'Order.ERPId__c'                   ,
        'CreatedBy.AgentCode__c'  , 'OrderCode__c'                     ,
        'CreatedDate'             , 'OrderItemNumber'                  ,
        'CurrencyIsoCode'         , 'OrderLineTypeCode__c'             ,
        'DeliveryDate1__c'        , 'OriginalListPrice__c'             ,
        'DeliveryDate2__c'        , 'PricebookEntry.EntryExternalId__c',
        'DeliveryDate3__c'        , 'Product2.ProductCode'             ,
        'DeliveryDate4__c'        , 'ProgressiveRow__c'                ,
        'Description'             , 'ProgressiveRowRef__c'             ,
        'DiscountAmount__c'       , 'Quantity'                         ,
        'DiscountPercentage1__c'  , 'QuantityInPreparation__c'         ,
        'DiscountPercentage2__c'  , 'QuantityResidual__c'              ,
        'ERPOrderCode__c'         , 'QuantityShipped__c'               ,
        'ERPOrderCodeRef__c'      , 'Subtotal__c'                      ,
        'ERPOrderItemId__c'       , 'TaxInfo__c'                       ,
        'ERPQuoteCodeRef__c'      , 'TotalPrice'                       ,
        'GiftCode__c'             , 'UnitOfMeasure__c'                 ,
        'Language__c'             ,
        'UnitPrice'               , 'Product2.WebDescriptionName__c '  ,
        'CasePack__c'             , 'ERPMasterOrder__r.ERPId__c'       ,
        'Legal_Entity__r.IdERP__c', 'Destination__r.IdERP__c'          ,
        'ContoVisione__c'           
};
    private Order                   Order;
    public  String                  Language              {get;set;}
    public  Boolean                 ShippingCostVisible   {get;set;}
    public  Boolean                 DiscountVisible       {get;set;}
    public  String                  TaxInfoPicklistLabel  {get;set;}
    //public  Map<String, String>     map_label_translation {get;set;}
    public  Map<String, String>     map_productCode_name  {get;set;}
    public  String                  recordTypeName        {get;set;}
    private Map<String, String>     map_language_isoCode = new Map<String,String>{
        'eng' => 'EN',
        'ita' => 'IT',
    'ger' => 'DE',
        'fre' => 'FR',
        'esp' => 'ES'
    };
    //private final String            RTYPE_FREE_SAMPLE    = Utils.getRecordTypeId('Order', 'Free_Sample_Order');
    //private final String            RTYPE_SALES          = Utils.getRecordTypeId('Order', 'Sales_Order');
    //private final String            MASTER_ORDER         = Utils.getRecordTypeId('Order', 'Master_Order');
    /*public  Map<String, String>     map_type_label       = new Map<String, String>{
        RTYPE_SALES       => 'C-ORDINE',
        RTYPE_FREE_SAMPLE => 'C-CAMPIONATURA',
        MASTER_ORDER      => 'C-MASTERORDER'
    };*/
    public  Boolean                 IsFreeSample          {get;set;}
    private static final List<String>  confirmedStatuses = new List<String>{'4', '5', '6', '7', '8', '9'};
    public List<OrderItem> sortedOrderItems{get;set;}

  public OrderPDFViewController(ApexPages.StandardController stdController) {
        Map<String, String>  map_key_pageParam     =  ApexPages.currentPage().getParameters();
        String               recordId              =  map_key_pageParam.get('id');
        String               language              =  map_key_pageParam.get('language');
        String               languageIso           =  map_language_isoCode.get(language);
        //List<OrderItem>      items                 =  Selector.getOrderItemsByOrderId(recordId, new List<String>{'Product2.ProductCode'});
        //List<String>         productCodes          =  Utils.getListFromField(items, 'Product2.ProductCode');
        //List<Product2>       translatedProducts    =  Selector.getProductsByCodeAndLanguage(productCodes, languageIso, new List<String>{'ProductCode', 'Name'});
        //Account              orderAccount          =  Selector.getAccountByIdAndOrderId(recordId, new List<String>{'TaxInfo__c'});
        Order                  =  (Order) stdController.getRecord();
        //IsFreeSample           =  Order.RecordTypeId == RTYPE_FREE_SAMPLE;
        //Order                  =  IsFreeSample ? setPricesToZero(Order) : Order;
        ShippingCostVisible    =  !(Boolean.valueOf(map_key_pageParam.get('hideShippingCost')));
        DiscountVisible        =  !(Boolean.valueOf(map_key_pageParam.get('hideDiscount')));
        //map_label_translation  =  getTranslationMapByLanguage(language);
        //map_productCode_name   =  Utils.mapByFieldAndValue(translatedProducts, 'ProductCode', 'Name');
        //TaxInfoPicklistLabel   =  Utils.getPicklistLabelByValue(orderAccount.TaxInfo__c, Account.TaxInfo__c.getDescribe());
        //map_productCode_name   =  handleMissingProductCodes(productCodes, map_productCode_name);
        //recordTypeName         =  map_type_label.get(Order.RecordTypeId);
        sortedOrderItems       =  getSortedItems();
    }

    /*@TestVisible
    private static Order setPricesToZero(Order order) {
        for (OrderItem item : order.OrderItems) {
            item.UnitPrice    = 0;
            item.ListPrice__c = 0;
            item.Subtotal__c  = 0;
        }
        order.SubtotalExt__c  = 0;
        order.GrandTotal__c   = 0;

        return order;
    }*/

    private static Map<String, String> handleMissingProductCodes(List<String> productCodes, Map<String, String> map_productCode_name){
        for(String code : productCodes){
            if(!map_productCode_name.containsKey(code)){
                map_productCode_name.put(code, code);
                System.debug('### MISSING VALUE ADDED ');
                System.debug(code + ' => ' + map_productCode_name.get(code));
            }
        }
        return map_productCode_name;
    }

    /*private static Map<String, String> getTranslationMapByLanguage(String language) {
        List<OrderPageLabelsTransation__mdt> metadata = Database.query(''
            + 'SELECT  translation__c, Label'
            + '  FROM  OrderPageLabelsTransation__mdt'
            + ' WHERE  language__c = :language'
        );

        return Utils.mapByFieldAndValue(metadata, 'Label', 'translation__c');
    }*/

    public void updateExpenses() {
        System.debug('order id: ' + Order.Id);
        Order ord = [SELECT Status FROM Order WHERE Id = :Order.Id];
        if(!confirmedStatuses.contains(ord.Status)){
            //InvocableGetOrderExpenses.updateShippingPackagingExpenses(new List<String>{ ord.Id });
        }
    }

    public List<OrderItem> getSortedItems(){
        String orderId = Order.Id;
        List<OrderItem> orderItems = Database.query(''
        + 'SELECT ' + String.join(ORDER_ITEM_FIELDS, ', ')
        + ' FROM OrderItem'
        + ' WHERE  OrderId = :orderId'
        //+ ' ORDER BY ProgressiveRow__c '
        );
        return orderItems;
    }
}