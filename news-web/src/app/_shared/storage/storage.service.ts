import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ODataClient, ODataFilterExpression } from '../odata';
import { environment } from '../../../environments/environment';

import { StorageConnectionDto } from '../api';
import { NewsResponseDto } from './storage.dto';
import { ODataFilter } from 'src/app/_shared/odata/odata.model';

@Injectable()
export class StorageService {
    constructor(private client: ODataClient) {
    }

    public getNews(dto: StorageConnectionDto): Observable<NewsResponseDto> {
        const filters: ODataFilter[] = [
            {
                key: 'PartitionKey',
                expression: ODataFilterExpression.Equals,
                value: '2518458912000000000'
            }
        ];
        return this.client.get<NewsResponseDto>(this.getRequestUri(dto), filters, this.getHttpHeaders());
    }

    // $filter=PartitionKey%20eq%20'2518458912000000000'&
    // https://devnewssa.table.core.windows.net/news()?{sas-token}&$filter=PartitionKey%20eq%20'2518458912000000000'
    private getRequestUri(dto: StorageConnectionDto): string {
        return environment.local
            ? `/news-storage/${dto.tableName}()${dto.sasToken}&$top=10`
            : `${dto.storageAddress}/${dto.tableName}()${dto.sasToken}&$top=10`;
    }

    private getHttpHeaders(): HttpHeaders {
        const headers = new HttpHeaders()
            .append('Accept', 'application/json');

        return headers;
    }
}
