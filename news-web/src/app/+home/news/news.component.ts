import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, switchMap, map } from 'rxjs/operators';

import { NewsService } from './news.service';
import { NewsModel } from './news.model';
import { DateService } from '../../_shared/utils';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit, OnDestroy {
    public news: NewsModel[] = [];
    public totalItems = 30;

    private dateSubject: BehaviorSubject<Date> = new BehaviorSubject(new Date());

    public get date(): Date {
      return this.dateSubject.getValue();
    }
    public set date(value: Date) {
      this.dateSubject.next(value);
    }

    private unsubscribe: Subject<void> = new Subject<void>();

    constructor(private service: NewsService, private dateService: DateService) {
    }

    public ngOnInit(): void {
      this.dateSubject
        .pipe(
          takeUntil(this.unsubscribe),
          map(date => this.dateService.getTicks(date)),
          switchMap(ticks => this.service.getNews(ticks)))
        .subscribe(x => this.news = x);
    }

    public ngOnDestroy(): void {
      this.unsubscribe.next();
    }
}
