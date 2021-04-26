import { Component, OnInit } from '@angular/core';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { AngularFirestore } from '@angular/fire/firestore'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-avatar-selection',
  templateUrl: './avatar-selection.component.html',
  styleUrls: ['./avatar-selection.component.scss']
})
export class AvatarSelectionComponent implements OnInit {

  hasLoaded = false;
  faCircleNotch = faCircleNotch;
  images: string[] = [];

  selectedSrc = '';

  constructor(
    private _db: AngularFirestore,
    private _activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    this._db.firestore.collection('avatar_preselect').get().then((result) => {
      if (result.docs.length > 0) {
        result.forEach((image) => {
          let src = image.data().src;
          this.images.push(src);
        });
        this.hasLoaded = true;
      }
    })
  }

  dismiss(){
    this._activeModal.dismiss();
  }

  close(){
    this._activeModal.close(this.selectedSrc);
  }

}
