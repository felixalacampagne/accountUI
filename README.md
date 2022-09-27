# Accountui

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.3.

It was originally started with Angular 5 but it proved impossible to figure out what changes were needed to get
that version to run the 'ng build' when Angular was updated to 14. The the only solution was to create a new project from scratch
and copy the actual code from the Angular 5 version into the new project. The builder at least ran on the new project, all that
was left to do was fix all the bugs which suddenly appeared and the previously successful compiling code.

The end result of a few days of work was finally a compiling version of the same code. Hopefully this pain wont be needed again 
for a couple of years.

There is at least one new piece of functionality: a formatted EPC,. mobile payment, text can now be parsed into a transaction. 
Such texts are usually seen as QR codes so a QR code can be used to make a payment via the banking app and the same QR code can
be used to make the entry into Account. It's a bit clumsy as there is no way to access the clipboard and unfortunately the iPhone
'Scan Text' option which appears sometimes is not capable of decoding a QR.

It would be really nice to directly invoke a QR reader from the web application. It might be possible to do this using
this: http://github.com/mebjas/html5-qrcode. Certainly worth a look sometime.

One bug was fixed during to port to ANgular 14: the reason for the failure to clear the transaction fields and update 
the transaction list post submission was discovered - failure to parse the non-json response as json!! Took a while to figure
out how to stop the json parsing but it now seems to work as expected - finally!

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
