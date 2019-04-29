import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FacebookService, FacebookGraphApiService } from './facebook';
import { CoreHttpClient } from './http';
import { ApiService } from './api';
import { ODataClient } from './odata';
import { StorageService } from './storage';

@NgModule({
  imports: [
    HttpClientModule
  ],
  providers: [
    FacebookService,
    FacebookGraphApiService,
    CoreHttpClient,
    ODataClient,
    ApiService,
    StorageService
  ],
  exports: [
  ]
})
export class SharedModule { }
