import { LightningElement, track } from 'lwc';
import addContacts from '@salesforce/apex/ContactManagementSystemController.cContacts';
import updateContacts from '@salesforce/apex/ContactManagementSystemController.uContacts';
import deleteContacts from '@salesforce/apex/ContactManagementSystemController.dContacts';
import getContacts from '@salesforce/apex/ContactManagementSystemController.rContacts';

export default class ContactManagement extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phone = '';
    @track contacts = [];
    @track isLoading = false;
    @track selectedContacts = [];
    @track error = false; 

    columns = [
        { label: 'Nombre', fieldName: 'FirstName' },
        { label: 'Apellido', fieldName: 'LastName' },
        { label: 'Correo Electrónico', fieldName: 'Email' },
        { label: 'Número de Teléfono', fieldName: 'Phone' },
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
                this.loadContacts();
                this.clearForm();
            
            } 
            catch (error) {
                console.error('Error al agregar contacto:', error);
                alert(error.body.message);
            }
            this.isLoading = false;
        } else {
            alert('El nombre, apellido y correo son obligatorios.');
        }
    }

    async loadContacts() {
        this.isLoading = true;
        try {
            const result = await getContacts();
            this.contacts = result;
        } catch (error) {
            console.error('Error al cargar los contactos:', error);
            alert('Error al cargar los contactos: ' + error.body.message);
        }
        this.isLoading = false;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'delete') {
            this.deleteContact(row);
        }
    }

    async deleteContact(contact) {
        this.isLoading = true;
        try {
            await deleteContacts({ contactIds: [contact.Id] });
            this.loadContacts();
        } catch (error) {

            console.error('Error al eliminar el contacto:', error);
            alert('Error al eliminar el contacto: ' + error.body.message);
        }
        this.isLoading = false;
    }

    async updateContacts() {
        const contactsToUpdate = this.selectedContacts.map(contact => ({
            Id: contact.Id,
            FirstName: contact.FirstName,
            LastName: contact.LastName,
            Email: contact.Email,
            Phone: contact.Phone
        }));

        try {
            await updateContacts({ contacts: contactsToUpdate });
            this.loadContacts(); // Recargar después de actualizar
        } catch (error) {
            console.error('Error al actualizar los contactos:', error);
            alert('Error al actualizar los contactos: ' + error.body.message);
        }
    }

    handleSelectionChange(event) {
        this.selectedContacts = event.detail.selectedRows;
    }

    clearForm() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
    }
}
