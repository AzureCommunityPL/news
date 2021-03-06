import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../../_shared';

import { NewsItemModalModule } from './news-item-modal/news-item-modal.module';

import { NewsItemComponent } from './news-item.component';
import { NewsItemService } from './news-item.service';

@NgModule({
    declarations: [
        NewsItemComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        NewsItemModalModule
    ],
    providers: [
        NewsItemService
    ],
    exports: [
        NewsItemComponent
    ]
})
export class NewsItemModule { }
