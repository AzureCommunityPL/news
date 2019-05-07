import { Injectable } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';

import { CoreHttpClient } from '../http';
import { environment } from '../../../environments/environment';

import { StorageTokenDto, CommentDto } from './api.dto';
import { FacebookUser } from '../facebook';

@Injectable()
export class ApiService {
    constructor(private client: CoreHttpClient) {
    }

    public getStorageToken(tableName: string): Observable<StorageTokenDto> {
        return this.client.get<StorageTokenDto>(
            `/api/${tableName}/token`, this.getHttpHeaders());
    }

    public postComment(id: string, dto: CommentDto, user: FacebookUser): Observable<HttpResponse<any>> {
        const headers = this.getHttpHeaders()
            .append('access_token', user.token.value);

        return this.client.post<HttpResponse<any>>(
            `/api/comment/${id}`, dto, headers);
    }

    private getHttpHeaders(): HttpHeaders {
        const headers = new HttpHeaders()
            .append('Accept', 'application/json');

        return headers;
    }
}
