import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FacebookService, FacebookGraphApiService } from './facebook';
import { CoreHttpClient } from './http';
import { SasApiService } from './sas';


@NgModule({
  imports: [
    HttpClientModule
  ],
  providers: [
    FacebookService,
    FacebookGraphApiService,
    CoreHttpClient,
    SasApiService
  ],
})
export class SharedModule { }
