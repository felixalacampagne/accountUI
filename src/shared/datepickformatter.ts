import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { isNumber, toInteger, padNumber } from '@ng-bootstrap/ng-bootstrap/util/util';

@Injectable()
export class mmddyyyNgbDateParserFormatter extends NgbDateParserFormatter {

constructor(private datePipe: DatePipe) 
{
   super();



    // Default values for the add transaction form
    //this.txDate = this.datePipe.transform(d, 'dd/MM/yyyy');
}

   parse(value: string): NgbDateStruct 
   {
      let n : NgbDateStruct = null;
      console.log("mmddyyyNgbDateParserFormatter.parse: value=" + value);
      if (value) 
      {
         let d : Date = new Date(value);
         n = {day: d.getDate(), month: d.getMonth(), year: d.getFullYear()};
      }
      console.log("mmddyyyNgbDateParserFormatter.parse: ret=" + n);
      return n;
  }

   format(date: NgbDateStruct): string 
   {
      let d : Date;
      console.log("mmddyyyNgbDateParserFormatter.format: date=" + date);
      if(date == null)
      {
         d = new Date();
      }
      else
      {
         d = new Date(date.year, (date.month)-1, date.day);
      }
      let ret : string;
      ret = this.datePipe.transform(d, 'dd/MM/yyyy');
      console.log("mmddyyyNgbDateParserFormatter.format: ret=" + ret);
      return ret;
   }
}