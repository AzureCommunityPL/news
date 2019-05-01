import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable()
export class SpinnerService {
    constructor(private ngxSpinner: NgxSpinnerService) {
    }

    public show(name?: string) {
        if (!name) { name = 'main'; }

        this.ngxSpinner.show(name);
    }

    public hide(name?: string) {
        if (!name) { name = 'main'; }

        this.ngxSpinner.hide(name);
    }
}
