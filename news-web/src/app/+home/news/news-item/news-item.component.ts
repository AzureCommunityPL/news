import { Component, Input } from '@angular/core';

import { Subject } from 'rxjs';
import { combineLatest } from 'rxjs/operators';

import { NewsCommentModel } from '../news.model';

import { FacebookService } from '../../../_shared/facebook';

@Component({
  selector: 'app-news-item',
  templateUrl: './news-item.component.html',
  styleUrls: ['./news-item.component.scss']
})
export class NewsItemComponent {
  @Input() public title: string;
  @Input() public summary: string;
  @Input() public url: string;
  @Input() public comments: NewsCommentModel[] = [
    {
      userId: 'user1',
      // tslint:disable-next-line:max-line-length
      comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
    },
    {
      userId: 'user2',
      title: 'Proposed title by user2',
      // tslint:disable-next-line:max-line-length
      comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
    }];

    private subject: Subject<void> = new Subject<void>();

    constructor(public  facebook: FacebookService) {
      this.subject
      .pipe(
        combineLatest(this.facebook.user, (_, user) => {
          console.log('inside combineLatest: ', user);
          return user;
        }))
        .subscribe(x => console.log('sub: ', x));
    }

    public onAddComment(): void {
      console.log('onAddComment called');
      this.subject.next();
    }
}
