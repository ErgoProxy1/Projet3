// import { GameManagementService } from "../../services/game-management/game-management.service"
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { faArrowCircleLeft, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { SocketService } from '../../services/socket/socket.service';
import { AngularFirestore } from '@angular/fire/firestore'
import { AuthService } from "src/app/services/authService/auth.service";
import { RoutingConstants } from "src/app/services/utils/routingConstants";
import { Subscription } from "rxjs";
import { MessageHandlerService } from "src/app/services/messageHandler/message-handler.service";
import { MessageType, MIN_ERASER_SIZE, PENCIL_DEFAULT_STROKE_WIDTH, ToolType } from "src/app/services/utils/constantsAndEnums";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationModalComponent } from "../confirmation-modal/confirmation-modal.component";
import { GameService } from '../../services/gameService/game-service.service';
import { Bot, BOTS_LIST } from "src/app/services/utils/bots";
import { ToolsService } from "src/app/services/tools/tools.service";
import { CanvasControllerService } from "src/app/services/canvasController/canvas-controller.service";
import { ChatService } from "src/app/services/chatService/chat.service";
import { EraserTool } from "src/app/services/tools/eraserTool";
import { TutorialService } from "src/app/services/tutorial/tutorial.service";

export interface Game {
  gameId: number,
  isClassic: boolean,
  gotPower: boolean,
  difficulty: number,
  host: string,
  users: string[],
  password: string,
};

export class Player {
  name: string;
  avatar: string;
  points: number;
};

