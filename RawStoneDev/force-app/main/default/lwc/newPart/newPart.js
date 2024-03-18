import createNewGame from "@salesforce/apex/QuoteBuilderHelper.createNewGame";
import saveNewPart from "@salesforce/apex/QuoteBuilderHelper.saveNewPart";
import PART_OBJECT from '@salesforce/schema/Part__c';
import FINISH_FIELD from "@salesforce/schema/Part__c.Finish__c";
import PRINTING_FIELD from "@salesforce/schema/Part__c.Printing__c";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import { LightningElement, api, track, wire } from 'lwc';




export default class NewPart extends LightningElement 
{
    @api newPart;
    @api keyPart;
    @api quoteId;
    @api boxId;
    @api finishValues;
    @api partHeader;
    //@track printingValues;
    mappingFields = [];
    gameList = [];
    @api objectName = 'Part__c';
    objectInfoData;
    defaultRecordTypeId;

        
    isLoaded = false;
    spinner = false;

    @track newPartsList = []; 

    /*@wire(getObjectInfo, { objectApiName: PART_OBJECT })
    wireObjectInfo({ error, data }){
        if(data){
            this.objectInfoData = data; // if you still need it
            console.log('this.objectInfoData:', this.objectInfoData);
            this.defaultRecordTypeId = data.defaultRecordTypeId;
        } else if (error) {
             //handle error
        }
    }*/
   
