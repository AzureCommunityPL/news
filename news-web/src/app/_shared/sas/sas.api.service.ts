import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { CoreHttpClient } from '../http';
import { environment } from '../../../environments/environment';

import { SasDto } from './sas.dto';

@Injectable()
export class SasApiService {
    constructor(private client: CoreHttpClient) {
    }

    public getSasToken(): Observable<SasDto> {
        return this.client.get<SasDto>(
            this.getRequestUri());
    }

    private getRequestUri(): string {
        return environment.sasApiKey
            ? `${environment.sasApiAddress}/api/GenerateSAS?code=${environment.sasApiKey}`
            : `${environment.sasApiAddress}/api/GenerateSAS`;
    }

    private getHttpHeaders(): HttpHeaders {
        const headers = new HttpHeaders()
            .append('Content-Type', 'application/json');

        return headers;
    }
}
