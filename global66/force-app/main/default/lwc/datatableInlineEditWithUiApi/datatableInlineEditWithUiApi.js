import { LightningElement, wire } from 'lwc';
import rContacts from '@salesforce/apex/ContactManagementSystemController.rContacts';
import { refreshApex } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';  // Importar deleteRecord
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


const actions = [
    { label: 'Show details', name: 'show_details' },
    { label: 'Delete', name: 'delete' }
];
const COLS = [
    { label: 'First Name', fieldName: 'FirstName' ,editable : 'true',sortable: true },
    { label: 'Last Name', fieldName: 'LastName',editable : 'true' },
    { label: 'Phone', fieldName: 'Phone', type: 'phone' ,editable : 'true'},
    { label: 'Email', fieldName: 'Email', type: 'email' ,editable : 'true'},
    { type: 'action', typeAttributes: { rowActions: actions, menuAlignment: 'left' } }
];


export default class DatatableInlineEditWithUiApi extends LightningElement {
    columns = COLS;
    draftValues = [];
    selectedRecords = []; 
    loadMoreStatus;
    @wire(rContacts)
    contacts;
    btnDelete = false;

    async handleSave(event) {
        const records = event.detail.draftValues.slice().map((draftValue) => {
            const fields = Object.assign({}, draftValue);
            return { fields };
        });

        this.draftValues = [];

        try {
            const recordUpdatePromises = records.map((record) =>
                updateRecord(record)
            );
            await Promise.all(recordUpdatePromises);

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Contacts updated',
                    variant: 'success'
                })
            );

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

    getSelectedName(event) {
        const selectedRows = event.detail.selectedRows;
        // Display that fieldName of the selected rows
        for (let i = 0; i < selectedRows.length; i++) {
            alert('You selected: ' + selectedRows[i].Id);
        }
    }

    loadMoreData(event) {
        event.target.isLoading = true;
        this.loadMoreStatus = ' ';
        rContacts(10).then((data) => {
            if (data.length >= this.totalNumberOfRows) {
                event.target.enableInfiniteLoading = false;
                this.loadMoreStatus = 'No more data to load';
            } else {
                const currentData = this.data;
                //Appends new data to the end of the table
                const newData = currentData.concat(data);
                this.data = newData;
                this.loadMoreStatus = '';
            }
            event.target.isLoading = false;
        });
    }

    handleSelect(event) {
        const selectedRows = event.detail.selectedRows;
        for (let i = 0; i < selectedRows.length; i++) {
            alert('You selected: ' + selectedRows[i].Id);
        }

    }
    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        switch (action.name) {
            case 'show_details':
                alert('Showing Details: ' + JSON.stringify(row));
                break;
            case 'delete':
                const rows = this.data;
                const rowIndex = rows.indexOf(row);
                rows.splice(rowIndex, 1);
                this.data = rows;
                break;
        }
    }


   updateColumnSorting(event) {
        try{
            var fieldName = event.detail.fieldName;
            var sortDirection = event.detail.sortDirection;
            this.sortedBy = fieldName;
            this.sortedDirection = sortDirection;
            this.data = this.sortData(fieldName, sortDirection);
        }
        catch (error) {
            console.error('Error en la ordenación:', error);
        }
    } 
    

}
