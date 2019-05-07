import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { Subject } from 'rxjs';
import { takeUntil, combineLatest, withLatestFrom, switchMap, tap } from 'rxjs/operators';

import { FacebookService } from '../../../_shared/facebook';
import { SpinnerService } from '../../../_shared/spinner';

import { NewsCommentModel } from '../news.model';
import { NewsItemService } from './news-item.service';
import { TableEntity, CommentModel, CommentEditModel } from './news-item.models';
import { CoreHttpClient } from '../../../_shared/http/core-http.client';
import { HttpHeaders } from '@angular/common/http';
import { FacebookUser } from '../../../_shared/facebook';

@Component({
  selector: 'app-news-item',
  templateUrl: './news-item.component.html',
  styleUrls: ['./news-item.component.scss']
})
export class NewsItemComponent implements OnInit, OnDestroy {
  @Input() public title: string;
  @Input() public summary: string;
  @Input() public url: string;
  @Input() public partitioningKey: string;
  @Input() public rowKey: string;

  public edit: CommentEditModel;

  public get spinnerName(): string {
    return `${this.partitioningKey}.${this.rowKey}.spinner`;
  }

  private unsubscribe: Subject<void> = new Subject<void>();

  public comments: CommentModel[] = [];
  private subject: Subject<CommentEditModel> = new Subject<CommentEditModel>();
  private commentSubject: Subject<TableEntity> = new Subject<TableEntity>();

  constructor(
    public facebook: FacebookService,
    private service: NewsItemService,
    private spinner: SpinnerService,
    private client: CoreHttpClient,
    private ngClient: HttpClient) {

    this.subject
      .pipe(
      takeUntil(this.unsubscribe),
      withLatestFrom(this.facebook.user),
      switchMap((input: [CommentEditModel, FacebookUser]) => {
        const id = `${this.partitioningKey}_${this.rowKey}`;
        const headers = new HttpHeaders()
          .append('Content-Type', 'application/json')
          .append('access_token', input[1].token.value);
        return this.ngClient.post<any>(`/api/comment/${id}`, input[0], { headers });
      }))
      .subscribe(x => {
        this.refresh();
      }, (e) => console.error('Failed to POST comment: ', e));

    this.commentSubject
      .pipe(
      takeUntil(this.unsubscribe),
      tap(x => this.spinner.show(this.spinnerName)),
      switchMap(entity => this.service.getComments(entity)))
      .subscribe(x => {
        this.comments = x;
      });
  }

  public ngOnInit(): void {
    this.refresh();
    this.resetEditModel();
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
  }

  public onAddComment(): void {
    this.subject.next(this.edit);
  }

  public getUserPictureUrl(comment: CommentModel): string {
    return `https://graph.facebook.com/${comment.userId}/picture?type=normal&height=36`;
  }

  private refresh(): void {
    this.resetEditModel();

    this.commentSubject.next({
      partitioningKey: this.partitioningKey,
      rowKey: this.rowKey
    });
  }

  private resetEditModel(): void {
    this.edit = {
      partitioningKey: this.partitioningKey,
      rowKey: this.rowKey,
      title: null,
      comment: null
    };
  }
}
