import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/authService/auth.service';
import { CanvasControllerService } from 'src/app/services/canvasController/canvas-controller.service';
import { ChatService } from 'src/app/services/chatService/chat.service';
import { GameService } from 'src/app/services/gameService/game-service.service';
import { KeyboardService } from 'src/app/services/keyboard/keyboard.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { EraserTool } from 'src/app/services/tools/eraserTool';
import { ToolsService } from 'src/app/services/tools/tools.service';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { MIN_ERASER_SIZE, PENCIL_DEFAULT_STROKE_WIDTH, ToolType } from 'src/app/services/utils/constantsAndEnums';
import { RoutingConstants } from 'src/app/services/utils/routingConstants';
import { ConfirmationModalComponent } from '../../confirmation-modal/confirmation-modal.component';

const BASE_TURN_DURATION = 60;

@Component({
  selector: 'app-horizontal-menu',
  templateUrl: './horizontal-menu.component.html',
  styleUrls: ['./horizontal-menu.component.scss'],
})

export class HorizontalMenuComponent implements OnInit, OnDestroy{

  profileRoute = `/${RoutingConstants.ROUTE_TO_PROFILE}`;

  faArrowCircleLeft = faArrowCircleLeft

  public secondsRemaining:number = BASE_TURN_DURATION;
  private clockSubscription: Subscription;
  private endClockSub: Subscription;
  private soundIsPlaying:boolean = false;
  private clockAudio:HTMLAudioElement;
  private timerOverAudio:HTMLAudioElement;

  constructor(
    private keyboardService: KeyboardService,
    public auth: AuthService,
    private _modal: NgbModal,
    private _socket: SocketService,
    private _router: Router,
    private _canvasController: CanvasControllerService,
    private _tutorial: TutorialService,
    private _tools: ToolsService,
    public game: GameService,
    private _chatService: ChatService
    
  ) {
    
  }

  ngOnInit() {
    this.setupSocket();
    this.clockAudio = new Audio();
    this.timerOverAudio = new Audio();
    this.clockAudio.volume = 0.15;
    this.clockAudio.src = "assets/sounds/clock.mp3";
    this.timerOverAudio.volume = 0.15;
    this.timerOverAudio.src = "assets/sounds/timer_over.mp3";
  }

  setupSocket() {
    this.clockSubscription = this._socket.newClockTimeObservable.subscribe((data:string) => {
      if(data) {
        this.secondsRemaining = JSON.parse(data) as number;
        if(this.secondsRemaining===10 && !this.soundIsPlaying) {
          this.soundIsPlaying = true;
          this.clockAudio.load();
          this.clockAudio.play();
          this.soundIsPlaying = false;
        }
        if(this.secondsRemaining===0 && !this.soundIsPlaying) {
          this.soundIsPlaying = true;
          this.timerOverAudio.load();
          this.timerOverAudio.play();
          setTimeout(() => {
            this.timerOverAudio.pause();
            this.timerOverAudio.currentTime = 0;
            this.soundIsPlaying = false;
          }, 1500)
        }
      }
    })  

    this.endClockSub = this._socket.relaunchObservable.subscribe((data:any) => {
      this.clockAudio.pause();
      this.clockAudio.currentTime = 0;
      this.soundIsPlaying = false;
    })
  }

  ngOnDestroy() {
    this.clockSubscription.unsubscribe();
    this.endClockSub.unsubscribe();
    this.clockAudio.pause();
    this.clockAudio.currentTime = 0;
    this.soundIsPlaying = false;
  }

  resetKeyboardService(): void {
    this.keyboardService.inputFocusedActive = false;
    this.keyboardService.textToolActive = false;
  }

  disconnectUser() {
    const modalRef = this._modal.open(ConfirmationModalComponent, { backdrop: 'static', centered: true, keyboard: false })
    modalRef.componentInstance.message = "Cette action vous déconnectera de l'application et vous enverra au menu de connexion";
    modalRef.result.then(() => {
      this._socket.emit('manual-disconnect');
      this.auth.username = '';
      this.clearGameState();
      this._router.navigateByUrl(RoutingConstants.ROUTE_TO_LOGIN);
    }).catch(() => { });
  }

  goToProfile() {
    const modalRef = this._modal.open(ConfirmationModalComponent, { backdrop: 'static', centered: true, keyboard: false })
    modalRef.componentInstance.message = "Cette action vous enverra vers votre profile";
    modalRef.result.then(() => {
      if(this.game.gameId.length > 0) this._socket.emit('leaveTheGame', JSON.stringify({ gameId: this.game.gameId, user: this.auth.username }))
      this.clearGameState();
      this._router.navigateByUrl(RoutingConstants.ROUTE_TO_PROFILE);
    }).catch(() => { });
  }

  goToMenu() {
    const modalRef = this._modal.open(ConfirmationModalComponent, { backdrop: 'static', centered: true, keyboard: false })
    modalRef.componentInstance.message = "Cette action vous enverra vers le menu principal";
    modalRef.result.then(() => {
      if(this.game.gameId.length > 0) this._socket.emit('leaveTheGame', JSON.stringify({ gameId: this.game.gameId, user: this.auth.username }))
      this.clearGameState();
      this._router.navigateByUrl(RoutingConstants.ROUTE_TO_MAIN_MENU);
    }).catch(() => { });
  }

  clearGameState() {
    this.game.gameId = '';
    this._chatService.savedChannels = [];
    this._chatService.savedJoinedChannels = [];
    this._canvasController.clearSVGElements();
    this._canvasController.clearToolDate();
    this._tools.showGrid(false);
    this._tools.pencilWidth = PENCIL_DEFAULT_STROKE_WIDTH;
    (this._tools.TOOLS.get(ToolType.Eraser) as EraserTool).sizeOfSquare(MIN_ERASER_SIZE);
    if (this._tutorial.curState !== -1) this._tutorial.end();
  }

  

}
