import { Injectable } from '@angular/core';
import { ToastrService as NgxToastr } from 'ngx-toastr';

@Injectable()
export class ToastrService {
    constructor(private toastr: NgxToastr) {
    }

    public error(message?: string, title?: string): void {
        setTimeout(() => this.toastr.error(message, title));
    }

    public info(message?: string, title?: string): void {
        setTimeout(() => this.toastr.info(message, title));
    }

    public success(message?: string, title?: string): void {
        setTimeout(() => this.toastr.success(message, title));
    }

    public warning(message?: string, title?: string): void {
        setTimeout(() => this.toastr.warning(message, title));
    }
}
