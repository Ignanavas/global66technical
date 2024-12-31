import { LightningElement, wire,api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';
import rContacts from '@salesforce/apex/ContactManagementSystemController.rContacts';
import deleteContacts from '@salesforce/apex/ContactManagementSystemController.deleteContacts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FIRSTNAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LASTNAME_FIELD from '@salesforce/schema/Contact.LastName';
import PHONE_FIELD from '@salesforce/schema/Contact.Phone';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';

    const COLS = [
    {
        label: 'First Name',
        fieldName: FIRSTNAME_FIELD.fieldApiName,
        editable: true
    },
    {
        label: 'Last Name',
        fieldName: LASTNAME_FIELD.fieldApiName,
        editable: true
    },
    {
        label: 'Phone',
        fieldName: PHONE_FIELD.fieldApiName,
        type: 'phone',
        editable: true
    },
    {
        label: 'Email',
        fieldName: EMAIL_FIELD.fieldApiName,
        type: 'email',
        editable: true
    }
    ];

export default class AdministrarContactos extends LightningElement {
    




    columns = COLS;
    draftValues = [];
    
    @api totalNumberOfRows;
    loadMoreStatus;
    data = [];

    @wire(rContacts) contacts;

    async handleSave(event) {
        // Convert datatable draft values into record objects
        const records = event.detail.draftValues.slice().map((draftValue) => {
            const fields = Object.assign({}, draftValue);
            return { fields };
        });

        // Clear all datatable draft values
        this.draftValues = [];

        try {
            // Update all records in parallel thanks to the UI API
            const recordUpdatePromises = records.map((record) =>
                updateRecord(record)
            );
            await Promise.all(recordUpdatePromises);

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

    loadMoreData(event) {
       /* IMPORTANTE ARREGLAR
       // Verificar que el evento y el target no son null
        if (event && event.target) {
            // Mostrar un spinner para indicar que los datos están siendo cargados
            event.target.isLoading = true;
            // Mostrar "Cargando..." mientras se cargan los datos
            this.loadMoreStatus = 'Cargando...';
    
            // Llamar a la función fetchData para obtener más datos (50 registros en este caso)
            fetchData(50).then((data) => {
                if (data.length >= this.totalNumberOfRows) {
                    event.target.enableInfiniteLoading = false;  // Desactivar la carga infinita si no hay más datos
                    this.loadMoreStatus = 'No hay más datos para cargar';  // Mostrar mensaje de fin de carga
                } else {
                    const currentData = this.data;  // Los datos actuales cargados
                    // Agregar los nuevos datos a la tabla
                    const newData = currentData.concat(data);
                    this.data = newData;
                    this.loadMoreStatus = '';  // Limpiar el estado de carga
                }
                event.target.isLoading = false;  // Ocultar el spinner de carga
            }).catch((error) => {
                // Manejo de errores
                console.error('Error al cargar los datos:', error);
                this.loadMoreStatus = 'Error al cargar los datos';
                if (event.target) {
                    event.target.isLoading = false;  // Asegurarse de ocultar el spinner incluso si ocurre un error
                }
            });
        } else {
            console.error("No se encontró el evento o el target del evento.");
        } */
    }

    handleDeleteRecords() {
        const selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
        deleteContacts({accList: selectedRows})
       
                .then((result) => {
                    // Mostrar un mensaje de éxito
                    const event = new ShowToastEvent({
                        title: 'Success',
                        message: 'Records deleted successfully.',
                        variant: 'success'
                    });
                    this.dispatchEvent(event);
                    refreshApex(this.contacts);
                })
                .catch((error) => {
                    const event = new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error'
                    });
                    this.dispatchEvent(event);
                });
    }

    // Método para refrescar los datos de la tabla
    refreshData() {
        // Lógica para refrescar los datos, por ejemplo, hacer una llamada a Apex para obtener los registros actualizados
        console.log('Data refreshed');
    }
}

