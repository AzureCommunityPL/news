import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { CoreHttpClient } from '../http';
import { environment } from '../../../environments/environment';

import { StorageConnectionDto } from '../api';
import { ODataNewsResponseDto } from './storage-odata.dto';

@Injectable()
export class StorageODataService {
    constructor(private client: CoreHttpClient) {
    }

    public getNews(dto: StorageConnectionDto): Observable<ODataNewsResponseDto> {
        return this.client.get<ODataNewsResponseDto>(this.getRequestUri(dto), this.getHttpHeaders());
    }

    // https://devnewssa.table.core.windows.net/news()?{sas-token}&$filter=PartitionKey%20eq%20'2518458912000000000'
    private getRequestUri(dto: StorageConnectionDto): string {
        return environment.local
            ? `/news-storage/${dto.tableName}()${dto.sasToken}&$filter=PartitionKey%20eq%20'2518458912000000000'&$top=10`
            : `${dto.storageAddress}/${dto.tableName}()${dto.sasToken}&$top=10`;
    }

    private getHttpHeaders(): HttpHeaders {
        const headers = new HttpHeaders()
            .append('Accept', 'application/json');

        return headers;
    }
}
