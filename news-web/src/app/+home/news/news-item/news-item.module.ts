import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../../_shared';

import { NewsItemComponent } from './news-item.component';

@NgModule({
    declarations: [
        NewsItemComponent
    ],
    imports: [
        CommonModule,
        SharedModule
    ],
    providers: [
    ],
    exports: [
        NewsItemComponent
    ]
})
export class NewsItemModule { }
