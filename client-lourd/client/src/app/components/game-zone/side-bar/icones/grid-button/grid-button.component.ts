import { Component, Input } from '@angular/core';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-grid-button',
  templateUrl: './grid-button.component.html',
  styleUrls: ['./grid-button.component.scss'],
})
export class GridButtonComponent {

  faHashtag = faHashtag;

  @Input() innerWidth: number;

}
