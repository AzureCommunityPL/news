import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ODataClient, ODataFilter, ODataFilterExpression } from '../odata';
import { environment } from '../../../environments/environment';

import { StorageConnectionDto } from '../api';
import { NewsResponseDto } from './storage.dto';

@Injectable()
export class StorageService {
    constructor(private client: ODataClient) {
    }

    public getNews(dto: StorageConnectionDto, ticks: number): Observable<NewsResponseDto> {
        const filters: ODataFilter[] = [
            {
                key: 'PartitionKey',
                expression: ODataFilterExpression.Equals,
                value: `${ticks}`
            }
        ];
        return this.client.get<NewsResponseDto>(this.getRequestUri(dto), filters, this.getHttpHeaders());
    }

    // $filter=PartitionKey%20eq%20'2518458912000000000'&
    // https://devnewssa.table.core.windows.net/news()?{sas-token}&$filter=PartitionKey%20eq%20'2518458912000000000'
    private getRequestUri(dto: StorageConnectionDto): string {
        return `/storage/${dto.tableName}()${dto.sasToken}&$top=10`;
    }

    private getHttpHeaders(): HttpHeaders {
        const headers = new HttpHeaders()
            .append('Accept', 'application/json');

        return headers;
    }
}
