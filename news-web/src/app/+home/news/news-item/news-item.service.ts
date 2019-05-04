import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { ApiService } from '../../../_shared/api';
import { StorageService, CommentResponseDto } from '../../../_shared/storage';

import { CommentModel, TableEntity } from './news-item.models';

@Injectable()
export class NewsItemService {
    constructor(
        private apiService: ApiService,
        private storageService: StorageService) {
    }

    public getComments(model: TableEntity): Observable<CommentModel[]> {
        return this.apiService.getStorageToken('comments')
            .pipe(
                switchMap(dto => this.storageService.getComments(dto, model.partitioningKey, model.rowKey)),
                map(response => this.mapAsCommentModel(response))
            );
    }

    private mapAsCommentModel(response: CommentResponseDto): CommentModel[] {
        return response.value.map(c => ({
            title: c.title,
            comment: c.comment,
            userId: c.RowKey
        }));
    }
}
