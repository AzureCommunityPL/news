import { Component, Input, OnInit } from '@angular/core';
import { FacebookService } from '../_shared/facebook';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
    @Input() public title: string;

    constructor(public service: FacebookService) {
    }

    public ngOnInit(): void {
        this.service.initialize();
    }

    public login(): void {
        this.service.login();
    }
}
