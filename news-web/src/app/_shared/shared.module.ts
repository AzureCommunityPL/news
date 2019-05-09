import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { BsDatepickerModule as NgxDatePickerModule } from 'ngx-bootstrap/datepicker';
import { AccordionModule as NgxAccordion } from 'ngx-bootstrap/accordion';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule as NgxToastrModule } from 'ngx-toastr';
import { TooltipModule as NgxTooltip } from 'ngx-bootstrap/tooltip';
import { ModalModule as NgxModalModule } from 'ngx-bootstrap/modal';

const NgModules = [
  HttpClientModule,
  FormsModule,
  CommonModule
];

const NgExports = [
  FormsModule,
  CommonModule,
  BrowserAnimationsModule
];

const NgxModules = [
  NgxDatePickerModule.forRoot(),
  NgxSpinnerModule,
  NgxToastrModule.forRoot(),
  NgxAccordion.forRoot(),
  NgxTooltip.forRoot(),
  NgxModalModule.forRoot()
];

const NgxExports = [
  NgxDatePickerModule,
  NgxSpinnerModule,
  NgxToastrModule,
  NgxAccordion,
  NgxTooltip,
  NgxModalModule
];

// clients
import { CoreHttpClient } from './http';
import { ODataClient } from './odata';

const Clients = [
  CoreHttpClient,
  ODataClient
];

// services
import { ApiService } from './api';
import { DateService } from './utils';
import { FacebookService, FacebookGraphApiService } from './facebook';
import { StorageService } from './storage';
import { SpinnerService } from './spinner';
import { ToastrService } from './toastr';

const Services = [
  ApiService,
  DateService,
  FacebookGraphApiService,
  FacebookService,
  SpinnerService,
  StorageService,
  ToastrService
];


@NgModule({
  imports: [
    ...NgModules,
    ...NgxModules
  ],
  providers: [
    ...Clients,
    ...Services
  ],
  exports: [
    ...NgExports,
    ...NgxExports,
  ]
})
export class SharedModule { }
