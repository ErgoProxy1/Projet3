import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CanvasControllerService } from 'src/app/services/canvasController/canvas-controller.service';
import { Color } from 'src/app/services/utils/color';

@Component({
  selector: 'app-upload-image-pair-modal',
  templateUrl: './upload-image-pair-modal.component.html',
  styleUrls: ['./upload-image-pair-modal.component.scss']
})
export class UploadImagePairModalComponent implements OnInit {
  showAdvanced = false;
  optCurve = true;
  defineThreshold = false;
  threshold = 0;
  defineTurdSize = false;
  turdSize = 2.0;

  hasImage = false;
  image: File;

  constructor(private _modal: NgbActiveModal, private _canvas: CanvasControllerService) { }

  ngOnInit(): void {
  }

  close(){
    let params: any = {};
    if(this.showAdvanced){
      if(!this.optCurve){
        params.optCurve = false;
      }
      if(this.defineThreshold){
        if(this.threshold < 0) this.threshold = 0
        if(this.threshold > 255) this.threshold = 255;
        params.threshold = this.threshold;
      }
      if(this.defineTurdSize){
        if(this.turdSize < 0.1) this.threshold = 0.1
        if(this.turdSize > 100) this.threshold = 100;
        params.turdSize = this.turdSize;
      }
    }
    this._canvas.clearSVGElements();
    this._canvas.changeBackgroundColor(Color.copyColor(Color.WHITE));
    this._modal.close({file: this.image, params: params});
  }

  uploadFile(files: FileList){
    if(files.length > 0){
      if(files[0]){
        if(['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'].includes(files[0].type)){
          this.image = files[0];
        }
      }
    }
  }

  dismiss(){
    this._modal.dismiss();
  }

}
