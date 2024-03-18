import { refreshApex } from "@salesforce/apex";
//import getFinishValues from "@salesforce/apex/QuoteBuilderHelper.getPicklistValues";
import retrieveBoxAndPart from "@salesforce/apex/QuoteBuilderHelper.retrieveBoxAndPart";
import updateQuote from "@salesforce/apex/QuoteBuilderHelper.updateQuote";
import DISCOUNTBUILDER from '@salesforce/schema/Quote__c.DiscountConcatenate__c';
import DISCOUNT from '@salesforce/schema/Quote__c.Discount__c';
import EXCHANGE_RATE from '@salesforce/schema/Quote__c.ExchangeRate__c';
import MARK_UP from '@salesforce/schema/Quote__c.MarkUp__c';
import NAME from '@salesforce/schema/Quote__c.Name';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';

import { LightningElement, api, track, wire } from 'lwc';


const FINISH_PICKLIST = 'Finish__c';
const PART_API_NAME   = 'Part__c';

const columns = [
    { label: 'Box Name',   fieldName: 'Name',      type: 'text',    editable: true },
    { label: 'Quantity 1', fieldName: 'Q1__c',     type: 'integer', editable: true },
    { label: 'Quantity 2', fieldName: 'Q2__c',     type: 'integer', editable: true },
    { label: 'Quantity 3', fieldName: 'Q3__c',     type: 'integer', editable: true },
    { label: 'Quantity 4', fieldName: 'Q4__c',     type: 'integer', editable: true },
    { label: 'Quantity 5', fieldName: 'Q5__c',     type: 'integer', editable: true },
    { label: '',           fieldName: 'buttons',   type: 'text',    editable: false} 
];

const FIELDS = [DISCOUNTBUILDER, MARK_UP, DISCOUNT];

export default class QuoteBuilder extends LightningElement 
{
    @api recordId;
    @api objectApiName;
    @api columns = columns;
    
    nameField = NAME;
    discountField = DISCOUNT;
    exchangeRateField = EXCHANGE_RATE;
    markupField = MARK_UP;
    formulaDiscount;
    name;
    discount = '';
    markup = '';
    exchangeRate = '';
    oldMarkup;
    finishValues = [];
    showBoxTable = false;
    showParts = false;
    spinner = false;
    existingRecord = false;
    reactiveKeyBox = 0;
    wireResponse;

    @track newBoxList = [];
    @track record = {
        Id: '0',
        Name: '',
        Q1__c: '',
        Q2__c: '',
        Q3__c: '',
        Q4__c: '',
        Q5__c: ''
    };

    showRecordForm = true;
    quote;
    options = [];
    
    /*_________________________________________FINE DICHIARAZIONE VARIABILI_________________________________________*/
    

    @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
    wiredRecord(response) 
    {
        this.wiredRecordResponse = response;
        
        const { error, data } = response;
        if (error) 
        {
            let message = "Unknown error";
            if (Array.isArray(error.body)) {
                message = error.body.map((e) => e.message).join(", ");
            } else if (typeof error.body.message === "string") {
                message = error.body.message;
            }
            this.dispatchEvent(
                new ShowToastEvent({
                title: "Error loading contact",
                message,
                variant: "error",
                }),
            );
        } 
        else if (data) 
        {
            this.quote = data;
            this.formulaDiscount = this.quote.fields.DiscountConcatenate__c.value;
            this.oldMarkup = this.quote.fields.MarkUp__c.value;
            this.oldDiscount = this.quote.fields.Discount__c.value + '%';
            if(this.oldMarkup === '' || this.oldMarkup === undefined || this.oldMarkup === null) { this.readOnlyDiscount = true; }
            this.options = this.formulaDiscount.split(';').map((elem) => {
                const option = {
                    label: elem,
                    value: elem
                };
                return option;
            });
        }
    }
    
