import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { NgbDatepickerConfig, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';


import {environment} from '../environments/environment';

import { mmddyyyNgbDateParserFormatter } from '../shared/datepickformatter';
import {AccountService} from '../shared/service/account.service';
import {AccountItem} from '../shared/model/accountitem.model';
import {TransactionItem} from '../shared/model/transaction.model';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Html5QrcodeResult } from 'html5-qrcode/esm/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [{provide: NgbDateParserFormatter, useClass: mmddyyyNgbDateParserFormatter}]
})
export class AppComponent implements OnInit {

  modalReference: NgbModalRef | undefined;

  title = 'app';
  accounts: AccountItem[] = [];
  transactions: TransactionItem[] = [];
  activeaccount: AccountItem = new AccountItem();
  public submitted: boolean = false;
  public defaultdate: string = '';
  envName: string = '';
  txDate: NgbDateStruct;
  txType: string;
  txComment: string = '';
  txAmount: string = '';
  txPastearea: string = '';
  closeResult: string = '';
  html5QrcodeScanner: Html5QrcodeScanner | undefined; // Only defined while a scan is being performed
  constructor(private accountService: AccountService,
    private cd: ChangeDetectorRef,
    private datePipe: DatePipe,
    private modalService: NgbModal) {
    const d: Date = new Date();
    this.envName = environment.envName;

    // Default values for the add transaction form
    this.txDate = {year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate()};
    // This is only necessary because the ngModel attribute breaks the selected behaviour of the option tag
    this.txType = 'BC';

  }


  open(content: any) {
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
    console.log('AppComponent.ngOnInit: Starting');
    this.accountService.getAccounts().subscribe(
       res => {
              this.accounts = res;
              // debugger;
              if(!this.accounts)
              {
                console.log('AppComponent.ngOnInit: variable is not initialized');
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
            // Reset amount to prevent double entry
            this.txAmount = '';
            this.txPastearea = '';
            },
       err=>{
            console.log("AppComponent.addTransactionToDB: An error occured during getTransactions subscribe:" + JSON.stringify(err));
            } ,
        ()=>{console.log("AppComponent.addTransactionToDB: getTransactions loading completed");}
    );

    console.log("AppComponent.addTransactionToDB:Finished");
}


addtransaction()
{
  if(this.activeaccount == null)
  {
    console.log("Account is not set, unable to add transaction.");
    return;
  }

  let newent : TransactionItem = new TransactionItem();
  let d = new Date(this.txDate.year, this.txDate.month-1, this.txDate.day);
  newent.accid = this.activeaccount.id;
  newent.amount = this.txAmount;
  newent.comment = this.txComment;
  
  // With new Typescript cannot just assign return value to a string!
  // Using ternary operator is too clumsy for dealing with the return from a function
  // Apparently the '??' means use the result unless it's undefined or null and then use the value after the ??
  newent.date = this.datePipe.transform(d, 'dd/MM/yyyy') ?? '';
  newent.type = this.txType;

  console.log("Date: " + newent.date);
  console.log("Type: " + newent.type);
  console.log("Comment: " + newent.comment);
  console.log("Amount: " + newent.amount);  
  this.addTransactionToDB(newent); 
}

parseEPC(epc : string) : TransactionItem
{
  console.log('parseEPC: entry');
  const trans : TransactionItem = new TransactionItem();

  // Docs say replaceAll should exist but it fails to compile. VSCode says replace should replace
  // all but it doesn't. I guess something needs to be updated but not sure what!! Maybe
  // the wierd failure of the SCT check is also something to do with versions....
  epc = epc.replaceAll('\r', ''); //replace(/\r/g, '');
  const lines: string[] = epc.split("\n");

  // Inexplicably (lines[3] === 'SCT') is giving 'false' when lines[3] is 'SCT'
  if((lines[0] === 'BCD') && (lines[3] === 'SCT'))
  {
    // Name Comment (Account)
    trans.comment = lines[5] + " " + lines[9] + lines[10] + " " + lines[6];
    trans.amount = lines[7].substr(3);
    trans.type = 'QRMP';
    console.log('parseEPC: successfully parsed to transaction');
  }
  else
  {
    console.log('Lines 0: [' + lines[0] + "] = " + (lines[0] === 'BCD'));
    console.log('Lines 3: [' + lines[3] + "] = " + (lines[3] === 'SCT'));
    console.log('parseEPC: invalid epc string: ' + epc);
  }
  console.log('parseEPC: exit');
  return trans;
}

// So once again ease and convenience of use is well and truely shafted by 'security' which makes
// reading the clipboard from the browser effectively impossible, especially for the primary target
// browser, ie. iphone safari. In the absence of any other solution for now I will have to manually
// paste from the clipboard into a textarea and then read the pasted data. 
onPaste(event: ClipboardEvent) {
  console.log("onPaste: entry");
  const clipboardData = event.clipboardData; // || window.clipboardData;
  if(clipboardData !== null)
  {
    const epc = clipboardData.getData('text');
    const txn : TransactionItem = this.parseEPC(epc);
    this.txAmount = txn.amount;
    this.txComment = txn.comment;
    this.txType = txn.type;
  }
  console.log("onPaste: exit");
}


onScanSuccess(decodedText: string, decodedResult: Html5QrcodeResult) {
  // handle the scanned code as you like, for example:
  console.log('onScanSuccess: entry');
  if(this.html5QrcodeScanner != undefined) {
    console.log('onScanSuccess: stopping scanner');
    this.html5QrcodeScanner.clear();
    this.html5QrcodeScanner = undefined;
  }  
  console.log('onScanSuccess: Parsing result ' + decodedText);
  const txn : TransactionItem = this.parseEPC(decodedText);
  console.log('onScanSuccess: setting transaction details');
  this.txAmount = txn.amount;
  this.txComment = txn.comment;
  this.txType = txn.type;
  console.log('onScanSuccess: exit');
}

onScanFailure(error: any) {
  // handle scan failure, usually better to ignore and keep scanning.
  // for example:
  //console.warn(`Code scan error = ${error}`);
}

doScan() {

  // Second parameter should be { fps: 10, qrbox: {width: 250, height: 250} }, but it doesn't compile
  // and there doesn't appear to be anyway to create an object of the type required
  // let conf: Html5QrcodeScannerConfig = { fps: 10, qrbox: {width: 250, height: 250} supportedScanTypes:[] };
  this.html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: {width: 250, height: 250}, supportedScanTypes: [], rememberLastUsedCamera: true },
    /* verbose= */ false);

  // Could not get it to work. It appeared to execute the fist console.log of onScanSuccess and then vanish
  // literally without trace. Luckily I remembered something about 'this' getting lost especially in callbacks.
  // Eventually tracked the 'bind' thing down and whoopee it works now! It's a bit tricky to use with a PC camera
  // and an image on the iPhone or a QR code displayed on the PC. But it's really intended to use on the iPhone
  // where it probably wont actually work!
  let callback = (this.onScanSuccess).bind(this);
  this.html5QrcodeScanner.render(callback,  this.onScanFailure);
}

isTransactions() : boolean {
  return this.transactions.length > 0;
}

}

