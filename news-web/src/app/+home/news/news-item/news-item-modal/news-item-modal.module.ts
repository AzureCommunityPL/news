import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../../../_shared/shared.module';
import { NewsItemModalComponent } from './news-item-modal.component';
@NgModule({
    entryComponents: [
        NewsItemModalComponent
    ],
    declarations: [
        NewsItemModalComponent
    ],
    imports: [
        CommonModule,
        SharedModule
    ],
    exports: [
        NewsItemModalComponent
    ]
})
export class NewsItemModalModule { }
