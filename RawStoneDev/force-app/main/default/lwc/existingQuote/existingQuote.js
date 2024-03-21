import createNewGameFromPart from "@salesforce/apex/QuoteBuilderHelper.createNewGameFromPart";
import deleteBox from "@salesforce/apex/QuoteBuilderHelper.deleteBox";
import saveNewBox from "@salesforce/apex/QuoteBuilderHelper.saveNewBox";
import saveNewPart from "@salesforce/apex/QuoteBuilderHelper.saveNewPart";
import getAccordionMdt from '@salesforce/apex/QuoteBuilderHelper.getAccordionFlag';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import { LightningElement, api, track, wire } from 'lwc';


const partHeader = [
    { label: 'Component',       fieldName: 'Component',         type: 'text',      editable: true, initialWidth: 200},
    { label: 'Dimension',       fieldName: 'Dimension__c',      type: 'text',      editable: true, initialWidth: 86},
    { label: 'Printing',        fieldName: 'Printing__c',       type: 'text',      editable: true, initialWidth: 86},
    { label: 'Material',        fieldName: 'Material__c',       type: 'text',      editable: true, initialWidth: 86},
    { label: 'Finish',          fieldName: 'Finish__c',         type: 'text',      editable: true, initialWidth: 86},
    { label: 'Quantity',        fieldName: 'Quantity__c',       type: 'integer',   editable: true, initialWidth: 68},
    { label: 'Remarks',         fieldName: 'Remark__c',         type: 'text',      editable: true, initialWidth: 86},
    { label: 'Developing',      fieldName: 'DevelopingCNY__c',  type: 'decimal',   editable: true, initialWidth: 86},
    { label: 'Plate Change',    fieldName: 'PlateChangeCNY__c', type: 'decimal',   editable: true, initialWidth: 86, typeAttributes: {whiteSpace: 'pre-line' }},
    { label: 'Qty 1',           fieldName: 'PriceQ1CNY__c',     type: 'decimal',   editable: true, initialWidth: 86},
    { label: 'Qty 2',           fieldName: 'PriceQ2CNY__c',     type: 'decimal',   editable: true, initialWidth: 86},
    { label: 'Qty 3',           fieldName: 'PriceQ3CNY__c',     type: 'decimal',   editable: true, initialWidth: 86},
    { label: 'Qty 4',           fieldName: 'PriceQ4CNY__c',     type: 'decimal',   editable: true, initialWidth: 86},
    { label: 'Qty 5',           fieldName: 'PriceQ5CNY__c',     type: 'decimal',   editable: true, initialWidth: 86},
    { label: '',                fieldName: 'buttons',           type: 'button',    editable: false,initialWidth: 200},
];

export default class ExistingQuote extends NavigationMixin(LightningElement)
{
    @api columns;
    @api reactiveKeyBox; 
    @api record;
    @api recordList;
    @api showBoxTable;
    @api listPart;
    @api createBox;
    @api existingRecord;
    @api quoteId;
    @api finishValues;
    @api isNew;
    @api hideNewPart;
    //@api partHeaderColumns;

    reactiveKeyPart = 0;
    
    firstPart = true;
    //showBoxTable = false;
    showPartTable = false;
    spinner = false;
    
    //@track columns = columns;
    @track showParts = false;
    @track partHeader = partHeader;
    @track quantity1 = '';
    @track quantity2 = '';
    @track quantity3 = '';
    @track quantity4 = '';
    @track quantity5 = '';
    @track partList = [];
    @track generateListExistingParts = [];
    @track updatedPartList = [];
    
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
    

    @api objectApiName = 'Part__c'; 

    /*@wire(getRecord, { recordId: "$recordId" })
    wiredRecord(response) 
    {
        console.log('response:', response);
        this.wiredRecordResponse = response;
        console.log('WiredRecordResponse:', this.wiredRecordResponse);
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
        
        }
    }
    */
   
    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    objectInfo;

