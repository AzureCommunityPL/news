import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../../../_shared/shared.module';
import { NewsItemModalComponent } from './news-item-modal.component';
import { NewsItemModalModeToStringPipe, NewsItemModalBtnModeToStringPipe } from './news-item-modal.pipe';
@NgModule({
    entryComponents: [
        NewsItemModalComponent
    ],
    declarations: [
        NewsItemModalComponent,
        NewsItemModalModeToStringPipe,
        NewsItemModalBtnModeToStringPipe
    ],
    providers: [],
    imports: [
        CommonModule,
        SharedModule
    ],
    exports: [
        NewsItemModalComponent
    ]
})
export class NewsItemModalModule { }
