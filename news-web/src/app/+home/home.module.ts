import { NgModule } from '@angular/core';

import { NewsModule } from './news';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    NewsModule
  ],
  providers: []
})
export class HomeModule { }
