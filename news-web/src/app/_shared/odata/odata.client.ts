import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { CoreHttpClient } from '../http';

import { ODataFilter, ODataFilterMap } from './odata.models';

@Injectable()
export class ODataClient {
    constructor(private client: CoreHttpClient) {
    }

    public get<T>(url: string, filters?: ODataFilter[], headers?: HttpHeaders): Observable<T> {
        return this.client.get<T>(this.buildRequestUrl(url, filters), headers);
    }

    private buildRequestUrl(url: string, filters?: ODataFilter[]) {
        let result: string;
        if (filters) {
            const filter = this.getFilterQuery(filters);
            result = (url.indexOf('?') === -1
                ? `${url}?$filter=${filter}`
                : `${url}&$filter=${filter}`);
            } else {
                result = url;
            }
        return result;
    }

    private getFilterQuery(filters: ODataFilter[]): string {
        const filterExpressions = filters.map(f => this.getFilterExpression(f)).join(' ');
        return encodeURIComponent(`${filterExpressions}`);
    }

    private getFilterExpression(filter: ODataFilter): string {
        return filter.operator
            ? `${ODataFilterMap[filter.operator]} ${filter.key} ${ODataFilterMap[filter.expression]} '${filter.value}'`
            : `${filter.key} ${ODataFilterMap.get(filter.expression)} '${filter.value}'`;
    }
}
