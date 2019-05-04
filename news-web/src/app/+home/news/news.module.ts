import { NgModule } from '@angular/core';

import { SharedModule } from '../../_shared';

import { NewsComponent } from './news.component';
import { NewsService } from './news.service';
import { NewsItemModule } from './news-item/news-item.module';

@NgModule({
    declarations: [
        NewsComponent
    ],
    imports: [
        SharedModule,
        NewsItemModule
    ],
    providers: [
        NewsService
    ],
    exports: [
        NewsComponent
    ]
})
export class NewsModule { }
