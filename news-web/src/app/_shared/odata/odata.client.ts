import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { CoreHttpClient } from '../http';

import { ODataFilter, ODataFilterMap, ODataQuery } from './odata.models';
import { ODataQueryBuilder } from './odata.query-builder';

@Injectable()
export class ODataClient {
    constructor(private client: CoreHttpClient) {
    }

    public get<T>(url: string, query?: ODataQuery, headers?: HttpHeaders): Observable<T> {
        if (query) {
            const queryString = ODataQueryBuilder.build(query);
            if (queryString) {
                url = (url.indexOf('?') === -1
                    ? `${url}?${queryString}`
                    : `${url}&${queryString}`);
            }
        }

        return this.client.get<T>(url, headers);
    }
}
