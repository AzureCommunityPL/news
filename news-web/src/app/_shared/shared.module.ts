import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FacebookService, FacebookGraphApiService } from './facebook';
import { CoreHttpClient } from './http';
import { ApiService } from './api';
import { StorageODataService } from './storage-odata';

@NgModule({
  imports: [
    HttpClientModule
  ],
  providers: [
    FacebookService,
    FacebookGraphApiService,
    CoreHttpClient,
    ApiService,
    StorageODataService
  ],
  exports: [
  ]
})
export class SharedModule { }
