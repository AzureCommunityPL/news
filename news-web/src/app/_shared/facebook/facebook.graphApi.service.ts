// tslint:disable-next-line:no-reference
/// <reference path='./../../../../node_modules/@types/facebook-js-sdk/index.d.ts'/>

import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { FacebookService } from './facebook.service';
import { FacebookUser } from './facebook.models';
import { CoreHttpClient } from '../http';
import { environment } from '../../../environments/environment';

@Injectable()
export class FacebookGraphApiService {
    private readonly address: string = `https://graph.facebook.com/${environment.fbApiVersion}`;
    constructor(private client: CoreHttpClient) {
    }

    public get<T>(requestPath: string, user: FacebookUser): Observable<T> {
        if (requestPath.startsWith('/')) {
            requestPath = requestPath.substring(1);
        }
        return this.client.get<T>(`${this.address}/${requestPath}`, this.getHttpHeaders(user));
    }

    private getHttpHeaders(user: FacebookUser): HttpHeaders {
        const headers = new HttpHeaders()
        .append('Content-Type', 'application/json')
        .append('Authorization', `Bearer ${user.token.value}`);

        return headers;
    }
}
