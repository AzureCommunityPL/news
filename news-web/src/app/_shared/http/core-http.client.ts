import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { Observable, Subject, Subscription, of } from 'rxjs';
import { tap, map, catchError, finalize } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http/src/headers';

/**
 * The HttpClient Service
 * - Executes HTTP requests (GET, POST, PUT, PATCH, DELETE)
 * - Raises error events as an {Observable<Response>}
 * - Raises request start and finished events as {Observable<void>}
 *
 * (!) Error handling intentionally delegated to subscribers of the error observable
 */
@Injectable()
export class CoreHttpClient {
  /**
   * The Error Observable.
   * @return A stream of {Response} events
   */
  public error: Observable<HttpErrorResponse>;

  /**
   * The RequestStarted Observable
   * @return provides a stream of events marking a start of a request
   */
  public requestStarted: Observable<void>;

  /**
   * The RequestFinished Observable
   * @return provides a stream of events marking the end of a request
   */
  public requestFinished: Observable<void>;

  private errorSubject: Subject<HttpErrorResponse> = new Subject();
  private requestStartedSubject: Subject<void> = new Subject();
  private requestFinishedSubject: Subject<void> = new Subject();

  public constructor(private client: HttpClient) {
    this.error = this.errorSubject.asObservable();
    this.requestStarted = this.requestStartedSubject.asObservable();
    this.requestFinished = this.requestFinishedSubject.asObservable();
  }

  /**
   * Executes a HTTP GET request
   * @param url The absolute request url
   * @param optionsArgs Optional request argss
   * @return An Observable stream containing deserialized response object(s)
   */
  public get<T>(url: string, httpHeaders?: HttpHeaders): Observable<T> {
    this.requestStartedSubject.next();

    const observable: Observable<T> = this.client
      .get(url, { responseType: 'json', headers: httpHeaders})
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error)),
        finalize<T>(() => this.requestFinishedSubject.next())
      );

    return observable;
  }

  /**
   * Executes a HTTP GET request
   * @param url The absolute request url
   * @param optionsArgs Optional request argss
   * @return An Observable stream containing the response Blob
   */
  // public getBlob<Blob>(url: string): Observable<Blob> {
  //   this.requestStartedSubject.next();

  //   const observable: Observable<Blob> = this.client
  //     .get(url, { responseType: 'blob' })
  //     .pipe(
  //       catchError((error: HttpErrorResponse) => this.handleError(error)),
  //       finalize<Blob>(()c => this.requestFinishedSubject.next())
  //     );

  //   return observable;
  // }

  /**
   * Executes a HTTP DELETE request
   * @param url The absolute request url
   * @param optionsArgs Optional request argss
   * @return An Observable stream containing the response
   */
  public delete(url: string): Observable<HttpResponse<any>> {
    this.requestStartedSubject.next();

    const observable = this.client
      .delete(url, { responseType: 'json' })
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error)),
        finalize<HttpResponse<any>>(() => this.requestFinishedSubject.next())
      );

    return observable;
  }

  /**
   * Executes a HTTP POST request
   * @param url The absolute request url
   * @param body The JSON object body
   * @param optionsArgs Optional request argss
   * @return An Observable stream containing the deserialized response object(s)
   */
  public post<T>(url: string, body: any, httpHeaders?: HttpHeaders): Observable<T> {
    const observable: Observable<T> = this.client
      .post(url, body, { responseType: 'json', headers: httpHeaders })
      .pipe(
        tap(x => this.requestStartedSubject.next()),
        catchError((error: HttpErrorResponse) => this.handleError(error)),
        finalize<T>(() => this.requestFinishedSubject.next())
      );

    return observable;
  }

  /**
   * Executes a HTTP PUT request
   * @param url The absolute request url
   * @param body The JSON object body
   * @param optionsArgs Optional request argss
   * @return An Observable stream containing the deserialized response object(s)
   */
  public put<T>(url: string, body: any): Observable<T> {
    this.requestStartedSubject.next();

    const observable: Observable<T> = this.client
      .put(url, body, { responseType: 'json' })
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error)),
        finalize<T>(() => this.requestFinishedSubject.next())
      );

    return observable;
  }

  /**
   * Executes a HTTP PATCH request
   * @param url The absolute request url
   * @param body The JSON object body
   * @param optionsArgs Optional request argss
   * @return An Observable stream containing the response deserialized response object(s)
   */
  public patch<T>(url: string, body: any): Observable<T> {
    this.requestStartedSubject.next();

    const observable: Observable<T> = this.client
      .patch(url, body, { responseType: 'json' })
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error)),
        finalize<T>(() => this.requestFinishedSubject.next())
      );

    return observable;
  }

  private handleError(response: HttpErrorResponse): Observable<HttpErrorResponse> {
    this.errorSubject.next(response);
    return of(response);
  }
}
