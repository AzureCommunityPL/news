import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// services
import { FacebookService, FacebookGraphApiService } from './facebook';
import { CoreHttpClient } from './http';
import { ApiService } from './api';
import { ODataClient } from './odata';
import { StorageService } from './storage';
import { DateService } from './utils';

const NgModules = [
  HttpClientModule,
  FormsModule
];

const NgExports = [
  FormsModule
];

const NgxModules = [
  BsDatepickerModule.forRoot(),
];

const NgxExports = [
  BsDatepickerModule
];

@NgModule({
  imports: [
    ...NgModules,
    ...NgxModules
  ],
  providers: [
    FacebookService,
    FacebookGraphApiService,
    CoreHttpClient,
    ODataClient,
    ApiService,
    StorageService,
    DateService
  ],
  exports: [
    ...NgExports,
    ...NgxExports
  ]
})
export class SharedModule { }
