import { NavigationMixin } from 'lightning/navigation';
import { LightningElement, api, track } from 'lwc';

const partHeader = [
    { label: 'Dimension',       fieldName: 'dimension',    type: 'text',      editable: true },
    { label: 'Printing',        fieldName: 'printing',     type: 'text',      editable: true },
    { label: 'Material',        fieldName: 'material',     type: 'text',      editable: true },
    { label: 'Finish',          fieldName: 'finish',       type: 'text',      editable: true },
    { label: 'Quantity',        fieldName: 'quantity',     type: 'text',      editable: true },
    { label: 'Remarks',         fieldName: 'remarks',      type: 'text',      editable: true },
    { label: 'Developing',      fieldName: 'developing',   type: 'text',      editable: true },
    { label: 'Plate\nChange',   fieldName: 'plateChange',  type: 'text',      editable: true },
    { label: 'Qty 1',           fieldName: 'quantity1',    type: 'integer',   editable: true },
    { label: 'Qty 2',           fieldName: 'quantity2',    type: 'integer',   editable: true },
    { label: 'Qty 3',           fieldName: 'quantity3',    type: 'integer',   editable: true },
    { label: 'Qty 4',           fieldName: 'quantity4',    type: 'integer',   editable: true },
    { label: 'Qty 5',           fieldName: 'quantity5',    type: 'integer',   editable: true },
    { label: '',                fieldName: 'buttons',      type: 'button',    editable: false},
];

export default class quoteLine extends NavigationMixin(LightningElement)
{
    @api columns;
    @api reactiveKeyBox; 
    @api record;
    @api recordList;
    @api showBoxTable;
    @api listPart;
    @api createBox;
    @api existingRecord;
    //@api partHeaderColumns;
    
    reactiveKeyPart = 0;
    
    firstPart = true;
    //showBoxTable = false;
    showPartTable = false;
    
    //@track columns = columns;
    @track partHeader = partHeader;
    @track quantity1 = '';
    @track quantity2 = '';
    @track quantity3 = '';
    @track quantity4 = '';
    @track quantity5 = '';
    @track partList = [];
    
    @track boxRecord = {
        id: 'Box'+this.reactiveKeyBox,
        name: '',
        quantity1: null,
        quantity2: null,
        quantity3: null,
        quantity4: null,
        quantity5: null
    };

    /*_________________________________________FINE DICHIARAZIONE VARIABILI_________________________________________*/
    
