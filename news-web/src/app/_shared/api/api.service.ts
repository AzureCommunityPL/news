import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { CoreHttpClient } from '../http';
import { environment } from '../../../environments/environment';

import { StorageConnectionDto } from './api.dto';

@Injectable()
export class ApiService {
    constructor(private client: CoreHttpClient) {
    }

    public getStorageConnection(): Observable<StorageConnectionDto> {
        return this.client.get<StorageConnectionDto>(
            this.getRequestUri(), this.getHttpHeaders());
    }

    private getRequestUri(): string {
        return environment.local
            ? `${environment.apiAddress}/api/GetStorageConnection`
            : `${environment.apiAddress}/api/GetStorageConnection?code=${environment.apiKey}`;
    }

    private getHttpHeaders(): HttpHeaders {
        const headers = new HttpHeaders()
            .append('Accept', 'application/json');

        return headers;
    }
}
