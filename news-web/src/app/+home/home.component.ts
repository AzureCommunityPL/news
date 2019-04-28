import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject, Observable } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { ApiService } from '../_shared/api';
import { StorageODataService } from '../_shared/storage-odata';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  // private subject: Subject<void> = new Subject<void>();
  // private unsubscribe: Subject<void> = new Subject<void>();

  constructor() {

    // this.subject
    //   .pipe(
    //     takeUntil(this.unsubscribe),
    //     switchMap(x => this.api.getStorageConnection()),
    //     tap(x => console.log('api: ', x)),
    //     switchMap(x => this.odata.getNews(x)),
    //     tap(x => console.log('storage: ', x))
    //   ).subscribe(x => console.log('storage response: ', x));
  }

  public ngOnInit(): void {
    // this.subject.next();
  }

  public ngOnDestroy(): void {
    // this.unsubscribe.next();
  }
}
