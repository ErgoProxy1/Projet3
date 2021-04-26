import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket/socket.service';

@Component({
  selector: 'app-hints',
  templateUrl: './hints.component.html',
  styleUrls: ['./hints.component.scss']
})
export class HintsComponent implements OnInit, OnDestroy {
  index:number=0;
  hint:string="";
  maxIndexReached:boolean = false;

  requestCloseSub: Subscription;
  closeModalSub: Subscription;

  constructor(private activeModa:NgbActiveModal, private _socket: SocketService) { }

  ngOnInit(): void {
    this.closeModalSub = this._socket.removeAllPlayersObservable.subscribe(() => {
      this.close();
    })

    this.requestCloseSub = this._socket.closeModalsOnSocketEventObservable.subscribe(() => {
      this.close();
    })
  }

  ngOnDestroy() {
    this.requestCloseSub.unsubscribe();
    this.closeModalSub.unsubscribe();
  }

  close() {
    this.activeModa.close();
  }

}
