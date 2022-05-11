import { LightningElement, wire, api, track  } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import { encodeDefaultFieldValues } from "lightning/pageReferenceUtils";
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFU from '@salesforce/apex/WF_Free_Usage_LWC_Controller.getFU';
 
export default class Lwc_WF_Free_Usage extends NavigationMixin(LightningElement) { 
    @api recordId;
    @api accountId;
    @track loader = false;
    @track error = null;
    @track pageSize = 10;
    @track pageNumber = 1;
    @track totalRecords = 0;
    @track totalPages = 0;
    @track recordEnd = 0;
    @track recordStart = 0;
    @track isPrev = true;
    @track isNext = true;
    @track freeUsage = [];
 
    subscription = {};
    CHANNEL_NAME = '/event/WF_Free_Usage_Event__e';
 
    connectedCallback() {
        this.loader = true;
        this.getFU();
        this.title = 'Free Usage List';
        subscribe(this.CHANNEL_NAME, -1, this.refreshList).then(response => {
            this.subscription = response;
        });
        onError(error => {
            console.error('Server Error--->'+error);
        });
    }
    refreshList = ()=> {
        this.loader = true;
        this.getFU();
    }
 
    handleNext(){
        this.pageNumber = this.pageNumber+1;
        this.getFU();
    }
 
    handlePrev(){
        this.pageNumber = this.pageNumber-1;
        this.getFU();
    }
 
    getFU(){
        this.loader = true;
        console.log('Hello43');
        getFU({pageSize: this.pageSize, pageNumber : this.pageNumber, accountId: this.recordId})
        .then(result => {
            this.loader = false;
            if(result){
                var resultData = JSON.parse(result);
                console.log('59 result >> ', result);
                console.log('60 resultData >> ', resultData);
                this.freeUsage = resultData.freeUsage;
                console.log('60 this.freeUsage >> ', this.freeUsage);
                this.accountId = resultData.accountId;
                this.pageNumber = resultData.pageNumber;
                this.totalRecords = resultData.totalRecords;
                this.totalRecordsById = resultData.totalRecordsById;
                this.recordStart = resultData.recordStart;
                this.recordEnd = resultData.recordEnd;
                this.totalPages = Math.ceil(resultData.totalRecordsById / this.pageSize);
                this.isNext = (this.pageNumber == this.totalPages || this.totalPages == 0);
                this.isPrev = (this.pageNumber == 1 || this.totalRecordsById < this.pageSize);
                this.title = 'Free Usage List ( ' + this.totalRecordsById + ' )';
            }
        })
        .catch(error => {
            this.loader = false;
            this.error = error;
        });
    }

    handleCreateFreeUsage() {
        const defaultFieldValues = encodeDefaultFieldValues({Account__c: this.recordId});
        this[NavigationMixin.Navigate] ({
            type: 'standard__objectPage',
            attributes: {
                actionName: "new",
                objectApiName: "WF_Free_Usage__c" 
            },
            state:{
                navigationLocation: 'RELATED_LIST',
                defaultFieldValues: defaultFieldValues
            }
        })
    }

    handleEdit(event) {
        this.recordId = this.accountId;
        this.editId = event.target.dataset.recordId;
        console.log('99 recordId >> ', this.recordId);
        console.log('99 editId >> ', this.editId);
        this[NavigationMixin.Navigate] ({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.editId,
                actionName: "edit",
                objectApiName: "WF_Free_Usage__c" 
            }
        })
    }

    @track isConfirmOpen = false;
    @track deleteFreeUsageId;
    @track deleteFreeUsageName;

    handleOpenConfirm(event) {
        this.isConfirmOpen = true;
        console.log('114 event >> ', event);
        console.log('114 event.target >> ', event.target);
        console.log('114 event.target.dataset >> ', event.target.dataset);
        this.deleteFreeUsageId = event.target.dataset.recordId;
        // console.log('115 deleteFreeUsageId >> ', this.deleteFreeUsageId);
    }
    handleCloseConfirm() {
        this.isConfirmOpen = false;
    }
    handleDeleteFreeUsage() {
        this.isConfirmOpen = false;
        console.log('122 deleteFreeUsageId >> ', this.deleteFreeUsageId);
        deleteRecord(this.deleteFreeUsageId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Free Usage Deleted',
                        variant: 'success'
                    })
                );
                this.getFU();
            })
            .catch((error) => {
                console.log('error', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error Deleted',
                        variant: 'error'
                    })
                );
            })
    }
 
    get isDisplaySpan() {
        var isDisplaySpan = false;
        if(this.freeUsage){
            if(this.freeUsage.length == 0){
                isDisplaySpan = false;
            }else{
                isDisplaySpan = true;
            }
        }
        return isDisplaySpan;
    }

    get isDisplayNoRecords() {
        var isDisplay = true;
        if(this.freeUsage){
            if(this.freeUsage.length == 0){
                isDisplay = true;
            }else{
                isDisplay = false;
            }
        }
        return isDisplay;
    }
    disconnectedCallback() {
        unsubscribe(this.subscription, () => {
            console.log('Unsubscribed Channel');
        });
    }
}