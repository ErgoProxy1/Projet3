import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AvatarUpload } from 'src/app/components/user-profile/user-profile.component';
import { AuthService } from 'src/app/services/authService/auth.service';
import { CanvasControllerService } from 'src/app/services/canvasController/canvas-controller.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore'
import { ConfirmationModalComponent } from 'src/app/components/confirmation-modal/confirmation-modal.component';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-avatar-convert',
  templateUrl: './avatar-convert.component.html',
  styleUrls: ['./avatar-convert.component.scss']
})
export class AvatarConvertComponent implements OnInit, OnDestroy {

  private canvasElement: HTMLCanvasElement; // Assigner au nativeElement du canvasSim
  exportError = false;
  includeGrid = false;
  allowTogglePress = true;
  url = '';
  exportInfo = { name: '', dimensions: [800, 600], uri: '' };
  isUploading = false;

  @ViewChild('canvasSim', { static: true }) canvasSim: ElementRef;

  @Input() innerWidth: number;
  @Input() click: Observable<void>;

  private clickSubscription: Subscription;

  constructor(
    private modalService: NgbModal,
    private controller: CanvasControllerService,
    private _auth: AuthService,
    private _storage: AngularFireStorage,
    private _db: AngularFirestore
  ) {
    this.controller.getHTMLPrimitivesStringObservable().subscribe((data) => {
      this.exportInfo.uri = data;
      this.export();
    });
  }

  ngOnInit(){
    this.clickSubscription = this.click.subscribe(() => {
      this.confirm();
    })
  }

  ngOnDestroy(){
    this.clickSubscription.unsubscribe();
  }

  confirm(){
    const modalRef = this.modalService.open(ConfirmationModalComponent, { backdrop: 'static', centered: true, keyboard: false })
    modalRef.componentInstance.message = "Cette action changera votre avatar aux contenus du canvas";
    modalRef.result.then(() => {
      this.controller.getHTMLOfPrimitives();
    }).catch(() => { });
  }

  async export(): Promise<void> {
    this.exportInfo.name = this._auth.uid;
    if (this.exportInfo.name.length > 0) {
      let file = await this.convertXMLToExportType();
      this.saveImage(file);
    } else {
      this.exportError = true;
    }
  }

  private async convertXMLToExportType(): Promise<File> {
    return new Promise((resolve) => {
      this.canvasElement = (this.canvasSim.nativeElement as HTMLCanvasElement);
      const context = (this.canvasElement.getContext('2d') as CanvasRenderingContext2D);
      const img = new Image();
      img.src = this.exportInfo.uri;
      this.loadImage(img).then(() => {
        context.drawImage(img, 0, 0, this.exportInfo.dimensions[0], this.exportInfo.dimensions[1]);
        context.canvas.toBlob((blob) => {
          if (blob) {
            let file = new File([blob], this._auth.uid, { type: 'image/png' });
            resolve(file)
          }
        })
      });
    });
  }

  private async loadImage(image: HTMLImageElement): Promise<void> {
    return new Promise((resolve) => {
      image.onload = () => resolve();
    });
  }

  saveImage(file: File) {
    this.pushFileToStorage(new AvatarUpload(`${this._auth.uid}`, file))
  }

  pushFileToStorage(fileUpload: AvatarUpload) {
    this.isUploading = true;
    const filePath = `avatars/${this._auth.uid}`;
    const storageRef = this._storage.ref(filePath);
    const uploadTask = this._storage.upload(filePath, fileUpload.file);

    uploadTask.snapshotChanges().toPromise().then(() => {
      storageRef.getDownloadURL().subscribe(downloadURL => {
        this.isUploading = false;
        this._auth.avatarSrc = downloadURL;
        this._db.collection('users').doc(this._auth.uid).update({ avatar: downloadURL });
      });
    }).catch((e) => { this.isUploading = false; })
  }

}
