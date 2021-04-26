import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MESSAGE_TYPE_MAP, MessageType } from '../utils/constantsAndEnums';
import { PopupMessage } from '../utils/popupMessage';

@Injectable({
  providedIn: 'root',
})

export class MessageHandlerService {
  private readonly POPUP_MESSAGE_SUBJECT: Subject<PopupMessage>;
  private readonly BODY_POPUP_MESSAGE_SUBJECT: Subject<PopupMessage>;

  constructor() {
    this.POPUP_MESSAGE_SUBJECT = new Subject<PopupMessage>();
    this.BODY_POPUP_MESSAGE_SUBJECT = new Subject<PopupMessage>();
  }

  getPopupMessageObservable(): Observable<PopupMessage> {
    return this.POPUP_MESSAGE_SUBJECT.asObservable();
  }

  getBodyPopupMessageObservable(): Observable<PopupMessage> {
    return this.BODY_POPUP_MESSAGE_SUBJECT.asObservable();
  }

  showMessage(message: string, messageType: MessageType, durationInMS: number, dismissable?: boolean, containerBody?: boolean ) {
    let isDismissable = dismissable !== undefined ? dismissable : true;
    let isContainerBody = containerBody !== undefined ? containerBody : false;
    const messageToShow: PopupMessage = {
      message: message,
      type: MESSAGE_TYPE_MAP.get(messageType),
      durationInMS: durationInMS,
      dismissable: isDismissable
    };
    isContainerBody ? this.BODY_POPUP_MESSAGE_SUBJECT.next(messageToShow) : this.POPUP_MESSAGE_SUBJECT.next(messageToShow);
  }
}