    @wire(getPicklistValues, {
        fieldApiName: 'Part__c.Printing__c' 
    })
    printingPicklistValues;

    handleGetAccordionMdt()
	{
        console.log('this.chevronDown pre:', this.chevronDown);
        getAccordionMdt({}).then(result =>
        {      
            console.log('box:', result.Box__c);
            console.log('part:', result.Part__c);
            this.chevronDownBox = result.Box__c;
            this.chevronDown = result.Part__c;
            this.showBox = this.chevronDownBox;
            this.showTableParts = this.chevronDown;
        }).catch(() => 
        {      
            console.log('error:', error);
        });  
	}

    connectedCallback()
    {
        this.handleGetAccordionMdt();
        if(!this.isNew) this.generateListParts();

        this.partHeader = 
        [
            { label: 'Component',                                                               fieldName: 'Component',         type: 'text',      editable: true, initialWidth: 120 },
            { label: 'Dimension',                                                               fieldName: 'Dimension__c',      type: 'text',      editable: true },
            { label: 'Printing',                                                                fieldName: 'Printing__c',       type: 'text',      editable: true },
            { label: 'Material',                                                                fieldName: 'Material__c',       type: 'text',      editable: true },
            { label: 'Finish',                                                                  fieldName: 'Finish__c',         type: 'text',      editable: true },
            { label: 'Quantity',                                                                fieldName: 'Quantity__c',       type: 'integer',      editable: true },
            { label: 'Remarks',                                                                 fieldName: 'Remark__c',         type: 'text',      editable: true },
            { label: 'Developing',                                                              fieldName: 'DevelopingCNY__c',  type: 'decimal',    editable: true },
            { label: 'Plate Change',                                                            fieldName: 'PlateChangeCNY__c', type: 'decimal',     editable: true, typeAttributes: {whiteSpace: 'pre-line' } },
            { label: this.record.Q1__c === undefined ? 'Qty 1' : 'Qty ' + this.record.Q1__c,    fieldName: 'PriceQ1CNY__c',     type: 'decimal',   editable: true },
            { label: this.record.Q2__c === undefined ? 'Qty 2' : 'Qty ' + this.record.Q2__c,    fieldName: 'PriceQ2CNY__c',     type: 'decimal',   editable: true },
            { label: this.record.Q3__c === undefined ? 'Qty 3' : 'Qty ' + this.record.Q3__c,    fieldName: 'PriceQ3CNY__c',     type: 'decimal',   editable: true },
            { label: this.record.Q4__c === undefined ? 'Qty 4' : 'Qty ' + this.record.Q4__c,    fieldName: 'PriceQ4CNY__c',     type: 'decimal',   editable: true },
            { label: this.record.Q5__c === undefined ? 'Qty 5' : 'Qty ' + this.record.Q5__c,    fieldName: 'PriceQ5CNY__c',     type: 'decimal',   editable: true },
            { label: '',                                                                        fieldName: 'buttons',           type: 'button',    editable: false},
        ];

        this.lengthPart = this.generateListExistingParts.length;
        console.log('this.lengthPart: ', this.lengthPart);
    }

    generateListParts()
    {
        if (this.record.Parts__r !== undefined) 
        {
            this.generateListExistingParts = this.record.Parts__r;
            if(this.generateListExistingParts !== '') this.showParts = true;
        }

		//faccio una copia della lista di parti da mostrare
		this.updatedPartList = [...this.generateListExistingParts];
    }

