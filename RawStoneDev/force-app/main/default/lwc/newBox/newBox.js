import saveNewBox from "@salesforce/apex/QuoteBuilderHelper.saveNewBox";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { LightningElement, api, track } from 'lwc';


const columnsNewBox = [
    { label: 'Box Name',   fieldName: 'Name',      type: 'text',    editable: true },
    { label: 'Quantity 1', fieldName: 'Q1__c',     type: 'integer', editable: true },
    { label: 'Quantity 2', fieldName: 'Q2__c',     type: 'integer', editable: true },
    { label: 'Quantity 3', fieldName: 'Q3__c',     type: 'integer', editable: true },
    { label: 'Quantity 4', fieldName: 'Q4__c',     type: 'integer', editable: true },
    { label: 'Quantity 5', fieldName: 'Q5__c',     type: 'integer', editable: true },
    { label: '',           fieldName: 'buttons',   type: 'text',    editable: false} 
];

const partHeader = [
    { label: 'Game Component',  fieldName: 'gamecomponent',type: 'text',      editable: true, initialWidth: 86},
    { label: 'Dimension',       fieldName: 'dimension',    type: 'text',      editable: true, initialWidth: 86},
    { label: 'Printing',        fieldName: 'printing',     type: 'text',      editable: true, initialWidth: 86},
    { label: 'Material',        fieldName: 'material',     type: 'text',      editable: true, initialWidth: 86},
    { label: 'Finish',          fieldName: 'finish',       type: 'text',      editable: true, initialWidth: 86},
    { label: 'Quantity',        fieldName: 'quantity',     type: 'integer',      editable: true, initialWidth: 68},
    { label: 'Remarks',         fieldName: 'remarks',      type: 'text',      editable: true, initialWidth: 86},
    { label: 'Developing',      fieldName: 'developing',   type: 'decimal',      editable: true, initialWidth: 86},
    { label: 'Plate Change',    fieldName: 'plateChange',  type: 'decimal',    editable: true, initialWidth: 86, typeAttributes: {whiteSpace: 'pre-line' }},
    { label: 'Qty 1',           fieldName: 'Q1__c',        type: 'decimal',   editable: true, initialWidth: 86},
    { label: 'Qty 2',           fieldName: 'Q2__c',        type: 'decimal',   editable: true, initialWidth: 86},
    { label: 'Qty 3',           fieldName: 'Q3__c',        type: 'decimal',   editable: true, initialWidth: 86},
    { label: 'Qty 4',           fieldName: 'Q4__c',        type: 'decimal',   editable: true, initialWidth: 86},
    { label: 'Qty 5',           fieldName: 'Q5__c',        type: 'decimal',   editable: true, initialWidth: 86},
    { label: '',                fieldName: 'buttons',      type: 'button',    editable: false,initialWidth: 200},
];

export default class NewBox extends LightningElement 
{
    @api columns = columnsNewBox;
    @api partHeader = partHeader;
    @api newBox;
    @api reactiveKeyBox;
    @api recordId;

    @track quantity1 = '';
    @track quantity2 = '';
    @track quantity3 = '';
    @track quantity4 = '';
    @track quantity5 = '';

    spinner = false;
    disabledShowNewPart = true;


    chevronDownBox = true;
    showBox = true;
    handleClickBox()
    {
        this.chevronDownBox = this.chevronDownBox ? false : true;
        this.showBox = this.chevronDownBox ? true : false;
    }
    
    showTableParts = true;
    chevronDown = true;
    handleClickPart()
    {
        this.chevronDown = this.chevronDown ? false : true;
        this.showTableParts = this.chevronDown ? true : false;
    }

