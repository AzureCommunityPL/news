// ng
import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil, withLatestFrom, switchMap } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { CommentEditModel } from '../news-item.models';
import { NewsItemService } from '../news-item.service';
import { NewsItemComponent } from '../news-item.component';
import { FacebookService } from 'src/app/_shared/facebook/facebook.service';
import { ToastrService } from 'src/app/_shared/toastr/toastr.service';

@Component({
  selector: 'app-news-item-modal',
  templateUrl: './news-item-modal.component.html',
  styleUrls: ['./news-item-modal.component.scss']
})
export class NewsItemModalComponent implements OnInit, OnDestroy {
    public model: CommentEditModel;
    public parent: NewsItemComponent;

    public subject: Subject<CommentEditModel> = new Subject<CommentEditModel>();
    private unsubscribe: Subject<void> = new Subject<void>();

    constructor(
      private modal: BsModalRef,
      private facebook: FacebookService,
      private service: NewsItemService,
      private toastr: ToastrService) {

 this.subject
      .pipe(
        takeUntil(this.unsubscribe),
        withLatestFrom(this.facebook.user),
        switchMap((input) => this.service.postComment(input[0], input[1])))
      .subscribe(x => {
        this.toastr.success('Comment sent successfully', 'Success');
        this.parent.refresh();
        this.modal.hide();
      }, (e) => {
        console.error('Failed to POST comment: ', e);
        this.toastr.error('Failed to send comment', 'Failure');
        this.modal.hide();
      });

    }

    public ngOnInit(): void {
    }

    public ngOnDestroy(): void {
      this.unsubscribe.next();
    }
}
