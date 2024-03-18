import {LightningElement, track} from 'lwc';
import {loadScript} from "lightning/platformResourceLoader";
import JSPDF from '@salesforce/resourceUrl/jsPDF';

export default class CreateQuote extends LightningElement {
    //Boolean tracked variable to indicate if modal is open or not default value is false as modal is closed when page is loaded 
    @track isModalOpen = false;
    
    openModal() {
        // to open modal set isModalOpen track value as true
        this.isModalOpen = true;
        //this.generateData();
    }
    closeModal() {
        // to close modal set isModalOpen track value as false
        this.isModalOpen = false;
    }
    submitDetails() {
        // to close modal set isModalOpen track value as false
        //Add your code to call apex method or do some processing
        this.isModalOpen = false;
    }

    renderedCallback() {
        Promise.all([
            loadScript(this, JSPDF)
        ]);
    }

    generatePdf(){
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            encryption: {
                userPermissions: ["print", "modify", "copy", "annot-forms"]
            }
        });

        pdf.text("Hello World", 20, 20);
        console.log(pdf.output('datauristring'));

        this.template.querySelector('iframe').contentWindow.postMessage(pdf.output('datauristring').split(',')[1], window.location.origin);
    }
}