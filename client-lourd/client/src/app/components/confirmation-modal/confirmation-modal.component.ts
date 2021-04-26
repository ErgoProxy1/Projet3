import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket/socket.service';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit, OnDestroy {

  @Input() title?: string = 'Confirmation';
  @Input() message?: string = '';
  @Input() question?: string = 'Êtes-vous certain de vouloir continuer?';
  @Input() confirmationText: string = 'Confirmer';
  @Input() dismissText: string = 'Annuler';

  requestCloseSub: Subscription;
  closeModalSub: Subscription;

  constructor(private _activeModal: NgbActiveModal, private _socket: SocketService) { }

  ngOnInit(): void {
    this.closeModalSub = this._socket.removeAllPlayersObservable.subscribe(() => {
      this.dismiss();
    })

    this.requestCloseSub = this._socket.closeModalsOnSocketEventObservable.subscribe(() => {
      this.dismiss();
    })
  }

  ngOnDestroy() {
    this.requestCloseSub.unsubscribe();
    this.closeModalSub.unsubscribe();
  }

  close(){
    this._activeModal.close();
  }

  dismiss(){
    this._activeModal.dismiss();
  }

}
