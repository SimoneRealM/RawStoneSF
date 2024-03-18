import { NavigationMixin } from 'lightning/navigation';
import { LightningElement, api, track } from 'lwc';

/*const partHeader = [
    { label: 'Dimension',       fieldName: 'dimension',    type: 'text',      editable: true, initialWidth: 86},
    { label: 'Printing',        fieldName: 'printing',     type: 'text',      editable: true, initialWidth: 86},
    { label: 'Material',        fieldName: 'material',     type: 'text',      editable: true, initialWidth: 86},
    { label: 'Finish',          fieldName: 'finish',       type: 'text',      editable: true, initialWidth: 86},
    { label: 'Quantity',        fieldName: 'quantity',     type: 'text',      editable: true, initialWidth: 68},
    { label: 'Remarks',         fieldName: 'remarks',      type: 'text',      editable: true, initialWidth: 86},
    { label: 'Developing',      fieldName: 'developing',   type: 'text',      editable: true, initialWidth: 86},
    { label: 'Plate<br>Change', fieldName: 'plateChange',  type: 'text',      editable: true, initialWidth: 86, typeAttributes: {whiteSpace: 'pre-line' }},
    { label: 'Qty 1',           fieldName: 'quantity1',    type: 'integer',   editable: true, initialWidth: 86},
    { label: 'Qty 2',           fieldName: 'quantity2',    type: 'integer',   editable: true, initialWidth: 86},
    { label: 'Qty 3',           fieldName: 'quantity3',    type: 'integer',   editable: true, initialWidth: 86},
    { label: 'Qty 4',           fieldName: 'quantity4',    type: 'integer',   editable: true, initialWidth: 86},
    { label: 'Qty 5',           fieldName: 'quantity5',    type: 'integer',   editable: true, initialWidth: 86},
    { label: '',                fieldName: 'buttons',      type: 'button',    editable: false,initialWidth: 200},
];*/

export default class QuotePart extends NavigationMixin(LightningElement) 
{
    //@track partHeader = partHeader;
    @api partHeader;
    @track newPartsList = [];
    @track hidePart = false;

    connectedCallback()
    {
        console.log('### QuotePart ### record:', this.record);
        console.log('### QuotePart ### partHeader:', this.partHeader);
        if(this.record !== undefined)
        {
            this.partHeader = 
            [
                { label: 'Dimension',                                                               fieldName: 'dimension',    type: 'text',      editable: true },
                { label: 'Printing',                                                                fieldName: 'printing',     type: 'text',      editable: true },
                { label: 'Material',                                                                fieldName: 'material',     type: 'text',      editable: true },
                { label: 'Finish',                                                                  fieldName: 'finish',       type: 'text',      editable: true },
                { label: 'Quantity',                                                                fieldName: 'quantity',     type: 'text',      editable: true },
                { label: 'Remarks',                                                                 fieldName: 'remarks',      type: 'text',      editable: true },
                { label: 'Developing',                                                              fieldName: 'developing',   type: 'text',      editable: true },
                { label: 'Plate\nChange',                                                           fieldName: 'plateChange',  type: 'text',      editable: true },
                { label: this.record.Q1__c === undefined ? 'Qty 1' : 'Qty ' + this.record.Q1__c,    fieldName: 'quantity1',    type: 'integer',   editable: true },
                { label: this.record.Q2__c === undefined ? 'Qty 2' : 'Qty ' + this.record.Q2__c,    fieldName: 'quantity1',    type: 'integer',   editable: true },
                { label: this.record.Q3__c === undefined ? 'Qty 3' : 'Qty ' + this.record.Q3__c,    fieldName: 'quantity1',    type: 'integer',   editable: true },
                { label: this.record.Q4__c === undefined ? 'Qty 4' : 'Qty ' + this.record.Q4__c,    fieldName: 'quantity1',    type: 'integer',   editable: true },
                { label: this.record.Q5__c === undefined ? 'Qty 5' : 'Qty ' + this.record.Q5__c,    fieldName: 'quantity1',    type: 'integer',   editable: true },
                { label: '',                                                                        fieldName: 'buttons',      type: 'button',    editable: false},
            ];
        }

        if(this.record !== undefined)
        {
            if(this.record.Parts__r === undefined)
            {
                this.hidePart = true;
                this.showRecordVoid = true;  
                const newPart = {
                    Id: 'Part' + this.keyPart,
                    Dimension__c: '',
                    Printing__c: '',
                    Material__c: '',
                    Finish__c: '',
                    Quantity__c: '',
                    Remark__c: '',
                    DevelopingCNY__c: '',
                    PlateChangeCNY__c: '',
                    PriceQ1CNY__c: '',
                    PriceQ2CNY__c: '',
                    PriceQ3CNY__c: '',
                    PriceQ4CNY__c: '',
                    PriceQ5CNY__c: '', 
                    Button:''
                };
            }
            this.newPartsList.push(newPart); 
        }
        else if (this.record === undefined)
        {
            console.log('record undefined, create new part void');
            this.showRecordVoid = true;  
            const newPart = {
                Id: 'Part' + this.keyPart,
                Dimension__c: '',
                Printing__c: '',
                Material__c: '',
                Finish__c: '',
                Quantity__c: '',
                Remark__c: '',
                DevelopingCNY__c: '',
                PlateChangeCNY__c: '',
                PriceQ1CNY__c: '',
                PriceQ2CNY__c: '',
                PriceQ3CNY__c: '',
                PriceQ4CNY__c: '',
                PriceQ5CNY__c: ''
            };
        
            this.newPartsList.push(newPart); 
        }
        console.log('newPartsList:', this.newPartsList);
    }

    handleInputPart(event)
    {
        const fieldName = event.target.fieldName;
        console.log('fieldName:', fieldName);
        const value = event.target.value;
        console.log('value:', value);
        const key = event.target.dataset.key; // Ottengo la chiave univoca dalla data-key
        console.log('key:', key);
    }

    handleUpdateHeader(event) 
    {
        const newHeader = event.detail;
        console.log('event detail:', event.detail);
        this.partHeader = newHeader;
        console.log('partHeader edited:', this.partHeader);
    }
}