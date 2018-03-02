import { Component, OnInit } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {ViewChild, ElementRef} from '@angular/core';
import {environment} from '../environments/environment';

import {AccountService} from '../shared/service/account.service';
import {AccountItem} from '../shared/model/accountitem.model';
import {TransactionItem} from '../shared/model/transaction.model';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
@ViewChild('closeBtn') closeBtn: ElementRef;

  title = 'app';
  private accounts : AccountItem[];
  private transactions : TransactionItem[];
  private activeaccount : AccountItem;
  public submitted : boolean;
  public defaultdate : string;
  envName : string;
  txDate : string;
  constructor(private accountService : AccountService, private datePipe: DatePipe) {
    let d : Date = new Date();
    this.txDate = this.datePipe.transform(d, 'dd/MM/yyyy');
    this.envName = environment.envName;
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
              }
            },
       err=>{
            console.log("AppComponent.ngOnInit: An error occured during getTransactions subscribe" + err);
            } ,
        ()=>{console.log("AppComponent.ngOnInit: getTransactions loading completed");}
    );

    console.log("AppComponent.getTransactions:Finished");
    this.activeaccount = acc;
}

addTransactionToDB(txn : TransactionItem)
{
console.log("AppComponent.addTransactionToDB: Starting");
    this.accountService.addTransaction(txn).subscribe(
       res=>{
            console.log("AppComponent.addTransactionToDB: Response: " + res)
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
  //txDate: "qwerrty", txType: "qwer345", txComment: "qwer35435", txAmount: "123"
  console.log("Date: " + form.value.txDate);
  console.log("Type: " + form.value.txType);
  console.log("Comment: " + form.value.txComment);
  console.log("Amount: " + form.value.txAmount);
  
  let newent : TransactionItem = new TransactionItem();
  newent.accid = this.activeaccount.id;
  newent.amount = form.value.txAmount;
  newent.comment = form.value.txComment;
  newent.date = form.value.txDate;
  newent.type = form.value.txType;

  this.addTransactionToDB(newent); 

  // I've search for forking hours to figure out how to get the modal form dialog to
  // go away after the submit event has been processed and there is nothing of 
  // any use. You'd think it would be something that just happened but no
  // there is really nothing forseen for processing a form in a modal and then
  // dismissing the modal.
  // This shirt with the "ViewChild" stuff is the closest I've come to finding
  // anything which is even close to working - why the fork is this stuff so
  // hard to do the most simple things with, I thought it was supposed to make
  // it easier not a billion times harder!!!

  this.closeBtn.nativeElement.click();
  
}

}