    handleHeaderChange(event) 
    {
        const fieldName = event.target.fieldName;
        console.log('fieldName:', fieldName);

        const value = event.target.value;
        console.log('value:', value);

        if(fieldName === 'Q1__c') this.quantity1 = value;
        if(fieldName === 'Q2__c') this.quantity2 = value;
        if(fieldName === 'Q3__c') this.quantity3 = value;
        if(fieldName === 'Q4__c') this.quantity4 = value;
        if(fieldName === 'Q5__c') this.quantity5 = value;

        const key = event.target.dataset.key;
        console.log('key:', key);
        
        //Get of value of quantity of Box Table
        const dynamicQuantity1 = ( this.quantity1 === '' ||  this.quantity1 === undefined) ||  this.quantity1 === null ? 'Qty 1' : 'Qty ' +  this.quantity1;
        const dynamicQuantity2 = ( this.quantity2 === '' ||  this.quantity2 === undefined) ||  this.quantity2 === null ? 'Qty 2' : 'Qty ' +  this.quantity2;
        const dynamicQuantity3 = ( this.quantity3 === '' ||  this.quantity3 === undefined) ||  this.quantity3 === null ? 'Qty 3' : 'Qty ' +  this.quantity3;
        const dynamicQuantity4 = ( this.quantity4 === '' ||  this.quantity4 === undefined) ||  this.quantity4 === null ? 'Qty 4' : 'Qty ' +  this.quantity4;
        const dynamicQuantity5 = ( this.quantity5 === '' ||  this.quantity5 === undefined) ||  this.quantity5 === null ? 'Qty 5' : 'Qty ' +  this.quantity5;

        const newPartHeaderColumn = 
        [
            { label: 'Game Component',  fieldName: 'gamecomponent',type: 'text',      editable: true },
            { label: 'Dimension',       fieldName: 'dimension',    type: 'text',      editable: true },
            { label: 'Printing',        fieldName: 'printing',     type: 'text',      editable: true },
            { label: 'Material',        fieldName: 'material',     type: 'text',      editable: true },
            { label: 'Finish',          fieldName: 'finish',       type: 'text',      editable: true },
            { label: 'Quantity',        fieldName: 'quantity',     type: 'integer',   editable: true },
            { label: 'Remarks',         fieldName: 'remarks',      type: 'text',      editable: true },
            { label: 'Developing',      fieldName: 'developing',   type: 'decimal',   editable: true },
            { label: 'Plate Change',    fieldName: 'plateChange',  type: 'decimal',   editable: true },
            { label: dynamicQuantity1,  fieldName: 'Q1__c',        type: 'decimal',   editable: true },
            { label: dynamicQuantity2,  fieldName: 'Q2__c',        type: 'decimal',   editable: true },
            { label: dynamicQuantity3,  fieldName: 'Q3__c',        type: 'decimal',   editable: true },
            { label: dynamicQuantity4,  fieldName: 'Q4__c',        type: 'decimal',   editable: true },
            { label: dynamicQuantity5,  fieldName: 'Q5__c',        type: 'decimal',   editable: true },
            { label: '',                fieldName: 'buttons',      type: 'button',    editable: false}
        ];
        // Add new values to Header of Part Table
        this.partHeader = newPartHeaderColumn;
        console.log('### NewBox --> Box Header Updated:', this.partHeader);
        /*
        const newHeaderEvent = new CustomEvent('updateheader', { detail: this.partHeader });
        this.dispatchEvent(newHeaderEvent);*/
        
        //Update Box in Context
        let updatedNewBox = { ...this.newBox };
        updatedNewBox[fieldName] = value;
        this.newBox = updatedNewBox;
        console.log('Box Updated:', this.newBox);
    
    }

    @track newPartsList = [];
    keyPart = 0;
    showNewParts = false;
    handleCreatePart()
    {
        console.log('Click on Add Part');
        this.keyPart++;
        this.showNewParts = true;

        const newPart = {
            Id: 'Part ' + this.keyPart,
            Dimension__c: '',
            Printing__c: '',
            Material__c: '',
            Finish__c: '',
            Quantity__c: 0,
            Remark__c: '',
            DevelopingCNY__c: 0,
            PlateChangeCNY__c: 0,
            PriceQ1CNY__c: 0,
            PriceQ2CNY__c: 0,
            PriceQ3CNY__c: 0,
            PriceQ4CNY__c: 0,
            PriceQ5CNY__c: 0
        };
    
        this.newPartsList = [...this.newPartsList, newPart];
        console.log('### NewBox --> newPartsList:', this.newPartsList);
    }

    handleSaveNewBox()
    {
        console.log('Click on Save New Box');
        console.log('RecordId:', this.recordId);
        this.spinner = true;
        let context = 'New Box';
        saveNewBox({newBox : this.newBox, quoteId : this.recordId, context : context}).then(result =>
        {      
            console.log('result:', result);
            if(result.Status === 200)
            {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Box Created Correctly.',
                        message: 'Success',
                        variant: 'success',
                    }),
                );  
                this.disabledShowNewPart = false;
            }
           
            this.spinner = false;
            //this.handleReloadPage();
        }).catch(() => 
        {      
            this.spinner = false;
        });  
    }

    handleSaveSingleBox()
    {
        console.log('### NewBox --> Click on Save Single Box');
        this.spinner = true;
        saveNewPart({newPart : this.newPart, quoteId : this.quoteId, boxId : this.boxId, context : context}).then(result =>
        {      
            console.log('result:', result);
            if(result.Status === 200)
            {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Box Created Correctly.',
                        message: 'Success',
                        variant: 'success',
                    }),
                );  
            }
        
            this.spinner = false;
            this.handleReloadPage();
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


}