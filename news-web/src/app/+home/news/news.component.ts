// ng
import { Component, AfterViewInit, OnDestroy } from '@angular/core';

// rxjs
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, switchMap, map, tap, catchError, finalize } from 'rxjs/operators';

import { NewsService } from './news.service';
import { NewsModel } from './news.model';
import { DateService } from '../../_shared/utils';
import { SpinnerService } from '../../_shared/spinner/spinner.service';
import { ToastrService } from '../../_shared/toastr';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements AfterViewInit, OnDestroy {
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

    constructor(
      private service: NewsService,
      private dateService: DateService,
      private spinner: SpinnerService,
      private toastr: ToastrService) {
    }

    public ngAfterViewInit(): void {
      this.dateSubject
        .pipe(
          takeUntil(this.unsubscribe),
          tap(x => this.spinner.show()),
          map(date => this.dateService.getTicks(date)),
          switchMap(ticks => this.service.getNews(ticks)))
        .subscribe(x => {
          this.news = x;
          this.spinner.hide();

          if (!Array.isArray(x) || !x.length) {
            this.toastr.warning('No results were found, try another date', 'No results');
          }
        }, (e) => {
          this.spinner.hide();
          this.toastr.error(e.Message, 'Failed to retrieve news');
        });
    }

    public ngOnDestroy(): void {
      this.unsubscribe.next();
    }
}