    @track index;
    @track showNewParts = false;
    @track newPartsList = [];
    keyPart = 0;
    hideSaveAllParts = true;
    @track lengthPart;
    handleCreatePart()
    {
        console.log('Click on Add Part');
        this.keyPart++;
        console.log('Existing Quote - key part:', this.keyPart);
        this.showNewParts = true;
        this.showRecordVoid = true;

        console.log('generateListExistingParts length: ' + this.generateListExistingParts.length );
    
        let indexValue = !this.index ? 0 : this.index; 
        const newPart = {
            Id: 'Part ' + this.keyPart,
            Index__c: indexValue,
            Component: '',
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
        console.log('newPart:', newPart);

        this.newPartsList = [...this.newPartsList, newPart];
        console.log('handleCreatePart - newPartsList:', this.newPartsList);
        
        if(this.newPartsList.length > 1)
        {
            if(this.newPartsList.some(part => this.hasNullOrUndefinedOrEmptyComponent(part)))
            {
                this.hideSaveAllParts = true;
            }
            else
            {
                this.hideSaveAllParts = false;
            }
            
        } 
    }

    @track gameListToInsert = [];
    newProducts = false;
    isNewPart = false;
    gameSelected;
	@track updatedPartListTemp = [];
	@track idMap = {};

    handleShowSaveAll(event)
    {
        console.log('handleShowSaveAll Method');
        let newGame = event.detail.newGame;
        let existingPart = event.detail.existingPart;
        this.isNewPart = event.detail.newPart ? event.detail.newPart : event.detail.isNewPart;
        this.gameSelected = event.detail.gameSelected;
        this.newProducts = event.detail.isNewProduct;
        console.log('newGame:', newGame);
        console.log('existingPart:', existingPart);
        console.log('isNewPart:', this.isNewPart);
        console.log('gameSelected:', this.gameSelected);
        console.log('newProducts:', this.newProducts);

        if(!this.gameSelected) { this.selectedPart = ''; }

       console.log('idMap:', this.idMap);
       // Popola l'oggetto con gli elementi esistenti
       this.updatedPartList.forEach(singlePart => {
           // Verifica se l'ID è già presente in idMap
           if (!this.idMap[singlePart.Id]) {
               // Se non è presente, aggiungi l'elemento a idMap
               this.idMap[singlePart.Id] = singlePart;
			}
		});
        
        console.log('this.idMap[existingPart.Id]:', this.idMap[existingPart.Id]);
		// Aggiungi o aggiorna l'elemento esistente
		this.idMap[existingPart.Id] = {
            ...this.idMap[existingPart.Id],
			...existingPart
		};
		console.log('idMap:', this.idMap);
        
		this.updatedPartListTemp = this.idMap;
		console.log('List Part with new Game:', this.updatedPartListTemp);
        
        let listPartsTemp = Object.values({ ...this.updatedPartListTemp });
		console.log('listPartsTemp:', listPartsTemp);

        //if(!this.isNewPart) { console.log('dentro'); this.generateListExistingParts = [...this.updatedPartList]; }
        if(!this.isNewPart) { console.log('dentro'); this.generateListExistingParts = [...listPartsTemp]; }
        console.log('generateListExistingParts:', this.generateListExistingParts);
        
        if(this.gameSelected) { this.newProducts = false; }
        console.log('newProducts:', this.newProducts);

        if(newGame !== null && newGame !== '') 
        {
            this.newProducts = true;
            this.hideSaveAllParts = false;
        } 

        //if (Object.values(this.updatedPartListTemp).some(part => this.checkGameExistingRecord(part))); //converto prima in una lista

        //if(this.updatedPartListTemp.some(part => part.Component === '')) this.hideSaveAllParts = true; //controllo se la lista delle nuove parti contiene una part con component vuoto

        console.log('newPartsList pre:', this.newPartsList);
		console.log('existingPart:', existingPart);
        //Aggiorno con i nuovi valori anche la lista di oggetti newPartsList
            // Trova l'indice dell'oggetto con lo stesso ID in newPartsList
            const indexToUpdate = this.newPartsList.findIndex(part => part.Id === existingPart.Id);

            // Se trovi l'indice, esegui la sostituzione
            if (indexToUpdate !== -1) {
                // Sostituisci le proprietà dell'oggetto trovato con quelle di existingPart
                this.newPartsList[indexToUpdate] = {
                    ...this.newPartsList[indexToUpdate],
                    ...existingPart
                };
            }
            console.log('newPartsList post:', this.newPartsList); 
            
        //Controllo se la lista appena aggiornata newPartsList contiene parts in cui non vi è popolato il Component. In caso positivo disabilito button di salvataggio
            if(this.newPartsList.some(part => !part.Component && !part.GameComponent__c)) this.hideSaveAllParts = true; 
            console.log('hideSaveAllParts:', this.hideSaveAllParts);
            console.log('Is New Part?', this.isNewPart);
            console.log('Is New Product?', this.newProducts);

    }

    hasNullOrUndefinedOrEmptyComponent(obj) 
    {
        return obj.Component !== null || obj.Component !== undefined || obj.Component == '';
    }

    checkGameExistingRecord(obj) 
    {
        console.log('obj:', obj);
        console.log('obj.GameComponent__c:', obj.GameComponent__c);
        return obj.GameComponent__c === null || obj.GameComponent__c === undefined || obj.GameComponent__c === '';
    }

    handleRefreshEvent(event)
    {
        const context = event.detail.context;
        
        const recordId = event.detail.recordId;
        
        const newPart = {}
        
        switch (context) 
        {
            case 'delete':
                this.generateListExistingParts = this.generateListExistingParts.filter(part => part.Id !== recordId);
                this.showParts = this.generateListExistingParts.length > 0 ? true : false;
                break;

            case 'insert':
                newPart = event.detail.newPart;
                
                this.generateListExistingParts = [...this.generateListExistingParts, event.detail.newPart];
                
                this.showNewParts = false;
                this.showParts = this.generateListExistingParts.length > 0 ? true : false;
                this.newPartsList = [];
                //this.showTableParts = true;
                break;
                
            case 'SaveAllNewParts':
                this.generateListExistingParts = [...this.generateListExistingParts, event.detail.newParts];
                break;

            case 'clone':
                const partCloned = event.detail.partCloned;
                partCloned.Id = recordId;
                this.generateListExistingParts = [...this.generateListExistingParts, partCloned];
                break;

            default:
                this.generateListExistingParts = [...this.generateListExistingParts];
                break;
        }

        this.handleReloadPage();

    }

    handleInputChange(event) 
    {
        let Q1__c = this.record.Q1__c;
        let Q2__c = this.record.Q2__c;
        let Q3__c = this.record.Q3__c;
        let Q4__c = this.record.Q4__c;
        let Q5__c = this.record.Q5__c;

        const fieldName = event.target.dataset.fieldName;
        const value = event.target.value;
        if(fieldName === 'Q1__c') Q1__c = value;
        if(fieldName === 'Q2__c') Q2__c = value;
        if(fieldName === 'Q3__c') Q3__c = value;
        if(fieldName === 'Q4__c') Q4__c = value;
        if(fieldName === 'Q5__c') Q5__c = value;
        
        const keyBox = event.target.dataset.key;

        const updatedRecord = { ...this.record };
        updatedRecord[fieldName] = value;
        this.record = updatedRecord;

        //Get of value of quantity of Box Table
        const dynamicQuantity1 = ( Q1__c === '' ||  Q1__c === undefined) ||  Q1__c === null ? 'Qty 1' : 'Qty ' +  this.record.Q1__c;
        const dynamicQuantity2 = ( Q2__c === '' ||  Q2__c === undefined) ||  Q2__c === null ? 'Qty 2' : 'Qty ' +  this.record.Q2__c;
        const dynamicQuantity3 = ( Q3__c === '' ||  Q3__c === undefined) ||  Q3__c === null ? 'Qty 3' : 'Qty ' +  this.record.Q3__c;
        const dynamicQuantity4 = ( Q4__c === '' ||  Q4__c === undefined) ||  Q4__c === null ? 'Qty 4' : 'Qty ' +  this.record.Q4__c;
        const dynamicQuantity5 = ( Q5__c === '' ||  Q5__c === undefined) ||  Q5__c === null ? 'Qty 5' : 'Qty ' +  this.record.Q5__c;

        const newPartHeaderColumn = 
        [
            { label: 'Component',       fieldName: 'Component',             type: 'text',      editable: true },
            { label: 'Dimension',       fieldName: 'Dimension__c',          type: 'text',      editable: true },
            { label: 'Printing',        fieldName: 'Printing__c',           type: 'text',      editable: true },
            { label: 'Material',        fieldName: 'Material__c',           type: 'text',      editable: true },
            { label: 'Finish',          fieldName: 'Finish__c',             type: 'text',      editable: true },
            { label: 'Quantity',        fieldName: 'Quantity__c',           type: 'integer',   editable: true },
            { label: 'Remarks',         fieldName: 'Remark__c',             type: 'text',      editable: true },
            { label: 'Developing',      fieldName: 'DevelopingCNY__c',      type: 'decimal',   editable: true },
            { label: 'Plate\nChange',   fieldName: 'PlateChangeCNY__c',     type: 'decimal',   editable: true },
            { label: dynamicQuantity1,  fieldName: 'PriceQ1CNY__c',         type: 'decimal',   editable: true },
            { label: dynamicQuantity2,  fieldName: 'PriceQ2CNY__c',         type: 'decimal',   editable: true },
            { label: dynamicQuantity3,  fieldName: 'PriceQ3CNY__c',         type: 'decimal',   editable: true },
            { label: dynamicQuantity4,  fieldName: 'PriceQ4CNY__c',         type: 'decimal',   editable: true },
            { label: dynamicQuantity5,  fieldName: 'PriceQ5CNY__c',         type: 'decimal',   editable: true },
            { label: '',                fieldName: 'buttons',               type: 'button',    editable: false}
        ];
        
        // Add new values to Header of Part Table
        this.partHeader = newPartHeaderColumn;

        const newHeaderEvent = new CustomEvent('updateheader', { detail: this.partHeader });
        this.dispatchEvent(newHeaderEvent);
    }

    showConfirm = false;
    confirmButton()
    {
        this.showConfirm = true;
    }

    handleSaveBoxModified()
    {
        this.spinner = true;
        let context = this.isNew ? 'New Box' : 'Box Modified';
        this.showConfirm = false;
        saveNewBox({newBox : this.record, quoteId : this.quoteId, context : context}).then(result =>
        {      
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

    @track box;
    @track updateHeader = false;
    @track showRecordVoid = false;
    handleInputChangePart(event) 
    {
        const fieldName = event.target.fieldName;
        const value = event.target.value;
        const key = event.target.dataset.key; // Ottengo la chiave univoca dalla data-key
        let totalBox = [];

        const updatedPartList = this.partList.map(part => 
        {
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

        this.recordList.forEach(box => 
        {
            let matchingParts = this.partList.filter(part => part.boxId === box.Id);
            if (matchingParts.length > 0) 
            {
                totalBox.push({ box, part: matchingParts });
            }
        });
        
        const partEvent = new CustomEvent('box', { detail: totalBox });
        this.dispatchEvent(partEvent);

    }    

    handleSaveAllExistingParts()
    {
        console.log('CLICK ON SAVE ALL');
        this.spinner = true;
        let context = 'UpdateAllParts';
        if(this.selectedPart) { this.isNewPart = false; this.newProducts = false; }

        console.log('handleSaveAllExistingParts - selectedPart', this.selectedPart);
        console.log('handleSaveAllExistingParts - is new Part?', this.isNewPart);
        console.log('handleSaveAllExistingParts - is new Product?', this.newProducts);
        if(this.isNewPart)
        {
            this.insertNewGameNewPart();
        }
        else if(this.newProducts && !this.isNewPart)
        {
            
            this.insertNewGame();
        }
        else
        {
            saveNewPart({newPart : this.generateListExistingParts, quoteId : this.quoteId, boxId : this.record.Id, context : context}).then(result =>
            {      
                if(result.Status === 200)
                {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Parts Updated Correctly.',
                            message: 'Success',
                            variant: 'success',
                        }),
                    );  
                }
               
                this.spinner = false;
                //this.handleReloadPage(); to activate
            }).catch(() => 
            {      
                this.spinner = false;
            });  
        }
        this.handleReloadPage();
    }

    insertNewGame()
    {
        this.spinner = true;
        let context = 'UpdateAllParts';

		const existingPartsMap = {};
		// Popola l'oggetto con gli elementi esistenti
		this.generateListExistingParts.forEach(existingPart => {
			existingPartsMap[existingPart.Id] = existingPart;
		});

        console.log('context:', context);

        //createNewGameFromPart({gameListToInsert : this.generateListExistingParts, quoteId : this.quoteId, boxId : this.record.Id, context : context }).then(result =>
        createNewGameFromPart({gameListToInsert : this.updatedPartListTemp, quoteId : this.quoteId, boxId : this.record.Id, context : context }).then(result =>
        {      

            this.generateListExistingParts = result;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Game Created Correctly.',
                    message: 'Success',
                    variant: 'success'
                })
            );  
            this.spinner = false;
            this.handleReloadPage(); 
            
        }).catch(() => 
        {      
            this.spinner = false;
        });  
    }

