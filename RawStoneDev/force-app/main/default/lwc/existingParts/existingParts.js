import createNewGame from "@salesforce/apex/QuoteBuilderHelper.createNewGame";
import deletePart from "@salesforce/apex/QuoteBuilderHelper.deletePart";
import saveNewPart from "@salesforce/apex/QuoteBuilderHelper.saveNewPart";
import PART_OBJECT from '@salesforce/schema/Part__c';
import FINISH_FIELD from "@salesforce/schema/Part__c.Finish__c";
import PRINTING_FIELD from "@salesforce/schema/Part__c.Printing__c";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import { LightningElement, api, track, wire } from 'lwc';


export default class ExistingParts extends LightningElement 
{
    @api existingPart;
    @api keyPart;
    @api quoteId;
    @api boxId;
    @api finishValues;
    @api partHeader;

    displayInfo = {
        additionalFields: ["Name"],
    };

    mappingFields = [];
    isLoaded = false;
    spinner = false;
    
    @track newPartsList = []; 

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
        console.log('existingPart:', this.existingPart);
        console.log('existingPart GameComponent__r:', this.existingPart.GameComponent__r);
        if(this.existingPart.GameComponent__r !== null || this.existingPart.GameComponent__r !== undefined)
        {
            if(this.existingPart.GameComponent__r.Name === null || this.existingPart.GameComponent__r.Name === undefined || this.existingPart.GameComponent__r.Name === '')
            {
                this.existingPart = { ...this.existingPart };
                this.existingPart.GameComponent__r.Name = '';
            }
        }

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
            const value = this.existingPart[key];
            const required = fieldRequired.some(field => field.fieldName === key) || false;

