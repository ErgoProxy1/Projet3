import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/authService/auth.service';
import { MessageHandlerService } from 'src/app/services/messageHandler/message-handler.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { PopupMessage } from 'src/app/services/utils/popupMessage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  readonly TITLE: string = 'PolyDessin';

  private messageToshow: PopupMessage;
  popupMessage = '';
  isMessageToShow = false;
  typeOfMessage = '';
  isDismissable = true;

  userActivity: any;
  userInactive: Subject<any> = new Subject();
  sendMovement = false;

  messageSub: Subscription;

  constructor(
    private _messages: MessageHandlerService,
    private _detector: ChangeDetectorRef,
    private _socket: SocketService,
    private _auth: AuthService
  ) {
    this.setTimeout();
    this.userInactive.subscribe(() => {
      if (this._auth.username.length > 0) {
        this._socket.emit('is-inactive', this._auth.username);
        this.sendMovement = true;
      }
    });
  }

  ngOnInit() {
    this.messageSub = this._messages.getBodyPopupMessageObservable().subscribe((message) => {
      this.messageToshow = message;
      this.showMessage();
    });
  }

  ngOnDestroy(){
    this.messageSub.unsubscribe();
  }

  showMessage() {
    if (this.messageToshow && this.messageToshow.type) {
      this.typeOfMessage = this.messageToshow.type;
      this.popupMessage = this.messageToshow.message;
      this.isDismissable = this.messageToshow.dismissable;
      this.isMessageToShow = true;
      this._detector.detectChanges();
      if (this.messageToshow.durationInMS > 0) setTimeout(() => this.isMessageToShow = false, this.messageToshow.durationInMS);
    }
  }

  setTimeout() {
    this.userActivity = setTimeout(() => this.userInactive.next(undefined), 90000);
  }

  @HostListener('window:mousemove') refreshUserState() {
    clearTimeout(this.userActivity);
    this.setTimeout();
    if (this.sendMovement) {
      this.sendMovement = false;
      if (this._auth.username.length > 0) {
        this._socket.emit('not-inactive', this._auth.username)
      }
    }
  }
}
