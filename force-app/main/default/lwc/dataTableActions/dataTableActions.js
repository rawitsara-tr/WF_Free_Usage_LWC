import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getRelatedRecords from "@salesforce/apex/OpportunityRelatedListController.getRelatedRecords";
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import { encodeDefaultFieldValues } from "lightning/pageReferenceUtils";
 
const actions = [
    { label: 'Edit', name: 'edit' },
];
 
const columns = [
    { label: 'Id', fieldName: 'Id' },
    { label: 'AccountId', fieldName: 'AccountId' },
    { label: 'Name', fieldName: 'Name' },
    { label: 'CloseDate', fieldName: 'CloseDate' },
    { label: 'StageName', fieldName: 'StageName'},
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    },
];
 
export default class DataTableActions extends NavigationMixin( LightningElement ) {
    columns = columns;
    title;
    data = [];
    error;
    @api recordId;
    isLoading = false;
 
    subscription = {};
    CHANNEL_NAME = '/event/Refresh_Related_List__e';
 
    connectedCallback() {
        this.isLoading = true;
        this.getRelatedRecords();
        this.title = 'Related Opportunities';
        subscribe(this.CHANNEL_NAME, -1, this.refreshList).then(response => {
            this.subscription = response;
        });
        onError(error => {
            console.error('Server Error--->'+error);
        });
    }
 
    refreshList = ()=> {
        this.isLoading = true;
        this.getRelatedRecords();
    }
    
    getRelatedRecords() {
        getRelatedRecords({accountId: this.recordId})
            .then(result => {
                this.data = result;
                this.error = undefined;
                this.isLoading = false;
                this.title = `Related Opportunities (${this.data.length})`;
            })
            .catch(error => {
                this.error = error;
                this.data = undefined;
                this.isLoading = false;
            });
    }
 
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        let recordId = row.Id;
        console.log('recordId >> ', recordId);
        switch (actionName) {
            case 'edit':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: recordId,
                        objectApiName: 'Opportunity',
                        actionName: 'edit'
                    }
                });
                break;
            default:
        }
    }
 
    createOpportunity() {
        const defaultFieldValues = encodeDefaultFieldValues({AccountId: this.recordId});
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Opportunity',
                actionName: 'new'
            },
            state:{
                navigationLocation: 'RELATED_LIST',
                defaultFieldValues: defaultFieldValues
            }
        }); 
    }
 
    disconnectedCallback() {
        unsubscribe(this.subscription, () => {
            console.log('Unsubscribed Channel');
        });
    }
}