    connectedCallback()
    {
        console.log('### QuoteLine ### record:', this.record);
        console.log('### QuoteLine ### columns:', this.columns);
        console.log('### QuoteLine ### recordList:', this.recordList);
        console.log('### QuoteLine ### reactiveKeyBox:', this.reactiveKeyBox);
        console.log('### QuoteLine ### listPart:', this.listPart);
        console.log('### QuoteLine ### createBox:', this.createBox);

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

    firstClickOnPart = false;
    handleCreatePart()
    {
        console.log('### QuoteLine ### handleCreatePart Method');

        this.showPartTable = true;
        this.firstClickOnPart = true;
        this.reactiveKeyPart++;
        console.log('show part table: ', this.showPartTable);
        
        //this.partList.unshift(newRecord);
        //this.partList.push(newRecord);
        //console.log('### QuoteLine ### partList:', this.partList);
    }

    handleHeaderBoxChange(event)
    {
        const fieldName = event.target.fieldName;
        const value = event.target.value;
    }

    @track Q1__c;
    //@track headerList = [];
    handleInputChange(event) 
    {
        const fieldName = event.target.dataset.fieldName;
        if(fieldName === 'Q1__c') this.Q1__c = event.target.value;
        const value = event.target.value;
        const keyBox = event.target.dataset.key;
        console.log('fieldName:', fieldName);
        console.log('value:', value);
        console.log('keyBox:', keyBox);

        this.updateHeader = true;
        console.log('update header:', this.updateHeader);
        
        this.headerList.push(this.updateHeader);
        console.log('headerList:', this.headerList);

        /*console.log('### QuoteLine ### keyBox:', keyBox);
        //this.boxRecord[fieldName] = value;
        console.log('### QuoteLine ### boxRecord:', this.boxRecord);
        console.log('### QuoteLine ### record:', this.record);

        const updatedRecordList = this.recordList.map(box => 
        {
            if (box.Id === keyBox) {
                return {
                    ...box,           // Mantengo i valori esistenti
                    [fieldName]: value // Aggiorno il campo specifico
                };
            }
            return box;
        });
        this.recordList = updatedRecordList;
        console.log('### QuoteLine ### boxRecordUpdated:', this.recordList);*/

        // Copia il record esistente in una nuova variabile
        const updatedRecord = { ...this.record };
        // Aggiorna il valore del campo nel nuovo record
        updatedRecord[fieldName] = value;
        // Aggiorna la variabile reattiva con il nuovo record
        this.record = updatedRecord;
        console.log('record updated:', this.record);
        console.log('record updated Q1__c:', this.record.Q1__c);

        //Get of value of quantity of Box Table
        const dynamicQuantity1 = ( this.record.Q1__c === '' ||  this.record.Q1__c === undefined) ||  this.record.Q1__c === null ? 'Qty 1' : 'Qty ' +  this.record.Q1__c;
        const dynamicQuantity2 = ( this.record.Q2__c === '' ||  this.record.Q2__c === undefined) ||  this.record.Q2__c === null ? 'Qty 2' : 'Qty ' +  this.record.Q2__c;
        const dynamicQuantity3 = ( this.record.Q3__c === '' ||  this.record.Q3__c === undefined) ||  this.record.Q3__c === null ? 'Qty 3' : 'Qty ' +  this.record.Q3__c;
        const dynamicQuantity4 = ( this.record.Q4__c === '' ||  this.record.Q4__c === undefined) ||  this.record.Q4__c === null ? 'Qty 4' : 'Qty ' +  this.record.Q4__c;
        const dynamicQuantity5 = ( this.record.Q5__c === '' ||  this.record.Q5__c === undefined) ||  this.record.Q5__c === null ? 'Qty 5' : 'Qty ' +  this.record.Q5__c;

        console.log('dynamicQuantity1:', dynamicQuantity1);
        console.log('dynamicQuantity2:', dynamicQuantity2);
        const newPartHeaderColumn = 
        [
            { label: 'Dimension',       fieldName: 'dimension',    type: 'text',      editable: true },
            { label: 'Printing',        fieldName: 'printing',     type: 'text',      editable: true },
            { label: 'Material',        fieldName: 'material',     type: 'text',      editable: true },
            { label: 'Finish',          fieldName: 'finish',       type: 'text',      editable: true },
            { label: 'Quantity',        fieldName: 'quantity',     type: 'text',      editable: true },
            { label: 'Remarks',         fieldName: 'remarks',      type: 'text',      editable: true },
            { label: 'Developing',      fieldName: 'developing',   type: 'text',      editable: true },
            { label: 'Plate\nChange',   fieldName: 'plateChange',  type: 'text',      editable: true },
            { label: dynamicQuantity1,  fieldName: 'quantity1',    type: 'integer',   editable: true },
            { label: dynamicQuantity2,  fieldName: 'quantity2',    type: 'integer',   editable: true },
            { label: dynamicQuantity3,  fieldName: 'quantity3',    type: 'integer',   editable: true },
            { label: dynamicQuantity4,  fieldName: 'quantity4',    type: 'integer',   editable: true },
            { label: dynamicQuantity5,  fieldName: 'quantity5',    type: 'integer',   editable: true },
            { label: '',                fieldName: 'buttons',      type: 'button',    editable: false}
        ];
        // Add new values to Header of Part Table
        this.partHeader = newPartHeaderColumn;
        console.log('### QuoteLine ### partHeaderUpdated:', this.partHeader);

        const newHeaderEvent = new CustomEvent('updateheader', { detail: this.partHeader });
        this.dispatchEvent(newHeaderEvent);
    }

    @track box;
    @track updateHeader = false;
    handleInputChangePart(event) 
    {
        const fieldName = event.target.fieldName;
        const value = event.target.value;
        const key = event.target.dataset.key; // Ottengo la chiave univoca dalla data-key
        console.log('Key Part:', key);
        let totalBox = [];

        const updatedPartList = this.partList.map(part => 
        {
            console.log('part:', part);
            console.log('part:', part.boxId);
            if (part.Id === key) 
            {
                return {
                    ...part,           // Mantengo i valori esistenti
                    [fieldName]: value // Aggiorno il campo specifico
                };
            }
            return part;
        });
        this.partList = [...updatedPartList];
        console.log('Lista delle Parti:', this.partList);

        this.recordList.forEach(box => 
        {
            console.log('box:', box);
            let matchingParts = this.partList.filter(part => part.boxId === box.Id);
            if (matchingParts.length > 0) 
            {
                totalBox.push({ box, part: matchingParts });
            }
        });

        console.log('totalBox:', totalBox);
        
        const partEvent = new CustomEvent('box', { detail: totalBox });
        this.dispatchEvent(partEvent);

    }    
    

}