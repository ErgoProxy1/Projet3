import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { KeyboardService } from 'src/app/services/keyboard/keyboard.service';
import { UploadImagePairModalComponent } from '../upload-image-pair-modal/upload-image-pair-modal.component';

@Component({
  selector: 'app-upload-image-for-pair',
  templateUrl: './upload-image-for-pair.component.html',
  styleUrls: ['./upload-image-for-pair.component.scss']
})
export class UploadImageForPairComponent implements OnInit, OnDestroy {

  @Input() innerWidth: number;
  @Input() click: Observable<void>;

  clickSubscription: Subscription;

  constructor(private _drawing: DrawingService, private _modal: NgbModal, private _keyboard: KeyboardService) { }

  ngOnInit(): void {
    this.clickSubscription = this.click.subscribe(() => {
      const modal = this._modal.open(UploadImagePairModalComponent, { backdrop: 'static', centered: true, keyboard: false, size: 'md' });
      this._keyboard.modalWindowActive = true;
      modal.result.then((data: any) => {
        this._keyboard.modalWindowActive = false;
        this.uploadFile(data);
      }).catch(() => {
        this._keyboard.modalWindowActive = false;
      })
    })
  }

  ngOnDestroy(){
    this.clickSubscription.unsubscribe();
  }

  uploadFile(data: any){
    this._drawing.sendFileUploadData(data);
  }

}
