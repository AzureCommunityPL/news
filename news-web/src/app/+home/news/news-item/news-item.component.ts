import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { Subject } from 'rxjs';
import { takeUntil, combineLatest, withLatestFrom, switchMap, tap, map, startWith } from 'rxjs/operators';
import { BsModalService } from 'ngx-bootstrap/modal';

import { FacebookService } from '../../../_shared/facebook';
import { SpinnerService } from '../../../_shared/spinner';

import { NewsCommentModel } from '../news.model';
import { NewsItemService } from './news-item.service';
import { TableEntity, CommentModel, CommentEditModel } from './news-item.models';
import { CoreHttpClient } from '../../../_shared/http/core-http.client';
import { HttpHeaders } from '@angular/common/http';
import { FacebookUser } from '../../../_shared/facebook';
import { NewsItemModalComponent } from './news-item-modal/news-item-modal.component';
import { ModalOptions } from 'ngx-bootstrap/modal/modal-options.class';
import { Observable } from 'rxjs/internal/Observable';

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
  public canAddComment: Observable<boolean>;
  public canEditComment: Observable<boolean>;

  public get spinnerName(): string {
    return `${this.partitioningKey}.${this.rowKey}.spinner`;
  }

  private unsubscribe: Subject<void> = new Subject<void>();

  public comments: Subject<CommentModel[]> = new Subject<CommentModel[]>();
  private subject: Subject<CommentEditModel> = new Subject<CommentEditModel>();
  private commentSubject: Subject<TableEntity> = new Subject<TableEntity>();

  constructor(
    public facebook: FacebookService,
    private service: NewsItemService,
    private spinner: SpinnerService,
    private client: CoreHttpClient,
    private modal: BsModalService) {

    this.canAddComment = this.comments
      .pipe(
      combineLatest(this.facebook.user),
      map((input: [CommentModel[], FacebookUser]) => !!!input[0].find(x => x.userId === input[1].id)),
      startWith(false)
      );

    this.canEditComment = this.comments
      .pipe(
      combineLatest(this.facebook.user),
      map((input: [CommentModel[], FacebookUser]) => !!input[0].find(x => x.userId === input[1].id)),
      startWith(false)
      );

    this.subject
      .pipe(
      takeUntil(this.unsubscribe)
      )
      .subscribe(x => {
        const model: CommentEditModel = {
          partitioningKey: this.partitioningKey,
          rowKey: this.rowKey,
          title: undefined,
          comment: undefined
        };

        const initialState = {
          model,
          parent: this
        };

        this.modal.show(NewsItemModalComponent, { initialState });
      });

    this.commentSubject
      .pipe(
      takeUntil(this.unsubscribe),
      tap(x => this.spinner.show(this.spinnerName)),
      switchMap(entity => this.service.getComments(entity)))
      .subscribe(this.comments);
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

  public refresh(): void {
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
