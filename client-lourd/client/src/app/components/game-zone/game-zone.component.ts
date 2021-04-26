import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/authService/auth.service';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { GameService } from 'src/app/services/gameService/game-service.service';
import { KeyboardService } from 'src/app/services/keyboard/keyboard.service';
import { MessageHandlerService } from 'src/app/services/messageHandler/message-handler.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { MessageType, MIN_ERASER_SIZE, PENCIL_DEFAULT_STROKE_WIDTH, ToolType } from 'src/app/services/utils/constantsAndEnums';
import { PopupMessage } from 'src/app/services/utils/popupMessage';
import { RoutingConstants } from 'src/app/services/utils/routingConstants';
import { Game, Player, VoteKick } from '../lobby/lobby.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { EraserTool } from 'src/app/services/tools/eraserTool';
import { ToolsService } from 'src/app/services/tools/tools.service';
import { CanvasControllerService } from 'src/app/services/canvasController/canvas-controller.service';
import { ChatService } from 'src/app/services/chatService/chat.service';

@Component({
  selector: 'app-game-zone',
  templateUrl: './game-zone.component.html',
  styleUrls: ['./game-zone.component.scss']
})
export class GameZoneComponent implements AfterViewInit, OnDestroy, OnInit {

  constructor(private keyboardService: KeyboardService, private drawingService: DrawingService,
    private detector: ChangeDetectorRef,
    private messageHandlerService: MessageHandlerService,
    private _tutorial: TutorialService,
    private _socket: SocketService,
    public gameService: GameService,
    public auth: AuthService,
    private _router: Router,
    private _messages: MessageHandlerService,
    private _db: AngularFirestore,
    private _tools: ToolsService,
    private _canvasController: CanvasControllerService,
    private _chatService: ChatService
  ) {
    this.messageHandlerSubscription = this.messageHandlerService.getPopupMessageObservable().subscribe((message) => {
      this.messageToshow = message;
      this.showMessage();
    });
    this.drawingService.sendInitWorkspaceDimensions(this.workspaceDimensions);
    this.drawingService.sendWorkspaceDimensions(this.workspaceDimensions);
  }

  faCircleNotch = faCircleNotch;
  activeGame: Game;
  players: Player[] = [];
  gameId: string = "";
  gameExists: boolean = true;
  team1Users: string[] = [];
  team2Users: string[] = [];
  teamHasBot = [false, false];

  private messageToshow: PopupMessage;
  popupMessage = '';
  isMessageToShow = false;
  typeOfMessage = '';
  isDismissable = true;
  messageHandlerSubscription: Subscription;

  workspaceDimensions: number[] = [];

  activeVoteKick: VoteKick = { gameId: -1, user: '', votes: -1, rejections: -1 };
  hasActiveVoteKick = false;
  hasVotedToKick = false;

  gameHasEnd = false;

  getLobbyDataSub: Subscription;
  removeUsersSub: Subscription;
  getVoteKickSub: Subscription;
  endVoteKickSub: Subscription;
  popupSub: Subscription;
  startGameSub: Subscription;
  endGameSub: Subscription;

