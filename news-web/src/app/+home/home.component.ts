import { Component,  OnInit } from '@angular/core';
import { SasApiService } from '../_shared/sas';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private service: SasApiService) {}

  public ngOnInit(): void {
    this.service.getSasToken().subscribe(x => console.log('sas response:', x));
  }
}
