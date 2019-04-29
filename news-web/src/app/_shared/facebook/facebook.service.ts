// tslint:disable-next-line:no-reference
/// <reference path='./../../../../node_modules/@types/facebook-js-sdk/index.d.ts'/>
import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject, ReplaySubject, Subscription } from 'rxjs';
import { switchMap, map, tap, startWith, filter } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { resetCompiledComponents } from '@angular/core/src/render3/jit/module';

import { FacebookUser, FacebookUserPicture } from './facebook.models';
import { FacebookGraphApiService } from './facebook.graphApi.service';
import { PictureResponse } from './facebook.dto';

@Injectable()
export class FacebookService {
    public user: Observable<FacebookUser>;
    public userPicture: Observable<FacebookUserPicture>;

    private userSubject: ReplaySubject<FacebookUser> = new ReplaySubject<FacebookUser>();
    private userPictureSubject: Subject<FacebookUserPicture> = new Subject<FacebookUserPicture>();
    private initialized = false;

    public initialize(): void {
        if (!this.initialized) {
            (window as any).fbAsyncInit = () => {
                FB.init({
                    appId: environment.fbAppId,
                    cookie: true,
                    xfbml: true,
                    version: environment.fbApiVersion
                });
                FB.AppEvents.logPageView();
                this.initialized = true;
            };
        }
    }

    public login(): void {
        FB.login((response) => {
            if (response.authResponse) {
                if (response.status === 'connected') {
                    this.zone.run(() => {
                        this.userSubject.next(new FacebookUser(response.authResponse));
                    });
                } else {
                    console.error('Failed to sign in to Facebook: ', response);
                }
            } else {
                console.error('Failed to sign in to Facebook: ', response);
            }
        });
    }

    constructor(private service: FacebookGraphApiService, private readonly zone: NgZone) {
        this.userSubject
            .pipe(
                switchMap((user) => this.service.get<PictureResponse>(`/${user.id}/picture?redirect=false`, user)),
                map((response: PictureResponse) => new FacebookUserPicture(response)),
                tap(x => console.log('user:', x)))
            .subscribe(this.userPictureSubject);

        this.user = this.userSubject
            .asObservable();

        this.userPicture = this.userPictureSubject
            .asObservable();
    }
}