            this.partRequired[key] = {
                value: value,
                required: required
            };
        });

        //Set required = false if price non included in listFieldRequired
        Object.keys(this.existingPart).forEach(key => 
        {
            if (!listFieldRequired.includes(key)) 
            {
                this.partRequired[key] = {
                    value: this.existingPart[key],
                    required: false
                };
            }
        });
        
    }

    handleRecordPickerChange(event) {
        const text = event.detail.value.Name;
        
        // Eseguire l'azione desiderata con il record selezionato
      }

    handleInputPart(event) 
    {
        const fieldName = event.target.fieldName;
        const value = event.target.value;
        
        const key = event.target.dataset.key; // Ottengo la chiave univoca dalla data-key
        
        let numericValue = 0;
        if (fieldName === 'Quantity__c'  || fieldName === 'DevelopingCNY__c'|| fieldName === 'PlateChangeCNY__c'|| 
            fieldName === 'PriceQ1CNY__c'|| fieldName === 'PriceQ2CNY__c'   || fieldName === 'PriceQ3CNY__c'    || 
            fieldName === 'PriceQ4CNY__c'|| fieldName === 'PriceQ5CNY__c') 
        {
            numericValue = parseFloat(value);
            
            this.existingPart = { ...this.existingPart, [fieldName]: numericValue };
        }
        else
        {
            this.existingPart = { ...this.existingPart, [fieldName]: value };
        }
        
        //this.disableSavePart = false;

        this.disabledSaveBox = true;
        const disableSaveBox = new CustomEvent('disabledsavebox', { detail: this.disabledSaveBox });
        this.dispatchEvent(disableSaveBox);

        this.handleSaveRow();
        this.modal = false;
    }

    handleSaveRow() 
    {
        this.dispatchEvent(
            new CustomEvent('updateallparts', { 
                bubbles: true, 
                composed: true, 
                detail: {
                    singleExistingPart: this.existingPart,
                    recordId: this.existingPart.Id,
                    selectedPart: this.gameSelected

                }
            })
        );
    }

    showConfirm = false;
    confirmButton()
    {
        this.showConfirm = true;
        this.existingPart = { ...this.existingPart, 'Component' : this.gameSelected }

    }

    handleNotSure()
    {
        this.showConfirm = false;
    }
    
    showErrorToast = false;
    showModal = false;
    handleSavePart()
    {
        this.spinner = true;
        let context = 'Edit Part';
        this.showConfirm = false;
        this.showModal = false;

        Object.keys(this.existingPart).forEach(key => 
        {
            if (this.partRequired[key]?.required == true && (isNaN(this.existingPart[key]) || this.existingPart[key] === 0 || this.existingPart[key] === null || this.existingPart[key] === undefined)) 
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
            this.spinner = false;
        });

        if (!this.showErrorToast) 
        {
           
            if(this.newGame && this.newGame.Name !== null && this.newGame.Name !== '' && this.gameSelected.length === 0) 
            {
                this.showModal = true;
            }
            else
            {
                saveNewPart({newPart : this.existingPart, quoteId : this.quoteId, boxId : this.boxId, context : context}).then(result =>
                {      
                    
                    if(result.Status === 200)
                    {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Part Updated Correctly.',
                                message: 'Success',
                                variant: 'success',
                            }),
                        );  
                        this.dispatchEvent(
                            new CustomEvent('refreshevent', { 
                                bubbles: true, 
                                composed: true, 
                                detail: {
                                    context: 'save',
                                    recordId: this.existingPart.Id
                                }
                            })
                        );
                    }
                   
                    this.spinner = false;
                    //this.handleReloadPage();
                }).catch(() => 
                {      
                    this.spinner = false;
                });  
            }
        }
    }

    insertNewGame()
    {
        this.spinner = true;
        createNewGame({gameName : this.newGame.Name}).then(result =>
        {      
            
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
                this.existingPart = {
                    ...this.existingPart,
                    GameComponent__c: result.GameId
                };
                let newGame = 
                {
                    Id: result.GameId,
                    Name:  result.Name
                };
                this.existingPart.GameComponent__r = newGame;
                
                this.showModalNewProduct = false;
                
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

    closeCreateNewGame()
    {
        this.showModal = false;
    }

    showModalNewProduct;
    newGame;
	disableSavePart = true;
	hideSaveAllParts = true;
    @track gameListToInsert = [];
    handleCreateNewGame(event)
    {
        this.showModalNewProduct = event.detail.showModalNewProduct;
        this.newGame = event.detail.newGame;
        this.gameSelected = event.detail.gameName;

        console.log('Show Modal New Product:', this.showModalNewProduct);
        console.log('newGame:', this.newGame);
        console.log('gameSelected:', this.gameSelected);
        
        if( this.newGame.Name !== null && this.newGame.Name !== '' && this.gameSelected.length === 0) 
        {
            this.disableSavePart = false;
            this.hideSaveAllParts = false;
            console.log('this.existingPart:', this.existingPart);
            //this.existingPart.GameComponent__r = '';
            const updatedPart = { ...this.existingPart };
            
            // Modifica la copia
            updatedPart.GameComponent__c = '';
            
            // Fai una copia dell'oggetto GameComponent__r
            const game = { ...updatedPart.GameComponent__r }; // Creazione di una copia modificabile
            game.Name = this.newGame.Name;
            console.log('game:', game);
            
            // Aggiorna i campi dell'oggetto copiato
            updatedPart.GameComponent__r = game;
            updatedPart.GameComponent__r.Id = '';
            
            // Aggiorna existingPart con la copia modificata
            this.existingPart = updatedPart;
            console.log('existingPart:', this.existingPart);
        }
        else if((this.newGame.Name === null || this.newGame.Name === '') && this.gameSelected.length !== 0 ) 
        {
            this.disableSavePart = false;
            this.hideSaveAllParts = false;
            const updatedPart = { ...this.existingPart };

            // Modifica la copia
            updatedPart.GameComponent__c = '';

            // Fai una copia dell'oggetto GameComponent__r
            const game = { ...updatedPart.GameComponent__r }; // Creazione di una copia modificabile
            game.Name = this.newGame.Name;

            // Aggiorna i campi dell'oggetto copiato
            updatedPart.GameComponent__r = game;
            updatedPart.GameComponent__r.Id = '';
            
            // Aggiorna existingPart con la copia modificata
            this.existingPart = updatedPart;
        }
        else 
        {
            this.hideSaveAllParts = true;
            this.disableSavePart = true;
        }

        this.dispatchEvent(
            new CustomEvent('saveallparts', 
            { 
                bubbles: true, 
                composed: true, 
                detail: {
                    hideSaveAllParts : this.hideSaveAllParts,
                    newGame : this.newGame,
                    gameSelected : this.gameSelected,
                    partId : this.existingPart.Id,
                    existingPart : this.existingPart,
                    newPart : false,
                    isNewProduct : true
                }
            })
        );
        /*const showSaveAllEvent = new CustomEvent('saveallparts', { detail: this.hideSaveAllParts });
        this.dispatchEvent(showSaveAllEvent);*/

    }

    checkFields()
	{
		if(this.gameSelected === undefined || this.gameSelected === '' || this.gameSelected === null) this.disableSavePart = true;
		else this.disableSavePart = false;
	}

    showDataList = true;
    /*handleFocusOut()
    {
        this.showDataList = false;
    }*/

    @track gameSelected;
    @track nameGame;
    @track game = {};
    handleGameSelected(event)
    {
        if(!event.detail.existingProduct)
        {
            this.nameGame = event.detail.name;
            let gameId = event.detail.value;
            
            this.gameSelected = event.detail.gameSelected;
            this.newProduct = false;
            
            this.game = {Id: gameId, Name : this.gameSelected};

            console.log('nameGame:', this.nameGame);
            console.log('gameId:', gameId);
            console.log('gameSelected:', this.gameSelected);
            console.log('game:', this.game);

            if(this.gameSelected === undefined || this.gameSelected === '' || this.gameSelected === null) 
            {
                this.disableSavePart = true;
            }
            else 
            { 
                this.disableSavePart = false;         
                this.existingPart = { ...this.existingPart, 'GameComponent__c' : gameId } 
            }
            this.existingPart.GameComponent__r = this.game;
    
            console.log('existingPart :', this.existingPart);
            this.handleSaveRow();
            //this.gameSelected = event.detail.value; //Commentato, da capire motivo esistenza
        }
        else
        {
            console.log('Existing product :', event.detail.gameName);
        }
    }

    handleRemoveRow() 
    {
        const rowId = this.row.Id;
        const removeEvent = new CustomEvent('remove', { detail: rowId });
        this.dispatchEvent(removeEvent);
    }

    handleDeletePart()
    {
        this.spinner = true;

        deletePart({partIdToDelete : this.existingPart.Id}).then(result =>
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
                this.dispatchEvent(
                    new CustomEvent('refreshevent', { 
                        bubbles: true, 
                        composed: true, 
                        detail: {
                            context: 'delete',
                            recordId: this.existingPart.Id
                        }
                    })
                );
            }
            this.handleReloadPage();
            
            //reload single component
            //let deletePart = true;
            /*this.dispatchEvent(
                new CustomEvent('deleteexistingpart', 
                { 
                    bubbles: true, 
                    composed: true, 
                    detail: {
                        existingPartId : this.existingPart.Id
                    }
                })
            );*/
            this.spinner = false;
        }).catch(() => 
        {      
            this.spinner = false;
        });  

    }

    handleReloadPage() {
        // Ricarica la pagina
        location.reload();
    }

    refreshParent(){
        this.dispatchEvent(new CustomEvent('refreshevent', { bubbles: true, composed: true }));
    }

    reactiveKeyPart = 0;
    @track clonedPart = {};
    handleClonePart(event)
    {
        
        this.spinner = true;
        this.context = 'Cloned';
        this.reactiveKeyPart++;
        
        const clonedRow = { ...this.existingPart };
        
        clonedRow.Id = 'Part ' + this.reactiveKeyPart; 
        this.clonedPart = clonedRow;
        

        this.spinner = true;
        saveNewPart({newPart : this.clonedPart, quoteId : this.quoteId, boxId : this.boxId, context : this.context}).then(result =>
        {      
            
            let partCloned = result;

            let recordId = partCloned.Part.Id;
            if(result.Status === 200)
            {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Box Created Correctly.',
                        message: 'Success',
                        variant: 'success',
                    }),
                );  
                this.dispatchEvent(
                    new CustomEvent('refreshevent', { 
                        bubbles: true, 
                        composed: true, 
                        detail: {
                            context: 'clone',
                            partCloned: this.clonedPart,
                            recordId: recordId
                        }
                    })
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
    }
    
}