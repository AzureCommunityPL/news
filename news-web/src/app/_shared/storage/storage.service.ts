import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { ODataClient, ODataFilter, ODataFilterExpression, ODataQuery } from '../odata';
import { environment } from '../../../environments/environment';

import { StorageTokenDto } from '../api';
import { NewsResponseDto, CommentResponseDto } from './storage.dto';
import { ODataResponseDto, ODataValueDto } from 'src/app/_shared/odata/odata.models';
import { DateService } from '../../_shared/utils';

@Injectable()
export class StorageService {
    constructor(private client: ODataClient, private service: DateService) {
    }

    public getLatestNewsDate(dto: StorageTokenDto): Observable<Date> {
        const query: ODataQuery = {
            select: ['PartitionKey'],
            top: 1
        };

        return this.client.get<ODataResponseDto<ODataValueDto>>(this.getRequestUri(dto), query, this.getHttpHeaders())
            .pipe(
            filter(x => x.value.length === 1),
            filter(x => x.value[0].PartitionKey !== undefined),
            map(x => +x.value[0].PartitionKey),
            map(x => this.service.getDate(x))
            );
    }

    public getNews(dto: StorageTokenDto, ticks: number): Observable<NewsResponseDto> {
        const query: ODataQuery = {
            filters: [
                {
                    key: 'PartitionKey',
                    expression: ODataFilterExpression.Equals,
                    value: `${ticks}`
                }
            ]
        };
        return this.client.get<NewsResponseDto>(this.getRequestUri(dto), query, this.getHttpHeaders());
    }

    public getComments(dto: StorageTokenDto,
                       partitioningKey: string, rowKey: string): Observable<CommentResponseDto> {
        const query: ODataQuery = {
            filters: [
                {
                    key: 'PartitionKey',
                    expression: ODataFilterExpression.Equals,
                    value: `${partitioningKey}-${rowKey}`
                }
            ]
        };

        return this.client.get<CommentResponseDto>(this.getRequestUri(dto),
            query,
            this.getHttpHeaders());
    }

    // $filter=PartitionKey%20eq%20'2518458912000000000'&
    // https://devnewssa.table.core.windows.net/news()?{sas-token}&$filter=PartitionKey%20eq%20'2518458912000000000'
    private getRequestUri(dto: StorageTokenDto): string {
        return `/storage/${dto.name}()${dto.sas}`;
    }

    private getHttpHeaders(): HttpHeaders {
        const headers = new HttpHeaders()
            .append('Accept', 'application/json');

        return headers;
    }
}
