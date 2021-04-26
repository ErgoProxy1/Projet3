import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket/socket.service';
import { ChatChannel } from '../game-zone/right-aside/chat/chat.component';

@Component({
  selector: 'app-channel-modal',
  templateUrl: './channel-modal.component.html',
  styleUrls: ['./channel-modal.component.scss']
})
export class ChannelModalComponent implements OnInit, OnDestroy {

  errorMessage: string = "";
  channelsToJoin: string[] = [];

  @Input() channels: ChatChannel[];
  @Input() joined: string[];
  channelsToShow: ChatChannel[] = [];

  requestCloseSub: Subscription;
  closeModalSub: Subscription;

  constructor(private _activeModal: NgbActiveModal, private _socket: SocketService) { }

  ngOnInit(): void {
    this.channelsToShow = this.channels.filter(c => c.name !== 'Tous' && c.name !== 'Global' && !this.joined.includes(c.name))

    this.closeModalSub = this._socket.removeAllPlayersObservable.subscribe(() => {
      this.dismiss();
    })

    this.requestCloseSub = this._socket.closeModalsOnSocketEventObservable.subscribe(() => {
      this.dismiss();
    })
  }

  ngOnDestroy(){
    this.closeModalSub.unsubscribe();
    this.requestCloseSub.unsubscribe();
  }

  close() {
    this._activeModal.close(this.channelsToJoin);
  }

  dismiss() {
    this._activeModal.dismiss();
  }

  updateChannelsToJoin(isChecked: boolean, name: string) {
    if (isChecked) {
      this.channelsToJoin.push(name)
    } else {
      this.channelsToJoin = this.channelsToJoin.filter(c => c !== name);
    }
  }

}
