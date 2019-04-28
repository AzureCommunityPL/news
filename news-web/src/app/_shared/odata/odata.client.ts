import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { CoreHttpClient } from '../http';

import { ODataFilter, ODataFilterMap } from './odata.model';

@Injectable()
export class ODataClient {
    constructor(private client: CoreHttpClient) {
    }

    public get<T>(url: string, filters?: ODataFilter[], headers?: HttpHeaders): Observable<T> {
        return this.client.get<T>(url, headers);
    }

    private getFilterQuery(filters: ODataFilter[]): string {
        const filterExpressions = filters.map(f => this.getFilterExpression(f)).join(' ');
        return `$filter=${filterExpressions}`;
    }

    private getFilterExpression(filter: ODataFilter): string {
        return filter.operator
            ? `${ODataFilterMap[filter.operator]} ${filter.key} ${ODataFilterMap[filter.expression]} ${filter.value}`
            : `${filter.key} ${ODataFilterMap[filter.expression]} ${filter.value}`;
    }
}
