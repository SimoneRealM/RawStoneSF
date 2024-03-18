import retrieveGameComponent from "@salesforce/apex/QuoteBuilderHelper.retrieveGameComponent";
import { LightningElement, api, track } from 'lwc';

const columns = [
	{ label: 'Name', fieldName: 'label' }];

export default class FindGameComponent extends LightningElement 
{
	jsonToInsert = {};
	@track gameList = [];
	@track gameListFiltered = [];
	@api game;
	@api options;
	@api objectInfo;
	@api mappingLabel;
	columns = columns;
	value;
	showOptions = false;
	spinner = false;
	connectedCallback()
	{
		if(this.game !== '' && this.game !== undefined) 
		{ 
			this.showOptions = true; }
		this.getGames();
	}

	//gameList = [];
	getGames()
	{
		this.spinner = true;
		retrieveGameComponent({}).then(result =>
		{      
			for (let key in result.GameList) 
			{
				this.gameList.push({
					label: result.GameList[key].Name, 
					value: result.GameList[key].Id
				});
				
			}
		
			this.gameListFiltered = [...this.gameList];

			this.spinner = false;
		}).catch(() => 
		{      
			this.spinner = false;
		});          
	}
	
	@track selectedValue = '';
	showDataList = false;
	@track matchingFields
	showModalNewProduct = false;
	newProduct = {};
	@track inputText = '';
	@track newGame = '';
	@track label = '';
	@track value = '';

	handleChange(event) 
	{
		this.showDataList = true;
		this.newGame = event.target.value;
		console.log('newGame:', this.newGame);
		console.log('List All Games:', this.gameList);
		// Verifica se il testo inserito è presente nell'array GameList
		let existingProduct = Boolean(this.gameList.find(item => item.label.toLowerCase() === this.newGame.toLowerCase()));
		console.log('Product is new?', !existingProduct);
		
		if (this.newGame === '') { this.gameListFiltered = [...this.gameList]; } 
		else { this.gameListFiltered = this.gameList.filter(game => game.label.toLowerCase().includes(this.newGame)); }
		console.log('this.gameListFiltered:', this.gameListFiltered);
		
		this.showDataList = this.gameListFiltered.length === 0 ? false : true;
		
		// Se non è presente, crea un nuovo oggetto Product2
		//if (!existingProduct && this.newGame.length > 0) 
		if (!existingProduct) 
		{
			this.newProduct = { Name: this.newGame };
			
			this.showModalNewProduct = true;
			this.selectedValue = '';
			this.insertNewGameEvent(); 
		}
		else //Devo mandare la modifica al padre
		{
			let value = this.getIdGameExistent(this.newGame);
			console.log('FindGameComp - id product:', value);

			const partEvent = new CustomEvent('gameselected', { 
				detail: { 
					value: value,
					gameSelected: this.newGame,
					name: this.newGame,
					showModalNewProduct: false
				} 
			});
			this.dispatchEvent(partEvent);
		}
	}

	getIdGameExistent(game) 
	{
		const gameFounded = this.gameList.find(item => {
			return item.label.toLowerCase() === game.toLowerCase();
		});
		
		return gameFounded ? gameFounded.value : null;
	}
	
	@api valueSelected;
	@track listValue = [];
	insertNewGameEvent()
	{    
		console.log('insertNewGameEvent - selectedValue:', this.selectedValue);
		//Invia il prodotto al component padre
		const partNewGame = new CustomEvent('insertnewgame', { 
			detail: { 
				showModalNewProduct: this.showModalNewProduct,
				newGame: this.newProduct,
				gameName: this.selectedValue
			} 
		});
		this.dispatchEvent(partNewGame);
	}

	handleFocusOut()
	{
		this.showDataList = false;
	}

	handleSelection(event) 
	{	
		const value = event.currentTarget.dataset.recid;
		console.log('value:', value);
		const title = event.currentTarget.dataset.label;
		console.log('title:', title);
		
		this.selectedValue = title;

		this.showDataList = false;
		this.showOptions = false;
		this.showModalNewProduct = false;

		const partEvent = new CustomEvent('gameselected', { 
			detail: { 
				value: value,
				gameSelected: this.selectedValue,
				name: title,
				showModalNewProduct: this.showModalNewProduct

			} 
		});
		this.dispatchEvent(partEvent);
	}
}