import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { CoreHttpClient } from '../http';
import { environment } from '../../../environments/environment';

import { StorageConnectionDto, CommentDto } from './api.dto';

@Injectable()
export class ApiService {
    constructor(private client: CoreHttpClient) {
    }

    public getStorageConnection(): Observable<StorageConnectionDto> {
        return this.client.get<StorageConnectionDto>(
            `/api/GetStorageConnection`, this.getHttpHeaders());
    }

    public postComment(id: string, dto: CommentDto): Observable<void> {
        const headers = this.getHttpHeaders()
            .append('access_token', '');

        return this.client.post<void>(`/api/comment/${id}`, dto, headers);
    }

    private getHttpHeaders(): HttpHeaders {
        const headers = new HttpHeaders()
            .append('Accept', 'application/json');

        return headers;
    }
}
