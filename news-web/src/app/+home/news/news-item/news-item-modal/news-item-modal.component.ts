// Ng
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// 3rdParty
import { Subject } from 'rxjs';
import { takeUntil, withLatestFrom, switchMap } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';

// Local
import { NewsItemModalMode } from './news-item-modal.models';
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
  public get minCommentLength(): number { return 5; }
  public get minTitleLength(): number { return 5; }

  public subject: Subject<CommentEditModel> = new Subject<CommentEditModel>();
  private unsubscribe: Subject<void> = new Subject<void>();
  public mode: NewsItemModalMode;
  public userForm: FormGroup;

  constructor(
    private modal: BsModalRef,
    private facebook: FacebookService,
    private service: NewsItemService,
    private toastr: ToastrService,
    private fb: FormBuilder) {

    this.subject.pipe(
      takeUntil(this.unsubscribe),
      withLatestFrom(this.facebook.user),
      switchMap((input) => {
        return this.mode === NewsItemModalMode.Create
          ? this.service.postComment(input[0], input[1])
          : this.service.putComment(input[0], input[1]);
      }))
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
    this.mode = this.model.comment ? NewsItemModalMode.Edit : NewsItemModalMode.Create;

    this.userForm = this.fb.group({
      title: [this.model.title, [Validators.minLength(this.minTitleLength)]],
      comment: [this.model.comment, [Validators.required, Validators.minLength(this.minCommentLength)]]
    });

  }

  public sendComment(): void {
    this.subject.next({
      title: this.userForm.value.title,
      comment: this.userForm.value.comment,
      partitioningKey: this.model.partitioningKey,
      rowKey: this.model.rowKey
    });
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
  }
}
