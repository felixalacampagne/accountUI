import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { NgbDatepickerConfig, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';


import {environment} from '../environments/environment';

import { mmddyyyNgbDateParserFormatter } from "../shared/datepickformatter"
import {AccountService} from '../shared/service/account.service';
import {AccountItem} from '../shared/model/accountitem.model';
import {TransactionItem} from '../shared/model/transaction.model';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [{provide: NgbDateParserFormatter, useClass: mmddyyyNgbDateParserFormatter}]
})
export class AppComponent implements OnInit {

modalReference: NgbModalRef;

  title = 'app';
  accounts : AccountItem[];
  transactions : TransactionItem[];
  private activeaccount : AccountItem = null;
  public submitted : boolean;
  public defaultdate : string;
  envName : string;
  txDate : NgbDateStruct;
  txType : string;
  closeResult: string;
  constructor(private accountService : AccountService, 
    private cd: ChangeDetectorRef,
    private datePipe: DatePipe,
    private modalService: NgbModal) {
    let d : Date = new Date();
    this.envName = environment.envName;

    // Default values for the add transaction form
    this.txDate = {year: d.getFullYear(), month: d.getMonth()+1, day: d.getDate()};
    // This is only necessary because the ngModel attribute breaks the selected behaviour of the option tag
    this.txType = "BC";

  }

  
  open(content) {
    //this.modalReference = this.modalService.open(content, {size:'sm'});
    this.modalReference = this.modalService.open(content);
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }




  ngOnInit() {
    console.log("AppComponent.ngOnInit: Starting");
    this.accountService.getAccounts().subscribe(
       res=>{
              this.accounts = res;
              //debugger;
              if(!this.accounts)
              {
                console.log("AppComponent.ngOnInit: variable is not initialized");
              }
              else
              {
                console.log("AppComponent.ngOnInit: Accounts contains " + this.accounts.length + " items.");
              }
            },
       err=>{
            console.log("AppComponent.ngOnInit: An error occured during getAccounts subscribe" + err);
            } ,
        ()=>{console.log("AppComponent.ngOnInit: getAccounts loading completed");}
    );

    console.log("AppComponent.ngOnInit:Finished");
}

getTransactions(acc : AccountItem)
{
console.log("AppComponent.getTransactions: Starting");
    this.accountService.getTransactions(acc).subscribe(
       res=>{
              this.transactions = res;
              //debugger;
              if(!this.transactions)
              {
                console.log("AppComponent.getTransactions: variable is not initialized");
              }
              else
              {
                console.log("AppComponent.getTransactions: transactions contains " + this.transactions.length + " items.");
                let t : TransactionItem=this.transactions[this.transactions.length-1]
                console.log("AppComponent.getTransactions: last transaction " + t.comment + ", " +t.amount);
                // Fingers crossed this causes an update of the displayed transaction list, which
                // does not happen automatically when a new transaction is added
                this.cd.markForCheck();
              }
            },
       err=>{
            console.log("AppComponent.getTransactions: An error occured during getTransactions subscribe" + err);
            } ,
        ()=>{console.log("AppComponent.getTransactions: getTransactions loading completed");}
    );

    console.log("AppComponent.getTransactions:Finished");
    this.activeaccount = acc;
}

addTransactionToDB(txn : TransactionItem)
{
console.log("AppComponent.addTransactionToDB: Starting");
    this.accountService.addTransaction(txn).subscribe(
       res=>{
            console.log("AppComponent.addTransactionToDB: Response: " + res);
            // Must wait for add to complete before loading new transaction list
            this.getTransactions(this.activeaccount);
            },
       err=>{
            console.log("AppComponent.addTransactionToDB: An error occured during getTransactions subscribe" + err);
            } ,
        ()=>{console.log("AppComponent.addTransactionToDB: getTransactions loading completed");}
    );

    console.log("AppComponent.addTransactionToDB:Finished");
}


addtransaction(form : NgForm)
{
  if(this.activeaccount == null)
  {
    console.log("Account is not set, unable to add transaction.");
    return;
  }
  //txDate: "qwerrty", txType: "qwer345", txComment: "qwer35435", txAmount: "123"
  console.log("Date: " + form.value.txDate);
  console.log("Type: " + form.value.txType);
  console.log("Comment: " + form.value.txComment);
  console.log("Amount: " + form.value.txAmount);
  
  let newent : TransactionItem = new TransactionItem();
  let d = new Date(form.value.txDate.year, form.value.txDate.month-1, form.value.txDate.day);
  newent.accid = this.activeaccount.id;
  newent.amount = form.value.txAmount;
  newent.comment = form.value.txComment;
  newent.date = this.datePipe.transform(d, 'dd/MM/yyyy');
  newent.type = form.value.txType;

  this.addTransactionToDB(newent); 

  // So ng-bootstrap doesn't close the modal when the submit button is used to perform
  // form processing!!!!!
  // Figured out that the close could be put in the click event of the button in addition to
  // the addtransaction call so I dont have to bother with it here.
  // NB. it only works if the close is put BEFORE the addtransaction!!!!!!
  //this.modalReference.close('Closed from addTransaction');
  
}

}