export interface VoteKick {
  gameId: number,
  user: string,
  votes: number,
  rejections: number
}

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit, OnDestroy {
  faCircleNotch = faCircleNotch;
  faArrowCircleLeft = faArrowCircleLeft;

  activeGame: Game;
  players: Player[] = [];
  team1: Player[] = [];
  team2: Player[] = [];
  previousTeam1: Player[] = [];
  previousTeam2: Player[] = [];
  teamsAreBalanced: boolean = true;
  gameExists: boolean = true;
  teamHasBot = [false, false];

  hasFinishedLoading = false;

  activeVoteKick: VoteKick = { gameId: -1, user: '', votes: -1, rejections: -1 };
  hasActiveVoteKick = false;
  hasVotedToKick = false;

  availableBots: Bot[] = [];
  curTeamSelectBot: number;

  getLobbyDataSub: Subscription;
  removeUsersSub: Subscription;
  getVoteKickSub: Subscription;
  endVoteKickSub: Subscription;
  startGameSub: Subscription;

  constructor(
    private _socket: SocketService,
    private _db: AngularFirestore,
    public auth: AuthService,
    public gameService: GameService,
    private _router: Router,
    private _messages: MessageHandlerService,
    private _modal: NgbModal,
    private _tools: ToolsService,
    private _canvasController: CanvasControllerService,
    private _chatService: ChatService,
    private _tutorial: TutorialService
  ) {
  }

  ngOnInit(): void {
    this.getLobbyDataSub = this._socket.getLobbyObservable.subscribe((lobby) => {
      const parsedData: any = JSON.parse(lobby);
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
            this.clearGameState();
            this._router.navigateByUrl(RoutingConstants.ROUTE_TO_MAIN_MENU);
          }
        }
      }
    });

    this.removeUsersSub = this._socket.removeAllPlayersObservable.subscribe((data) => {
      this.clearGameState();
      this._router.navigateByUrl(RoutingConstants.ROUTE_TO_MAIN_MENU);
      const parsedData = JSON.parse(data);
      this._messages.showMessage(parsedData.message, MessageType.Warning, 5000, true, true);
    });

    this.getVoteKickSub = this._socket.getVoteKickObservable.subscribe((voteKick: VoteKick) => {
      this.activeVoteKick = voteKick;
      this.hasActiveVoteKick = true;
    });

    this.endVoteKickSub = this._socket.endVoteKickObservable.subscribe(() => {
      console.log('ended vote kick');
      this.activeVoteKick = { gameId: -1, user: '', votes: -1, rejections: -1 }
      this.hasActiveVoteKick = false;
      this.hasVotedToKick = false;
    });

    this.startGameSub = this._socket.startGameObservable.subscribe(() => {
      this._router.navigateByUrl(RoutingConstants.ROUTE_TO_GAME_ZONE);
    });

    this._socket.emit("askTheGameData", this.gameService.gameId);
  }

  ngOnDestroy() {
    this.getLobbyDataSub.unsubscribe();
    this.removeUsersSub.unsubscribe();
    this.getVoteKickSub.unsubscribe();
    this.endVoteKickSub.unsubscribe();
    this.startGameSub.unsubscribe();
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
          this.team1 = [];
          this.team2 = [];
          for (let user of gameData.teams[0].users) {
            const targetPlayer = this.players.find(p => p.name === user)
            if (targetPlayer) {
              this.team1.push(targetPlayer);
            }
          }
          for (let user of gameData.teams[1].users) {
            const targetPlayer = this.players.find(p => p.name === user)
            if (targetPlayer) {
              this.team2.push(targetPlayer);
            }
          }
          this.teamsAreBalanced = this.team1.length === 2 && this.team2.length === 2;
          this.reloadBotsList();
        }

        this.hasFinishedLoading = true;
      }
    }).catch((error) => { error; })
  }

  sendToOtherTeam(username: string) {
    if (this.team1.map(p => p.name).includes(username)) {
      const index = this.team1.findIndex((playerToRemove: Player) => playerToRemove.name === username);
      this.team2.push(this.team1[index]);
      this.team1.splice(index, 1);
    }
    else if (this.team2.map(p => p.name).includes(username)) {
      const index = this.team2.findIndex((playerToRemove: Player) => playerToRemove.name === username);
      this.team1.push(this.team2[index]);
      this.team2.splice(index, 1);
    }
    else {
      console.log("erreur: le joueur n'appartient à aucune équipe !");
    }
    this.teamsAreBalanced = this.team1.length === 2 && this.team2.length === 2;
    this._socket.emit("sendNewLobbyTeams", JSON.stringify({ gameId: this.activeGame.gameId, team1: this.team1.map(p => p.name), team2: this.team2.map(p => p.name) }));
  }

  addBot(botName: string) {
    if(this.curTeamSelectBot !== undefined) this._socket.emit('add-bot', JSON.stringify({ gameId: this.activeGame.gameId, team: this.curTeamSelectBot, botName: botName }))
  }

  voteKick(player: string) {
    this.hasVotedToKick = true;
    this._socket.emit('vote-kick', JSON.stringify({ gameId: this.gameService.gameId, user: player, action: 'vote' }))
  }

  rejectKick(player: string) {
    this.hasVotedToKick = true;
    this._socket.emit('vote-kick', JSON.stringify({ gameId: this.gameService.gameId, user: player, action: 'reject' }))
  }

  kickPlayer(player: string) {
    this._socket.emit('kick-player', JSON.stringify({ gameId: this.gameService.gameId, user: player }))
  }

  startButton() {
    var teamsTable: string[][] = [];
    if (this.activeGame.isClassic) {
      // TODO: make teams for the classics

    } else {
      this.activeGame.users.forEach((user: string) => {
        const tempTable: string[] = [user];
        teamsTable.push(tempTable);
      });
    }
    this._socket.emit('loadGame', JSON.stringify({ gameId: this.gameService.gameId, teams: teamsTable }))
  }

  goToMainMenu() {
    this._socket.emit('leaveTheLobby', JSON.stringify({ gameId: this.gameService.gameId, user: this.auth.username }));
    const indexTeam1 = this.team1.findIndex((player: Player) => player.name === this.auth.username);
    const indexTeam2 = this.team2.findIndex((player: Player) => player.name === this.auth.username);
    if (indexTeam1 !== -1) {
      this.team1.splice(indexTeam1, 1);
    }
    else if (indexTeam2 !== -1) {
      this.team2.splice(indexTeam2, 1);
    }
    this.clearGameState();
    this._router.navigateByUrl(RoutingConstants.ROUTE_TO_MAIN_MENU);
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
      this._socket.emit('leaveTheLobby', JSON.stringify({ gameId: this.gameService.gameId, user: this.auth.username }));
      this.clearGameState();
      this._router.navigateByUrl(RoutingConstants.ROUTE_TO_PROFILE);
    }).catch(() => { });
  }

  getDifficulty(difficulty: number) {
    if (difficulty === 0) {
      return 'Facile'
    } else if (difficulty === 1) {
      return 'Normale'
    } else if (difficulty === 2) {
      return 'Difficile'
    } else {
      return 'NA'
    }
  }

  kickCeiling(num: number) {
    return Math.floor(num / 2) + 1;
  }

  reloadBotsList(){
    this.availableBots = [];
    for(let bot of BOTS_LIST){
      if(!this.team1.map(p=>p.name).includes(bot.name) && !this.team2.map(p=>p.name).includes(bot.name)){
        this.availableBots.push(bot);
      }
    }
  }

  clearGameState() {
    this.gameService.gameId = '';
    this._chatService.savedChannels = [];
    this._chatService.savedJoinedChannels = [];
    console.log('on clear', this._chatService.savedChannels)
    this._canvasController.clearSVGElements();
    this._canvasController.clearToolDate();
    this._tools.showGrid(false);
    this._tools.pencilWidth = PENCIL_DEFAULT_STROKE_WIDTH;
    (this._tools.TOOLS.get(ToolType.Eraser) as EraserTool).sizeOfSquare(MIN_ERASER_SIZE);
    if (this._tutorial.curState !== -1) this._tutorial.end();
  }

  hasValidPlayerCount(){
    if(this.activeGame){
      if(this.activeGame.isClassic){
        return this.teamHasBot[0] || this.teamHasBot[1];
      }
      return false;
    }
    return false;
  }

}
