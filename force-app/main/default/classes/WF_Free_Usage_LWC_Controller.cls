public with sharing class WF_Free_Usage_LWC_Controller {
    public WF_Free_Usage_LWC_Controller() {

    }

    @AuraEnabled
    public static String getFU(Integer pageSize, Integer pageNumber, Id accountId){
        String jsonDT = '';
         
        //Offset for SOQL
        Integer offset = (pageNumber - 1) * pageSize;
         
        //Total Records
        Integer totalRecords = [SELECT COUNT() FROM WF_Free_Usage__c];
        Integer totalRecordsById = [SELECT COUNT() FROM WF_Free_Usage__c WHERE Account__c =:accountId];
        Integer recordEnd = pageSize * pageNumber;
         
        AccountDTWrapper objDT =  new AccountDTWrapper();  
        objDT.pageSize = pageSize;
        objDT.pageNumber = pageNumber;
        objDT.recordStart = offset + 1;
        objDT.recordEnd = totalRecordsById >= recordEnd ? recordEnd : totalRecordsById;
        objDT.totalRecords = totalRecords;
        objDT.totalRecordsById = totalRecordsById;
        objDT.accountId = accountId;
        objDT.freeUsage = [SELECT Id, Name, Account__c, Contract_No__c, Hour__c, Request_free_usage_day__c
                          FROM WF_Free_Usage__c 
                          WHERE Account__c =:accountId
                          LIMIT :pageSize OFFSET :offset];

        jsonDT = JSON.serialize(objDT);
        return jsonDT;
    }
     
    public class AccountDTWrapper {
        public Integer pageSize {get;set;}
        public Integer pageNumber {get;set;}
        public Integer totalRecords {get;set;}
        public Integer totalRecordsById {get;set;}
        public Integer recordStart {get;set;}
        public Integer recordEnd {get;set;}
        public List<WF_Free_Usage__c> freeUsage {get;set;}
        public String accountId {get;set;}
    }
}

