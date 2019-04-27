import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FacebookService, FacebookGraphApiService } from './facebook';
import { CoreHttpClient } from './http';

@NgModule({
  imports: [
    HttpClientModule
  ],
  providers: [
    FacebookService,
    FacebookGraphApiService,
    CoreHttpClient
  ],
})
export class SharedModule { }
