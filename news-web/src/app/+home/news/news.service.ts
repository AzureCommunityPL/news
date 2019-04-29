import { Injectable } from '@angular/core';

import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { switchMap, map, tap, publishReplay, refCount } from 'rxjs/operators';

import { ApiService } from '../../_shared/api';
import { StorageService, NewsResponseDto } from '../../_shared/storage';

import { NewsModel } from './news.model';

@Injectable()
export class NewsService {
    public unsubscribe: Subject<void> = new Subject<void>();

    constructor(
        private api: ApiService,
        private odata: StorageService) {
    }

    public getNews(ticks: number): Observable<NewsModel[]> {
        return this.api.getStorageConnection()
            .pipe(
                switchMap(x => this.odata.getNews(x, ticks)),
                publishReplay(1),
                refCount(),
                map(x => this.mapAsNewsModel(x)));
    }

    private mapAsNewsModel(response: NewsResponseDto): NewsModel[] {
        return response.value.map<NewsModel>(x => ({
            title: x.Title,
            url: x.Url,
            summary: x.Summary,
            partitioningKey: x.PartitionKey,
            rowKey: x.RowKey,
            comments: [],   // unsupported yet
            lastModified: new Date(x.TimeStamp)
        }));
    }
}