    @wire(getObjectInfo, { objectApiName: PART_OBJECT })
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: "$objectInfo.data.defaultRecordTypeId",
        fieldApiName: PRINTING_FIELD
    })
    printingValues;

    @wire(getPicklistValues, {
        recordTypeId: "$objectInfo.data.defaultRecordTypeId",
        fieldApiName: FINISH_FIELD
    })
    finishValues;

    get printingOptions() {
        return this.printingValues.data ? this.printingValues.data.values : [];
    }

    get finishOptions() {
        return this.finishValues.data ? this.finishValues.data.values : [];
    }

    connectedCallback()
    {
        console.log('@api newPart:', this.newPart);
        console.log('@api quoteId:', this.quoteId);
        console.log('@api keyPart:', this.keyPart);
        this.checkRequiredFieldPrice();   
    }

    @track partRequired = {};
    checkRequiredFieldPrice()
    {
        const fieldRequired = this.partHeader
            .filter(field => field.label.includes("Qty"))
            .filter(field => field.label !== "Qty 0");

        let listFieldRequired = [];
        // Verifica se ci sono proprietà corrispondenti e ottieni i loro valori
        if (fieldRequired.length > 0) 
        {
            fieldRequired.forEach(field => 
            {
                const fieldRequiredValue = field.fieldName;
                listFieldRequired.push(fieldRequiredValue);
            });
        } 
        else 
        {
            console.log("Nessuna proprietà Qty trovata nell'oggetto.");
        }

        listFieldRequired.forEach(key => {
            const value = this.newPart[key];
            const required = fieldRequired.some(field => field.fieldName === key) || false;

            this.partRequired[key] = {
                value: value,
                required: required
            };
        });

        //Set required = false if price non included in listFieldRequired
        Object.keys(this.newPart).forEach(key => 
        {
            if (!listFieldRequired.includes(key)) 
            {
                this.partRequired[key] = {
                    value: this.newPart[key],
                    required: false
                };
            }
        });
        console.log('partRequired:', this.partRequired);
    }

    handleInputPart(event) 
    {
        const fieldName = event.target.fieldName;
        const value = event.target.value;
        console.log(fieldName + ': ' + value);
        const key = event.target.dataset.key; // Ottengo la chiave univoca dalla data-key
        
        let numericValue = 0;
        if (fieldName === 'Quantity__c' || fieldName === 'DevelopingCNY__c'|| fieldName === 'PlateChangeCNY__c'|| 
            fieldName === 'PriceQ1CNY__c'|| fieldName === 'PriceQ2CNY__c'|| fieldName === 'PriceQ3CNY__c'|| 
            fieldName === 'PriceQ4CNY__c'|| fieldName === 'PriceQ5CNY__c') 
        {
            numericValue = parseFloat(value);
            this.newPart = { ...this.newPart, [fieldName]: numericValue };
        }
        else
        {
            this.newPart = { ...this.newPart, [fieldName]: value };
        }
        this.disableSavePart = false;

        if(this.newPart.Component !== null && this.newPart.Component !== '')
        {
            this.newProduct = false;
        }
        else this.newProduct = true;

        console.log('### New Part ### newPart:', this.newPart);

		this.handleSaveRow();
        
    }

    reactiveKeyPart = 0;
    @track clonedPart = {};
    showNewClonedPart = false;
    handleClonePart(event)
    {
        this.spinner = true;
        this.context = 'Cloned';
        this.reactiveKeyPart++;
        console.log('record to clone:', this.newPart);
        const clonedRow = { ...this.newPart };
        
        
        // Assegna un ID provvisorio alla riga clonata
        clonedRow.Id = 'PartCloned ' + this.reactiveKeyPart; 
        console.log('this.clonedRow: ', clonedRow);
        this.clonedPart = clonedRow;
        console.log('this.clonedPart: ', this.clonedPart);
        
        this.spinner = false;
        const clonePart = new CustomEvent('clonepart', { detail: this.clonedPart });
        this.dispatchEvent(clonePart);
        this.showNewClonedPart = true;
    }

    showConfirm = false;
    confirmButton()
    {
        console.log('Click on Save New Part');
        this.spinner = true;
        this.showConfirm = true;
        this.newPart = { ...this.newPart, 'Component' : this.gameSelected }
        console.log('newPart: ' , this.newPart);
        this.spinner = false;
        
    }

    handleNotSure()
    {
        this.showConfirm = false;
    }

    @track newGame = {};
    buildGameStructure()
    {
        this.newGame = 
        {
            Id: '',
            Name: ''
        };
    }
    
    showModal;
    showErrorToast = false;
    handleSavePart()
    {
        this.showErrorToast = false;
        this.spinner = true;
		this.checkFields();
        let context = 'New Part';
        this.showConfirm = false;
        console.log('NewPart - handleSavePart - newPart:', this.newPart);

        Object.keys(this.newPart).forEach(key => 
        {
            console.log('key:', key);
            console.log('this.newPart[key]:', this.newPart[key]);
            console.log(key + ' is null?', this.newPart[key] == null);
            console.log(key + ' is null?', this.newPart[key] === null);

            if (this.partRequired[key]?.required == true && (isNaN(this.newPart[key]) || this.newPart[key] === 0 || this.newPart[key] === null || this.newPart[key] === undefined))
            {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error.',
                        message: 'The required field ' + key + ' was not filled in',
                        variant: 'error',
                    }),
                );  
                this.showErrorToast = true;
                this.disableSavePart = true;
                return;
            }
        });
        console.log('handleSavePart - showErrorToast:', this.showErrorToast);
        console.log('handleSavePart - showModalNewProduct:', this.showModalNewProduct);

        if (!this.showErrorToast) 
        {
            //Mostra modale per chiedere se si è sicuri di creare un nuovo prodotto
            if(this.showModalNewProduct) 
            {
                this.showModal = true;
            }
            else
            {
                saveNewPart({newPart : this.newPart, quoteId : this.quoteId, boxId : this.boxId, context : context}).then(result =>
                {      
                    console.log('result:', result);
                    let newPart = result.Part;       
                    console.log('newGame:', this.newGame);
                    
                    newPart.GameComponent__r = this.newGame;
                    console.log('newPart:', newPart);
    
                    if(result.Status === 200)
                    {
                        console.table(result.Part);
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Part Created Correctly.',
                                message: 'Success',
                                variant: 'success',
                            }),
                        );  
                        this.spinner = false;
                        try
                        {
                            this.dispatchEvent
                            (
                                new CustomEvent('refreshevent', { 
                                    bubbles: true, 
                                    composed: true, 
                                    detail: {
                                        context: 'insert',
                                        recordId: newPart.Id,
                                        newPart: newPart
                                        //nameGame: this.nameGame
                                    }
                                })
                            );
                        }catch(e){console.log('errore ' + e)}
                    }
                
                    this.spinner = false;
                    //this.handleReloadPage();
                }).catch(() => 
                {      
                    this.spinner = false;
                });
            }
            
        }
        this.spinner = false;
    }

    showModalNewProduct;
    newGame;
    hideSaveAllParts;
    newProduct = false;
    isNewPart = false;
    isNewProduct = false;
    handleCreateNewGame(event)
    {
        this.showModalNewProduct = event.detail.showModalNewProduct;
        this.isNewPart = true;
        this.newGame = event.detail.newGame;
        this.isNewProduct = true;
        console.log('handleCreateNewGame - showModalNewProduct:', this.showModalNewProduct);
        console.log('handleCreateNewGame - newGame:', this.newGame);
       
        this.gameSelected = event.detail.gameName;
        console.log('gameSelected:', this.gameSelected);
        console.log('gameSelected.length:', this.gameSelected.length);
        //this.checkFields();)
        if(this.newGame && this.newGame.Name !== null && this.newGame.Name !== '' && this.gameSelected.length === 0) 
        {
            //this.disableSavePart = false;
            this.hideSaveAllParts = false;
            const updatedPart = { ...this.newPart };
            
            // Modifica la copia
            updatedPart.GameComponent__c = this.newGame.Name;
            //updatedPart.Component = this.newGame.Name;
            console.log('updatedPart:', updatedPart);
            // Fai una copia dell'oggetto GameComponent__r
            //const game = { ...updatedPart.Component }; // Creazione di una copia modificabile
            const GameComponent__r = {Id: '', Name : this.newGame.Name };
            console.log('GameComponent__r:', GameComponent__r);
            updatedPart.GameComponent__r = GameComponent__r;

            // Aggiorna newPart con la copia modificata
            this.newPart = {...this.newPart, ...updatedPart};
            console.log('newPart post:', this.newPart);
        }
        else if((this.newGame.Name === null || this.newGame.Name === '') && this.gameSelected.length !== 0 ) 
        {
            this.disableSavePart = false;
            this.hideSaveAllParts = false;
            const updatedPart = { ...this.newPart };
            console.log('handleCreateNewGame - updatedPart:', updatedPart);

            // Modifica la copia
            updatedPart.GameComponent__c = '';
            console.log('handleCreateNewGame - updatedPart:', updatedPart);

            // Fai una copia dell'oggetto GameComponent__r
            const game = { ...updatedPart.GameComponent__r }; // Creazione di una copia modificabile
            game.Name = this.newGame.Name;
            console.log('handleCreateNewGame - game:', game);

            // Aggiorna i campi dell'oggetto copiato
            updatedPart.GameComponent__r = game;
            updatedPart.GameComponent__r.Id = '';

            console.log('handleCreateNewGame - updatedPart:', updatedPart);
            
            // Aggiorna existingPart con la copia modificata
            this.newPart = updatedPart;
        }
        else 
        {
            this.hideSaveAllParts = true;
            this.disableSavePart = true;
        }        

        console.log('handleCreateNewGame - newPart: ', this.newPart);
        
        //this.handleSaveRow();
        console.log('handleCreateNewGame - isNewPart:', this.isNewPart);
        this.dispatchEvent(
            new CustomEvent('saveallparts', 
            { 
                bubbles: true, 
                composed: true, 
                detail: {
                    hideSaveAllParts : this.hideSaveAllParts,
                    newGame : this.newGame,
                    gameSelected : this.gameSelected,
                    partId : this.newPart.Id,
                    existingPart : this.newPart, 
                    isNewPart : this.isNewPart,
                    isNewProduct: this.isNewProduct
                }
            })
        );
    }

    closeCreateNewGame()
    {
        this.showModal = false;
        this.disableSavePart = false;
    }

    insertNewGame()
    {
        this.spinner = true;
        createNewGame({gameName : this.newGame.Name}).then(result =>
        {      
            console.log('result:', result);
            if(result.Status === 'Success')
            {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Game Created Correctly.',
                        message: 'Success',
                        variant: 'success',
                    })
                );  
                this.showModal = false;
                console.log('result.GameId:', result.GameId);
                this.newPart = {
                    ...this.newPart,
                    Component: result.GameId
                };
                console.log('this.newPart with new Game:', this.newPart);
                this.showModalNewProduct = false;
                console.log('showModalNewProduct after insert game:', this.showModalNewProduct);
                this.handleSavePart();
                this.spinner = false;
            }
            else 
            {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Attention.',
                        message: result.Message,
                        variant: 'error',
                    })
                );  
            }
            this.spinner = false;
        }).catch(() => 
        {      
            this.spinner = false;
        });  
    }

	disableSavePart = true;
    checkFields()
	{
        console.log('checkFields - gameSelected:', this.gameSelected);
		if(this.gameSelected === undefined || this.gameSelected === '' || this.gameSelected === null) this.disableSavePart = true;
		else this.disableSavePart = false;
        console.log('checkFields - disableSavePart:', this.disableSavePart);
	}


    //Reload Page
    handleReloadPage() 
    { 
        location.reload(); 
    }

    @track gameSelected;
    @track nameGame;
    handleGameSelected(event)
    {
        this.gameSelected = event.detail.value;
        this.nameGame = event.detail.gameName;
        let name = event.detail.name;
        this.showModalNewProduct = event.detail.showModalNewProduct;
        console.log('### newPart --> newPart:', this.newPart);
        
        this.newGame = 
        {
            Id: this.gameSelected,
            Name:  name
        };
        console.log('### newPart --> newGame:', this.newGame);
        
        console.log('### newPart --> gameSelected:', this.gameSelected);
		if(this.gameSelected === undefined || this.gameSelected === '' || this.gameSelected === null) this.disableSavePart = true;
		else 
		{ 
			this.disableSavePart = false;         
			this.newPart = { ...this.newPart, 'Component' : this.gameSelected } 
		}
      
        this.newPart.GameComponent__r = this.newGame;
        this.newPart.GameComponent__c = this.newGame.Id;
        console.log(' newPart --> newPart with game:', this.newPart);

        const singleNewPart = this.newPart;
        console.log('### newPart --> singleNewPart:', singleNewPart);

        this.dispatchEvent(
            new CustomEvent('createsinglepart', 
            { 
                bubbles: true, 
                composed: true, 
                detail: {
                    //hideSaveAllParts : this.hideSaveAllParts,
                    //newGame : this.newGame,
                    newProduct : this.newProduct,
                    gameSelected : this.gameSelected,
                    //partId : this.newPart.Id,
                    newSinglePart : singleNewPart
                }
            })
        );
    }

    handleRemoveRow() 
    {
        const rowId = this.row.Id;
        const removeEvent = new CustomEvent('remove', { detail: rowId });
        this.dispatchEvent(removeEvent);
    }

    handleSaveRow() 
    {
        const singleNewPart = this.newPart;

        console.log('handleSaveRow - newProduct:', this.newProduct);
        
		console.log('singleNewPart:', singleNewPart);
        /*const removeEvent = new CustomEvent('createsinglepart', { detail: singleNewPart });
        this.dispatchEvent(removeEvent);*/

        this.dispatchEvent(
            new CustomEvent('createsinglepart', 
            { 
                bubbles: true, 
                composed: true, 
                detail: {
                    //hideSaveAllParts : this.hideSaveAllParts,
                    //newGame : this.newGame,
                    newProduct : this.newProduct,
                    gameSelected : this.gameSelected,
                    //partId : this.newPart.Id,
                    newSinglePart : singleNewPart
                }
            })
        );
    }

    handleDeletePart()
    {
        console.log('Click on Delete Box');
        console.log('record:', this.newPart.Id);
        this.spinner = true;

        this.dispatchEvent(
            new CustomEvent('deletenewpart', 
            { 
                bubbles: true, 
                composed: true, 
                detail: {
                    partId : this.newPart.Id
                }
            })
        );
        this.spinner = false;

    }
    
}