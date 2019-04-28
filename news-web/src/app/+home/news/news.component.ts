import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NewsService } from './news.service';
import { NewsModel } from './news.model';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit, OnDestroy {
    public news: NewsModel[] = [];

    private unsubscribe: Subject<void> = new Subject<void>();

    constructor(private service: NewsService) {
      // this.service.newNews().subscribe(x => console.log('newNews: ', x));
    }

    public ngOnInit(): void {
      this.service.getNews()
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(x => this.news = x);
    }

    public ngOnDestroy(): void {
      this.unsubscribe.next();
    }
}
