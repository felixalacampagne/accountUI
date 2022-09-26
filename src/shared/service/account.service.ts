import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {map} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import { AccountItem } from '../model/accountitem.model';
import { TransactionItem } from '../model/transaction.model';

@Injectable()
export class AccountService 
{
    private serverhost : string; // = "http://minnie"; //""; //"http://minnie"; //"http://localhost:8080";
    private listaccsvc : string = "/accountAPI/listaccount.php";
    private listtxnsvc : string = "/accountAPI/listtransaction.php?accid=";
    private addtxnsvc : string = "/accountAPI/addtransaction.php";
    constructor(private http : HttpClient)
    {
        this.serverhost = environment.accountapi_host;
        console.log("Account API server host: " + this.serverhost);
    }    

    getAccounts() : Observable<AccountItem[]>
    {
        let url : string;
        url = this.serverhost + this.listaccsvc;
        // The account items are returned wrapped in an array named accounts
        console.log("getAccount API URL: " + url);
        return this.http.get(url).pipe( map((res:any) => res.accounts) );    
    }

    getTransactions(a : AccountItem) : Observable<TransactionItem[]>
    {
        let url : string;
        url = this.serverhost + this.listtxnsvc + a.id;
        // The items are returned wrapped in an array named transactions
        return this.http.get(url).pipe( map((res:any) => res.transactions));

    }

    addTransaction(txn : TransactionItem) : Observable<Response>
    {
        let json : string;
        let url : string;
        let res;
        json = JSON.stringify(txn);
        url = this.serverhost + this.addtxnsvc;
        console.log("addTransaction: POSTing to " + url + ": " + json);
        return this.http.post<Response>(url, json);
    }
}