  @ViewChild('workspace') workspace: ElementRef;

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.keyboardService.onKeyDown(event);
  }

  @HostListener('document:keyup', ['$event']) onKeyupHandler(event: KeyboardEvent) {
    this.keyboardService.onKeyUp(event);
  }

  @HostListener('focusin', ['$event.target']) onfocusin(target: HTMLInputElement) {
    if (target.type === 'number' || target.type === 'text') {
      this.keyboardService.inputFocusedActive = true;
    } else if (target.type === 'submit' || !target.type) {
      this.keyboardService.inputFocusedActive = false;
    }
  }

  ngOnInit(): void {
    this.getLobbyDataSub = this._socket.getLobbyObservable.subscribe((lobby) => {
      const parsedData = JSON.parse(lobby) as any;
      this.activeGame = {
        host: parsedData.host,
        isClassic: parsedData.gameMode === 0,
        difficulty: parsedData.difficulty,
        gameId: parsedData.gameId,
        gotPower: parsedData.hasPowerUps,
        users: parsedData.users,
        password: parsedData.password ? parsedData.password : ""
      }
      this.teamHasBot = parsedData.teams.map((t:any) => t.hasBot);
      if (this.gameService.gameId.length === 0) {
        this.gameService.gameId = this.activeGame.gameId + '';
      }
      this.gameService.gameMode = parsedData.gameMode;
      this.gameService.users = parsedData.users;
      if (!lobby) {
        this.gameExists = false;
      } else {
        if (!this.activeGame.users.includes(this.activeGame.host)) {
          this._socket.emit('delete-game');
        } else {
          if (this.activeGame.users.includes(this.auth.username)) {
            this.getPlayerInfo(parsedData);
          } else {
            this._messages.showMessage('Vous avez été expulsé de la partie.', MessageType.Warning, 5000, true, true);
            this._socket.requestCloseModal();
            this.clearGameState();
            this._router.navigateByUrl(RoutingConstants.ROUTE_TO_MAIN_MENU);
          }
        }
      }
    });

    this.removeUsersSub = this._socket.removeAllPlayersObservable.subscribe((lobby) => {
      this.clearGameState();
      this._router.navigateByUrl(RoutingConstants.ROUTE_TO_MAIN_MENU);
      const parsedData = JSON.parse(lobby);
      this._messages.showMessage(parsedData.message, MessageType.Warning, 5000, true, true);
    });

    this.getVoteKickSub = this._socket.getVoteKickObservable.subscribe((voteKick: VoteKick) => {
      this.activeVoteKick = voteKick;
      this.hasActiveVoteKick = true;
    });

    this.endVoteKickSub = this._socket.endVoteKickObservable.subscribe(() => {
      this.activeVoteKick = { gameId: -1, user: '', votes: -1, rejections: -1 }
      this.hasActiveVoteKick = false;
      this.hasVotedToKick = false;
    });

    this.startGameSub = this._socket.startGameObservable.subscribe(() => {
      this._router.navigateByUrl(RoutingConstants.ROUTE_TO_GAME_ZONE);
    });

    this.endGameSub = this._socket.endGameObservable.subscribe((data: string) => {
      this.gameService.winnerUsers = JSON.parse(data) as string[];
      this.gameHasEnd = true;
    });

    this.popupSub = this._socket.popupObservable.subscribe((data) => {
      const parsedData = JSON.parse(data);
      this._messages.showMessage(parsedData, MessageType.Warning, 5000, true, true);

    })

    this._socket.emit("ask-active-game-data", this.gameService.gameId);
    this._socket.emit("ready-to-start", this.gameService.gameId)

  }

  ngOnDestroy() {
    this.getLobbyDataSub.unsubscribe();
    this.removeUsersSub.unsubscribe();
    this.getVoteKickSub.unsubscribe();
    this.endVoteKickSub.unsubscribe();
    this.messageHandlerSubscription.unsubscribe();
    this.startGameSub.unsubscribe();
    this.endGameSub.unsubscribe();
    this.popupSub.unsubscribe();
  }

  getPlayerInfo(gameData: any) {
    this.players = [];
    this._db.firestore.collection('users').where('username', 'in', this.activeGame.users).get().then((result) => {
      let host: Player = { name: '', avatar: '', points: 0 };
      if (result.docs.length > 0) {
        for (let doc of result.docs) {
          let curDocData = doc.data();
          if (curDocData.username !== this.activeGame.host) {
            if (!this.players.map(p => p.name).includes(curDocData.username)) {
              this.players.push({ name: curDocData.username, avatar: curDocData.avatar, points: 0 });
            }
          } else {
            host = { name: curDocData.username, avatar: curDocData.avatar, points: 0 }
          }
        }
        this.players = this.players.filter(user => user.name !== host.name);
        this.players.unshift(host);
        if (this.activeGame.isClassic) {
          this.team1Users = [];
          this.team2Users = [];
          for (let user of gameData.teams[0].users) {
            const targetPlayer = this.players.find(p => p.name === user)
            if (targetPlayer) {
              this.team1Users.push(targetPlayer.name);
            }
          }
          for (let user of gameData.teams[1].users) {
            const targetPlayer = this.players.find(p => p.name === user)
            if (targetPlayer) {
              this.team2Users.push(targetPlayer.name);
            }
          }
        }
        for(let player of this.players){
          let playerTeam = gameData.teams.find((t:any) => t.users.includes(player.name));
          if(playerTeam){
            player.points = playerTeam.points;
          }
        }
      }
    }).catch((error) => { error; })
  }

  voteKick(player: string) {
    this.hasVotedToKick = true;
    this._socket.emit('vote-kick-in-game', JSON.stringify({ gameId: this.gameService.gameId, user: player, action: 'vote' }))
  }

  rejectKick(player: string) {
    this.hasVotedToKick = true;
    this._socket.emit('vote-kick-in-game', JSON.stringify({ gameId: this.gameService.gameId, user: player, action: 'reject' }))
  }

  kickPlayer(player: string) {
    this._socket.emit('kick-player-in-game', JSON.stringify({ gameId: this.gameService.gameId, user: player }))
  }

  showMessage() {
    if (this.messageToshow && this.messageToshow.type) {
      this.typeOfMessage = this.messageToshow.type;
      this.popupMessage = this.messageToshow.message;
      this.isDismissable = this.messageToshow.dismissable;
      this.isMessageToShow = true;
      this.detector.detectChanges();
      if (this.messageToshow.durationInMS > 0) setTimeout(() => this.isMessageToShow = false, this.messageToshow.durationInMS);
    }
  }

  // Lit et envoie les dimensions de la zone de travail au component de nouveu dessin après l'init de la vue.
  // On retire 1 des valeurs parce que offset prend le padding et les marges externes en compte.
  ngAfterViewInit(): void {
    if (this.workspace) {
      this.workspaceDimensions[0] = this.workspace.nativeElement.offsetWidth - 50;
      this.workspaceDimensions[1] = (this.workspaceDimensions[0] / (800 / 600));
      this.drawingService.sendInitWorkspaceDimensions(this.workspaceDimensions);
      if (this._tutorial.curState === 0) {
        this.messageHandlerService.showMessage(this._tutorial.tutorialMessages[this._tutorial.curState], MessageType.Info, 0, false)
      }
      this.detector.detectChanges();
    }
  }

  // Lit et envoie les dimensions de la zone de travail au component de nouveu dessin.
  // On retire 1 des valeurs parce que offset prend le padding et les marges externes en compte.
  resendDimensions(): void {
    if (this.workspace) {
      this.workspaceDimensions[0] = this.workspace.nativeElement.offsetWidth - 50;
      this.workspaceDimensions[1] = (this.workspaceDimensions[0] / (800 / 600));
      this.drawingService.sendWorkspaceDimensions(this.workspaceDimensions);
    }
  }

  kickCeiling(num: number) {
    return Math.floor(num / 2) + 1;
  }

  clearGameState() {
    this.gameService.gameId = '';
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
