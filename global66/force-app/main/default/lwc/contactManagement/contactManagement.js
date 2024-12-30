import { LightningElement, track,wire } from 'lwc';
import addContacts from '@salesforce/apex/ContactManagementSystemController.cContacts';
import updateContacts from '@salesforce/apex/ContactManagementSystemController.uContacts';
import deleteContacts from '@salesforce/apex/ContactManagementSystemController.dContacts';
import rContacts from '@salesforce/apex/ContactManagementSystemController.rContacts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ContactManagement extends LightningElement {
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

    getSelectedEmail(event) {
        // Display the Contact of the selected rows
        event.detail.selectedRows.forEach((selectedRow) => {
            alert('Selected email addresses: ' + selectedRow.Email);
        });
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
                this.errorMessage = reduceErrors(this.error);
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

    async handleSave(event) {
        const updatedFields = event.detail.draftValues;

        // Clear all datatable draft values
        this.draftValues = [];

        try {
            // Pass edited fields to the updateContacts Apex controller
            await updateContacts({ contactsForUpdate: updatedFields });

            // Report success with a toast
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Contacts updated',
                    variant: 'success'
                })
            );

            // Display fresh data in the datatable
            await refreshApex(this.contacts);
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while updating or refreshing records',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        }
    }

}
