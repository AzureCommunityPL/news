import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { FacebookService, FacebookUser } from './_shared/facebook';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  public title = 'Azure news';

  constructor(private spinner: NgxSpinnerService) {
  }

  public ngAfterViewInit(): void {
    this.spinner.show('main');

    setTimeout(() => {
      /** spinner ends after 5 seconds */
      this.spinner.hide('main');
    }, 5000);
  }
}
