import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, interval } from 'rxjs';
import { SocketService } from 'src/app/services/socket/socket.service';

const BASE_CLOCK_DURATION = 10;

@Component({
  selector: 'app-word-suggestion',
  templateUrl: './word-suggestion.component.html',
  styleUrls: ['./word-suggestion.component.scss']
})


export class WordSuggestionComponent implements OnInit, OnDestroy {

  wordSuggestions:string[]=[];
  selectedWord:string = "";
  selectionIndex:number = 0;
  clock:number;
  clockIsSuspended:boolean;
  clockSubscription: Subscription;

  closeModalSub: Subscription;
  requestCloseSub: Subscription;

  constructor(private _activeModal: NgbActiveModal, private _socket: SocketService) {}

  ngOnInit(): void {
    this.clock = BASE_CLOCK_DURATION;
    this.clockIsSuspended = false;
    this.clockSubscription = interval(1000).subscribe(() => {
      if(!this.clockIsSuspended && this.clock > 0) {
        this.clock--;
      }
      else if(!this.clockIsSuspended && this.clock<=0) {
        this.clockIsSuspended = true;
        const randomIndex = Math.floor(Math.random() * this.wordSuggestions.length);
        const randomWord = this.wordSuggestions[randomIndex];
        this._activeModal.close({word:randomWord,index:randomIndex});
      }
    })

    this.closeModalSub = this._socket.removeAllPlayersObservable.subscribe(() => {
      this.close();
    })

    this.requestCloseSub = this._socket.closeModalsOnSocketEventObservable.subscribe(() => {
      this.close();
    })
  }

  ngOnDestroy() {
    this.clockSubscription.unsubscribe();
    this.closeModalSub.unsubscribe();
    this.requestCloseSub.unsubscribe();
  }

  chooseWord() {
    this.selectedWord = this.wordSuggestions[this.selectionIndex];
  }

  close() {
    if(this.selectedWord !== "") {
      this.clockIsSuspended = true;
      this._activeModal.close({word:this.selectedWord,index:this.selectionIndex});
    }
  }

}
