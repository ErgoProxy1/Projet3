import { Component, OnDestroy, OnInit } from '@angular/core';
import { HintsComponent } from 'src/app/components/hints/hints.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/authService/auth.service';
import { CanvasControllerService } from 'src/app/services/canvasController/canvas-controller.service';
import { GameService } from 'src/app/services/gameService/game-service.service';
import { KeyboardService } from 'src/app/services/keyboard/keyboard.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-guesser',
  templateUrl: './guesser.component.html',
  styleUrls: ['./guesser.component.scss']
})
export class GuesserComponent implements OnInit, OnDestroy {

  correct = false;
  incorrect = false;
  hintsIndex: number = 0;

  disableReact = false;

  correctGuessSub: Subscription;
  incorrectGuessSub: Subscription;
  newWordsSub: Subscription;

  constructor(
    public gameMana: GameService,
    private _socket: SocketService,
    public auth: AuthService,
    public tutorial: TutorialService,
    private _canvas: CanvasControllerService,
    public keyboard: KeyboardService,
    private modal: NgbModal,
  ) { }

  showTutorialHint = false;

  ngOnInit(): void {
    this.correctGuessSub = this._socket.correctGuessObservable.subscribe(() => {
      this.correct = true;
      this.gameMana.hasGuessed = true;
      setTimeout(() => { this.correct = false; }, 2000);
      let correctSound = new Audio();
      correctSound.volume = 0.15;
      correctSound.src = 'assets/sounds/correct.mp3';
      correctSound.load();
      correctSound.play();
    });
    this.incorrectGuessSub = this._socket.incorrectGuessObservable.subscribe(() => {
      this.incorrect = true;
      setTimeout(() => { this.incorrect = false; }, 2000);
      let incorrectSound = new Audio();
      incorrectSound.volume = 0.15;
      incorrectSound.src = 'assets/sounds/incorrect.mp3';
      incorrectSound.load();
      incorrectSound.play();
    });
    this.newWordsSub = this._socket.drawingWordObservable.subscribe((data) => {
      this.hintsIndex = 0;
    })
  }

  sendAttempt(attempt: string) {
    if (attempt.length > 0 && this.gameMana.gameId.length > 0) {
      this._socket.emit('attemptWord', JSON.stringify({ gameId: this.gameMana.gameId, word: attempt }));
    }
    if (this.tutorial.curState === 8) {
      if (attempt.trim().toLowerCase() === 'pomme') {
        this.showTutorialHint = false;
        this._canvas.clearSVGElements();
        let claps = new Audio();
        claps.src = 'assets/sounds/applause.mp3';
        claps.volume = 0.25;
        claps.load();
        claps.play();
        this.tutorial.nextStep();
      } else {
        this.showTutorialHint = true
      }
    }
  }

  ngOnDestroy() {
    this.correctGuessSub.unsubscribe();
    this.incorrectGuessSub.unsubscribe();
    this.newWordsSub.unsubscribe();
  }

  displayHint() {
    if (this.gameMana.currentHints.length !== 0) {
      console.log(this.gameMana.currentHints);
      const modalRef = this.modal.open(HintsComponent, { backdrop: 'static', centered: true, keyboard: true })
      modalRef.componentInstance.hint = this.gameMana.currentHints[this.hintsIndex];
      if (this.hintsIndex < this.gameMana.currentHints.length) {
        this.hintsIndex++;
        modalRef.componentInstance.index = this.hintsIndex;
      }
      else {
        modalRef.componentInstance.maxIndexReached = true;
      }
      modalRef.result.then(() => { }).catch((e) => { console.log(e) });
    }
  }

  like() {
    this.disableReact = true;
    this._socket.emit('send-reaction', JSON.stringify({ gameId: this.gameMana.gameId, username: this.auth.username, reaction: 'like' }));
    setTimeout(() => {
      this.disableReact = false;
    }, 6000);
  }

  dislike() {
    this.disableReact = true;
    this._socket.emit('send-reaction', JSON.stringify({ gameId: this.gameMana.gameId, username: this.auth.username, reaction: 'dislike' }));
    setTimeout(() => {
      this.disableReact = false;
    }, 6000);
  }

}
