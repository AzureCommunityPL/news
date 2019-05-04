import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { ApiService } from '../../../_shared/api';
import { StorageService, CommentResponseDto } from '../../../_shared/storage';

import { CommentModel, CommentEditModel, TableEntity } from './news-item.models';
import { FacebookUser } from '../../../_shared/facebook/facebook.models';
import { CommentDto } from '../../../_shared/api/api.dto';

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
                map(response => this.mapAsCommentModel(response, model))
            );
    }

    public postComment(model: CommentEditModel, user: FacebookUser): any {
        const id = `${model.partitioningKey}_${model.rowKey}`;
        const dto: CommentDto = {
            title: model.title,
            comment: model.comment
        };

        return this.apiService.postComment(id, dto, user);
    }

    private mapAsCommentModel(response: CommentResponseDto, model: TableEntity): CommentModel[] {
        return response.value.map(c => ({
            partitioningKey: model.partitioningKey,
            rowKey: model.rowKey,
            title: c.title,
            comment: c.comment,
            userId: c.RowKey
        }));
    }
}
