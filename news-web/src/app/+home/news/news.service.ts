import { Injectable } from '@angular/core';

import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { switchMap, map, tap, publishReplay, refCount, finalize } from 'rxjs/operators';

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

    public getLatestNewsDate(): Observable<Date> {
        return this.api.getStorageConnection()
        .pipe(
            switchMap(x => this.odata.getLatestNewsDate(x)),
            tap(x => console.log('retrieved last news date:', x)));
    }

    public getNews(ticks: number): Observable<NewsModel[]> {
        return this.api.getStorageConnection()
            .pipe(
                tap(x => console.log('getting news for:', ticks)),
                switchMap(x => this.odata.getNews(x, ticks)),
                map(x => this.mapAsNewsModel(x)));
    }

    private mapAsNewsModel(response: NewsResponseDto): NewsModel[] {
        console.log('mapping response: ', response);
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
