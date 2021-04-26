import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CanvasControllerService } from 'src/app/services/canvasController/canvas-controller.service';

@Component({
  selector: 'app-undo',
  templateUrl: './undo.component.html',
  styleUrls: ['./undo.component.scss'],
})
export class UndoComponent implements OnInit, OnDestroy {

  @Input() innerWidth: number;
  @Input() click: Observable<void>;

  private clickSubscription: Subscription;

  constructor(public controller: CanvasControllerService) {

  }

  ngOnInit(){
    this.clickSubscription = this.click.subscribe(() => {
      this.onClick();
    })
  }

  ngOnDestroy(){
    this.clickSubscription.unsubscribe();
  }

  onClick(): void {
    this.controller.undo();
  }
}
