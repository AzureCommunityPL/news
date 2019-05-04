import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil, combineLatest, switchMap, tap } from 'rxjs/operators';

import { FacebookService } from '../../../_shared/facebook';
import { SpinnerService } from '../../../_shared/spinner';

import { NewsCommentModel } from '../news.model';
import { NewsItemService } from './news-item.service';
import { TableEntity, CommentModel } from './news-item.models';

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

  public get spinnerName(): string {
    return `${this.partitioningKey}.${this.rowKey}.spinner`;
  }

  private unsubscribe: Subject<void> = new Subject<void>();

  public comments: CommentModel[] = [];
  private subject: Subject<void> = new Subject<void>();
  private commentSubject: Subject<TableEntity> = new Subject<TableEntity>();

  constructor(
    public facebook: FacebookService,
    private service: NewsItemService,
    private spinner: SpinnerService) {
    this.subject
      .pipe(
      takeUntil(this.unsubscribe),
      combineLatest(this.facebook.user, (_, user) => {
        console.log('inside combineLatest: ', user);
        return user;
      }))
      .subscribe(x => console.log('sub: ', x));

    this.commentSubject
      .pipe(
        takeUntil(this.unsubscribe),
        tap(x => this.spinner.show(this.spinnerName)),
        switchMap(entity => this.service.getComments(entity))
      )
      .subscribe(x => {
        // this.spinner.hide(this.spinnerName);
        this.comments = x;
      });
  }

  public ngOnInit(): void {
    this.refresh();
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
  }

  public onAddComment(): void {
    console.log('onAddComment called');
    this.subject.next();
  }

  private refresh(): void {
    this.commentSubject.next({
      partitioningKey: this.partitioningKey,
      rowKey: this.rowKey
    });
  }
}
