import { LightningElement, track,wire } from 'lwc';
import addContacts from '@salesforce/apex/ContactManagementSystemController.cContacts';
import rContacts from '@salesforce/apex/ContactManagementSystemController.rContacts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AnadirContacto extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phone = '';
    @track contacts = [];
    @track isLoading = false;
    @track selectedContacts = [];
    @track error = false; 
    @wire(rContacts) contacts;
    draftValues = [];


    columns = [
        { label: 'Nombre', fieldName: 'FirstName',editable:true },
        { label: 'Apellido', fieldName: 'LastName',editable:true },
        { label: 'Correo Electrónico', fieldName: 'Email',editable:true },
        { label: 'Número de Teléfono', fieldName: 'Phone',editable:true },
        { type: 'button', typeAttributes: { label: 'Eliminar', name: 'delete', iconName: 'utility:delete', variant: 'destructive' } }
    ];

    connectedCallback() {
        this.loadContacts();
    }
    handleInputChange(event) {
        const field = event.target.dataset.id;
        if (field === 'firstName') {
            this.firstName = event.target.value;
        } else if (field === 'lastName') {
            this.lastName = event.target.value;
        } else if (field === 'email') {
            this.email = event.target.value;
        } else if (field === 'phone') {
            this.phone = event.target.value;
        }
    }

    async addContact() {
        if (this.firstName && this.lastName && this.email) {
            this.isLoading = true;
            try {
                await addContacts({ contacts: [{ FirstName: this.firstName, LastName: this.lastName, Email: this.email, Phone: this.phone }] });
                this.clearForm();
                alert('Contacto creado exitosamente!')            
            } 
            catch (error) {
                this.errorMessage = reduceErrors(this.error);
                console.error('Error al agregar contacto:', error);
                alert(error.body.message);
            }
            this.isLoading = false;
        } else {
            alert('El nombre, apellido y correo son obligatorios.');
        }
    }
    clearForm() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
    }

}
