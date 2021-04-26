import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket/socket.service';
import { ChatChannel } from '../game-zone/right-aside/chat/chat.component';

@Component({
  selector: 'app-channel-creation-modal',
  templateUrl: './channel-creation-modal.component.html',
  styleUrls: ['./channel-creation-modal.component.scss']
})
export class ChannelCreationModalComponent implements OnInit, OnDestroy {

  channelName: string = "";
  errorMessage: string = "";

  @Input() channels: ChatChannel[];

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
    this.closeModalSub.unsubscribe();
    this.requestCloseSub.unsubscribe();
  }

  close() {
    if (this.channelName !== '' && this.channelName.trim() === this.channelName
      && this.channelName.trim() !== 'Global' && this.channelName.trim() !== 'Tous'
      && !this.channels.map(c => c.name).includes(this.channelName)) {
      this._activeModal.close(this.channelName);
    } else if (this.channelName === '') {
      this.errorMessage = "Veuillez saisir un nom pour votre nouveau canal.";
    } else if (this.channelName.trim() != this.channelName) {
      this.errorMessage = "Le nom de canal ne peut pas commencer ou se terminer par un espace.";
    } else if (this.channelName.trim() === 'Global') {
      this.errorMessage = "Le canal ne peut pas s\'appeler Global.";
    } else if (this.channelName.trim() === 'Tous') {
      this.errorMessage = "Le canal ne peut pas s\'appeler Tous.";
    } else if (this.channels.map(c => c.name).includes(this.channelName.trim())) {
      this.errorMessage = "Ce nom de canal est déjà pris.";
    }
  }

  dismiss() {
    this._activeModal.dismiss();
  }

}