    readOnlyDiscount = false;
    connectedCallback()
    {
        this.getRecords();
        this.checkMarkup();
        /*getFinishValues({fieldname: FINISH_PICKLIST, objectname: PART_API_NAME}).then(result => {
            this.finishValues = result.map((val) => {return {label: val, value: val}});
        }).catch((e) => {
            console.log(e)
        });*/
    }

    checkMarkup()
    {

    }

    @api refreshComponent()
    {
        refreshApex(this.wiredRecordResponse);
        //this.readOnlyDiscount = false;
    }
    
    @track fullBox = [];
    getRecords()
    {
        this.spinner = true;
        retrieveBoxAndPart({recordId : this.recordId}).then(result =>
        {      
            for (const boxId in result.FullBox) 
            {
                this.fullBox.push(result.FullBox[boxId]);
            }
            this.existingRecord = true;
            this.spinner = false;
            //this.handleReloadPage();
        }).catch(() => 
        {      
            this.spinner = false;
        });          
    }

    //Reload Page
    handleReloadPage() 
    { 
        location.reload(); 
    }

    createBox = false;
    handleCreateBox()
    {
        this.createBox = true;
        this.existingRecord = false;
        this.reactiveKeyBox++;
        const newBox = 
        {
            Id: 'Box ' + this.reactiveKeyBox,
            Name: 'New Box ' + this.reactiveKeyBox,
            Q1__c: '',
            Q2__c: '',
            Q3__c: '',
            Q4__c: '',
            Q5__c: ''
        };

        this.newBoxList.push(newBox);
    }

    @track listPart = [];
    handleReceivePart(event) 
    {
        this.listPart = event.detail;
    }

    @track listBox = [];
    showClonedBox = false;
    handleClonedBox(event) 
    {
        this.showClonedBox = true;
        this.listBox = event.detail;
    }

    @track generateListExistingParts = [];
    handleCreatePart()
    {
        this.showParts = true;
        
        //this.partList.unshift(newRecord);
        //this.partList.push(newRecord);
        //console.log('### QuoteLine ### partList:', this.partList);
    }

    @track clonedBox = {};
    handleReceiveBox(event)
    {
        this.clonedBox = event.detail;
        
    }

    showSaveChanges = false;
    handleSaveChanges(event) 
    {
        this.showSaveChanges = true;
        const fieldName = event.target.fieldName;
        const value = event.target.value;
        if(fieldName === 'Discount__c')     { this.discount = value; } 
        if(fieldName === 'ExchangeRate__c') { this.exchangeRate = value; }
            
    }
    
    saveChanges()
    {
        this.spinner = true;
       
        updateQuote({quoteId : this.recordId, discount : this.discount, exchangeRate : this.exchangeRate, markup: this.markup, discountSelected : this.discountSelected}).then(result =>
        {      

            if(result.Status === 'OK')
            {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Quote Update Correctly',
                        variant: 'success',
                    }),
                );  
                this.handleReloadPage();
                
                this.readOnlyDiscount = false;
                this.refreshComponent();
            }
            else 
            {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: result.Error,
                        variant: 'error',
                    }),
                );  
            }
            this.spinner = false;
            

        }).catch(() => 
        {      
            this.spinner = false;
        }); 
        
    }

    handleRefreshEvent()
    {
        try
        {        
            this.refreshComponent();
        }
        catch(e)
        {
            console.log('errore'+ e); console.log(JSON.stringify(e))
        }
    }
    
    discountSelected;
    handleChangeDiscount(event)
    {
        this.discountSelected = event.detail.value;
        this.showSaveChanges = true;
    }

    discountReadOnly = true;
    handleMarkupChanges(event)
    {
        const fieldName = event.target.fieldName;
        const value = event.detail.value;
        
        if(fieldName === 'MarkUp__c') 
        { 
            if(value != this.oldMarkup)
            {
                this.markup = event.detail.value; 
                this.readOnlyDiscount = true;
                this.showSaveChanges = true;
                this.discountSelected = '0%';
            }
            else 
            {
                this.readOnlyDiscount = false;
                this.showSaveChanges = false;
            }
        }
    }

}