    insertNewGameNewPart()
    {
        this.spinner = true;
        this.context = 'SaveAllNewParts';
        console.log('gameListToInsert:', this.updatedPartListTemp);
        createNewGameFromPart({gameListToInsert : this.updatedPartListTemp, quoteId : this.quoteId, boxId : this.record.Id, context : this.context }).then(result =>
        {      
            this.generateListExistingParts = result;
            console.log('generateListExistingParts:', this.generateListExistingParts);
            
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Game Created Correctly.',
                    message: 'Success',
                    variant: 'success'
                })
            );  
            this.spinner = false;
            this.handleReloadPage(); 
        }).catch(() => 
        {      
            this.spinner = false;
        });  
    }

    handleSaveNewParts()
    {
        
        this.spinner = true;
        let context = 'SaveAllNewParts';
        console.log('Is New Part?', this.isNewPart);
        console.log('Is New Product?', this.newProducts);
       
        //if(this.isNewPart && this.newProducts)
        if(this.isNewPart)
        {
            this.insertNewGameNewPart();
        }
        else if(this.newProducts && !this.isNewPart)
        {
            this.insertNewGame();
        }
        else 
        {
            //saveNewPart({newPart : this.newPartsList, quoteId : this.quoteId, boxId : this.record.Id, context : context}).then(result => EZ commentato 10/01 - cambiato lista input
            saveNewPart({newPart : this.newPartsList, quoteId : this.quoteId, boxId : this.record.Id, context : context}).then(result =>
            {      
                let listAllParts = result.listParts;
                console.log('listAllParts:', listAllParts);
                
                //this.generateListExistingParts = [...this.generateListExistingParts, ...listAllParts];
                //console.log('generateListExistingParts:', this.generateListExistingParts);
                
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
                this.handleReloadPage(); 
           
                this.spinner = false;
            }).catch(() => 
            {      
                this.spinner = false;
            });  
        }
        this.spinner = false;
    }

    handleRemoveRow() 
    {
        const rowId = this.row.Id;
        const removeEvent = new CustomEvent('remove', { detail: rowId });
        this.dispatchEvent(removeEvent);
    }

    @track selectedPart;
    saveAllExistingParts(event) 
    {
        let existingPart = event.detail.singleExistingPart;
        this.selectedPart = event.detail.selectedPart;

        //if(this.gameSelected) { this.selectedPart = ''; }

        console.log('ExistingQuote - existingPart:', existingPart);
        const updatedPartList = this.generateListExistingParts.map(singlePart => 
        {
            if (singlePart.Id === existingPart.Id) 
            {
                return {
                    ...singlePart,
                    ...existingPart
                };
            }
            return singlePart;
        });
        console.log('ExistingQuote - updatedPartList:', updatedPartList);
        this.generateListExistingParts = [...updatedPartList];
        console.log('ExistingQuote - generateListExistingParts:', this.generateListExistingParts);

        console.log('ExistingQuote - idMap pre Update:', this.idMap);
        if (existingPart.Id in this.idMap) 
        {
            // Effettua l'aggiornamento direttamente sull'oggetto
            this.idMap[existingPart.Id] = {
                ...this.idMap[existingPart.Id],
                ...existingPart
            };
        } 
        console.log('ExistingQuote - idMap post Update:', this.idMap);

        if (this.generateListExistingParts.some(part => (part.Component || part.GameComponent__c) )) this.hideSaveAllParts = false; //controllo se la lista delle nuove parti contiene una part con component vuoto

        /*if(this.generateListExistingParts.some(part => this.checkGameExistingRecord(part)))
        {
            this.hideSaveAllParts = true; 
        }
        else 
        {
            this.hideSaveAllParts = false;
        }*/
    }

    handleSaveAllNewParts(event) 
    {
        let newSinglePart = event.detail.newSinglePart;
        this.newProducts = event.detail.newProduct;
        this.index = event.detail.index;
		console.log('newProducts:', this.newProducts);
		console.log('newSinglePart:', newSinglePart);
		console.log('record id:', this.record.Id);
		console.log('newPartsList:', this.newPartsList);
        newSinglePart.boxId = this.record.Id;

		// Popola l'oggetto con gli elementi esistenti
		this.updatedPartList.forEach(singlePart => {
            console.log('singlePart:', singlePart);
			// Verifica se l'ID è già presente in idMap
			if (!this.idMap[singlePart.Id]) {
				// Se non è presente, aggiungi l'elemento a idMap
				this.idMap[singlePart.Id] = singlePart;
			}
		});
        console.log('this.updatedPartList:', this.updatedPartList);
		// Aggiungi o aggiorna l'elemento esistente
		this.idMap[newSinglePart.Id] = {
            ...this.idMap[newSinglePart.Id],
			...newSinglePart
		};
		
		this.updatedPartListTemp = this.idMap;
       
        this.isNewPart = true;
        
        // Verifica se newPartsList contiene un elemento con lo stesso Id di newSinglePart
        const indexToUpdate = this.newPartsList.findIndex(part => part.Id === newSinglePart.Id);
        console.log('indexToUpdate:', indexToUpdate);
        
        if (indexToUpdate !== -1) {
            // Se esiste, sostituisci l'elemento con lo stesso Id
            this.newPartsList[indexToUpdate] = newSinglePart;
        } else {
            // Se non esiste, aggiungi newSinglePart alla lista
            this.newPartsList.push(newSinglePart);
        }
        console.log('newPartsList:', this.newPartsList);

        if (this.newPartsList.some(part => {
            console.log('Component:', part.Component);
            console.log('GameComponent:', part.GameComponent__c);
            return (!part.Component && !part.GameComponent__c);
        })) 
        {
            console.log('Dentro if 773');
            this.hideSaveAllParts = true;
        }
        else this.hideSaveAllParts = false;
        
    }

    activeSections = ['Box', 'Parts'];
    activeSectionsMessage = '';
    showAddPart = true;
    handleSectionToggle(event) 
    {
        const openSections = event.detail.openSections;
        
        if (openSections.length === 0) 
        {
            this.activeSectionsMessage = 'All sections are closed';
            this.showAddPart = false;
        }
        else 
        {
            this.showAddPart = true;
            this.activeSectionsMessage =
                'Open sections: ' + openSections.join(', ');
        }
    }

    showClonedBox = false;
    @track clonedBox = {};
    context;

    handleCloneBox(event)
    {
        this.spinner = true;
        this.context = 'ClonedBox';
        this.reactiveKeyBox++;
        console.log('record cloned:', this.record);
        const clonedRow = { ...this.record };
        
        // Assegna un ID provvisorio alla riga clonata
        clonedRow.Id = 'Box ' + this.reactiveKeyBox; 
        
        this.clonedBox = clonedRow;
        console.log('clonedBox:', this.clonedBox);
        
        this.showClonedBox = true;

        this.spinner = true;
        saveNewBox({newBox : this.clonedBox, quoteId : this.quoteId, context : this.context}).then(result =>
        {      
            
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
            this.handleReloadPage();
        }).catch(() => 
        {      
            this.spinner = false;
        });  
        /*const cloneBoxEvent = new CustomEvent('clonedbox', { detail: this.clonedBox });
        this.dispatchEvent(cloneBoxEvent);*/
    }

    handleReloadPage() {
        // Ricarica la pagina
        location.reload(); // O alternativamente: window.location.reload();
    }

    handleDeleteBox()
    {
        this.spinner = true;

        deleteBox({boxIdToDelete : this.record.Id}).then(result =>
        {      
            if(result.Status === 200)
            {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Box Deleted Correctly.',
                        message: 'Success',
                        variant: 'success',
                    }),
                );  
            }
            this.handleReloadPage();
            this.spinner = false;
        }).catch(() => 
        {      
            this.spinner = false;
        });  
    }

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

    @track clonedPart = {};
    
    handleClonedNewPart(event)
    {
        this.clonedPart = event.detail.clonedPart;
        this.reactiveKeyPart = event.detail.reactiveKeyPart;
        //this.keyPart = event.detail.keyPart;
       
        this.newPartsList = [...this.newPartsList, this.clonedPart];
        console.log('List Part with cloend part:', this.newPartsList);
    }

    disabledSaveBox;
    handleDisabledBox(event)
    {
        this.disabledSaveBox = event.detail;
    }

    handleDeleteNewPart(event)
    {
        const partId = event.detail.partId;

        //rimuovo l'elemento cancellato dal new part dalla lista che viene visualizzata fe
        this.newPartsList = this.newPartsList.filter(item => item.Id !== partId);
        console.log('new part list: ', this.newPartsList);

        //rimuovo l'elemento cancellato dal new part dalla lista che viene inviata all'apex
        delete this.updatedPartListTemp[partId];

        this.newPartsList.length === 0 ? this.showNewParts = false : true;

        //Devo riordinare l'index affinchè siano sequenziali
        this.newPartsList.forEach((elemento, indice) => {
            elemento.Index__c = this.lengthPart + indice; // Modifica la chiave Index__c sequenzialmente
        });

        // Ottieni le chiavi dell'oggetto JSON
        let partListTempKeys = Object.keys(this.updatedPartListTemp);
        
        let updatedListCopy = {}; // Creazione di una nuova copia dell'oggetto
        for (let i = 0; i < partListTempKeys.length; i++) 
        {
            let key = partListTempKeys[i];
            if (this.updatedPartListTemp[key]) 
            { 
                let updatedObjectCopy = { ...this.updatedPartListTemp[key] }; // Creazione di una copia dell'oggetto corrente
                updatedObjectCopy.Index__c = i; // Aggiornamento del valore Index__c nella copia
                updatedListCopy[key] = updatedObjectCopy; // Assegnazione della copia all'oggetto aggiornato
            } else {
                console.error(`Oggetto con chiave ${key} non trovato.`);
            }
        }
        this.updatedPartListTemp = updatedListCopy; 
    }
    

    //check se rimuovere questo metodo che non viene richiamato.
    handleDeleteExistingPart(event)
    {
        const existingPartId = event.detail.existingPartId;
        console.log('existingPartId:', existingPartId);
        console.log('updatedPartListTemp:', this.updatedPartListTemp);
        console.log('gameListToInsert:', this.gameListToInsert);
        this.updatedPartListTemp = this.updatedPartListTemp.filter(item => item.Id !== existingPartId);
        this.gameListToInsert = this.gameListToInsert.filter(item => item.Id !== existingPartId);
        console.log('list without existing part:', this.updatedPartListTemp);
        console.log('gameListToInsert without existing part:', this.gameListToInsert);

    }
    
}
