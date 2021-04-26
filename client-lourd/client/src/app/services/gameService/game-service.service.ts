import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { WordSuggestionComponent } from 'src/app/components/word-suggestion/word-suggestion.component';
import { AuthService } from '../authService/auth.service';
import { SocketService } from '../socket/socket.service';
import { RoutingConstants } from '../utils/routingConstants';

const NUMBER_OF_SUGGESTIONS = 3

export class Pair {
  public word:string;
  public hints:string[];
}

export interface Team {
  users: string[];
  points: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  isCreatingWordPair = false;
  isCreatingAvatar = false;
  gameId: string = '';
  curWord: string = '';
  curDrawer: string = '';
  curRound: string = '1';
  curTeam:Team;
  wordSuggestions: string[] = [];
  currentHints:string[] = [];
  waitingOnAnotherUser:boolean = false;
  isPickingWord:boolean = false;
  belongsToTeamPlaying:boolean = false;
  isInRelaunch:boolean = false;
  belongsToRelaunchingTeam:boolean = false;
  gameMode: number = -1;
  users: string[] = [];
  winnerTeam: Team[] = [];
  winnerUsers: string[] = [];
  hasGuessed = false;
  allLoaded = false;


  clearGameCanvasObservable: Observable<void>;
  private _clearGameCanvasSubject = new Subject<void>();

  clearToolObservable: Observable<void>;
  private _clearToolSubject = new Subject<void>();

  selectPencilObservable: Observable<void>;
  private _selectPencilSubject = new Subject<void>();

  static instance: GameService
  constructor(
    private _socket: SocketService,
    private _auth: AuthService,
    private _router: Router,
    private _modal: NgbModal,
  ) {
    GameService.instance = this;
    this.clearGameCanvasObservable = this._clearGameCanvasSubject.asObservable();
    this.clearToolObservable = this._clearToolSubject.asObservable();
    this.selectPencilObservable = this._selectPencilSubject.asObservable();

    this._socket.wordSuggestionsObservable.subscribe((data) => {
      this.allLoaded = true;
      this.isInRelaunch = false;
      this.belongsToRelaunchingTeam = false;
      const parsedData = JSON.parse(data) as {pairs:Pair[],user:string};
      this.curDrawer = parsedData.user;
      this._clearToolSubject.next();
      if(parsedData && parsedData.user === this._auth.username) {
        this.isPickingWord = true;
        this.waitingOnAnotherUser = false;
        for(let i=0;i<NUMBER_OF_SUGGESTIONS;i++) {
          this.wordSuggestions[i] = parsedData.pairs[i].word;
        }
        const modalRef = this._modal.open(WordSuggestionComponent, { backdrop: 'static', centered: true, keyboard: false })
        modalRef.componentInstance.wordSuggestions = this.wordSuggestions;
        modalRef.result
        .then((result)=> {
          this.curWord = result.word;
          this.currentHints = parsedData.pairs[result.index].hints;
          this._socket.emit("chooseWord",JSON.stringify({gameId:this.gameId,word:this.curWord,hints:this.currentHints}));
        }).catch((e) => {console.log(e)});
      }
      else {
        this.waitingOnAnotherUser = true;
        this.isPickingWord = false;
      }
    })

    this._socket.nextPlayerObservable.subscribe((data: string) => {
      this.allLoaded = true;
      const parsedData = JSON.parse(data);
      this.curDrawer = parsedData.userPlaying;
      this.curTeam = parsedData.teamPlaying;
      this.gameMode = this.curTeam.users.length > 1 ? 0 : 1; 
      this.belongsToTeamPlaying = this.curTeam.users.includes(this._auth.username);
      this._clearGameCanvasSubject.next();
      this.waitingOnAnotherUser = false;
      this.isPickingWord = false;
      this.hasGuessed = false;
      if (this._auth.username !== parsedData.userPlaying) {
        this.curWord = '';
        this._clearToolSubject.next();
        this._router.navigateByUrl(RoutingConstants.ROUTE_TO_GAME_ZONE);
      } else {
        this._selectPencilSubject.next();
        this._router.navigateByUrl(RoutingConstants.ROUTE_TO_GAME_ZONE + '/' + RoutingConstants.ROUTE_TO_PENCIL);
      }
    });
    this._socket.nextRoundObservable.subscribe((data: string) => {
      this.curRound = data;
    });
    this._socket.drawingWordObservable.subscribe((data) => {
      const parsedData = JSON.parse(data) as {word:string,hints:string[],userPlaying:string};
      if(parsedData.userPlaying === this._auth.username) {
        this.curWord = parsedData.word;
      }
      this.currentHints = parsedData.hints;
    });

    this._socket.relaunchObservable.subscribe((data:string) => {
      if(data) {
        const parsedData = JSON.parse(data);
        this.isInRelaunch = true;
        this.belongsToRelaunchingTeam = parsedData.users.includes(this._auth.username);
      }
      else {
        this.isInRelaunch = false;
        this.belongsToRelaunchingTeam = false;
      }
    })
  }
}
