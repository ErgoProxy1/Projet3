import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket/socket.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
import { RoutingConstants } from 'src/app/services/utils/routingConstants';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GameService } from '../../services/gameService/game-service.service';
import { Friend } from '../social-menu/social-menu.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

export interface NewGame {
  gameId: number,
  isClassic: boolean,
  gotPower: boolean,
  difficulty: number,
  host: string,
  users: string[],
  password: string
};

export const ERR_JOINING_LOBBY = "La salle d'attente que vous tenter de joindre n'existe plus.";
export const ERR_PASSWORD = "Le mot de passe est incorrecte."

@Component({
  selector: 'app-lobby-selection',
  templateUrl: './lobby-selection.component.html',
  styleUrls: ['./lobby-selection.component.scss']
})
export class LobbySelectionComponent implements OnInit, OnDestroy {

  faCircleNotch = faCircleNotch;

  listLobby: NewGame[] = [];
  filteredLobbies: NewGame[] = [];
  curGameId = '';
  curPassword = '';
  errorMessage = '';

  showPassword = false;

  friends: Friend[] = [];

  curDifficulty = '-1';
  curMode: 'all' | 'classic' | 'freeForAll' = 'all';
  hostName = '';

  extraOptions = {hasPowers: false, hasSpace: false, isPublic: false, friendsOnly:false}

  hasLoaded = false;

  socketJoinObservable: Subscription;
  socketListObservable: Subscription;

  constructor(
    public auth: AuthService,
    public gameService: GameService,
    private _socket: SocketService,
    private _router: Router,
    private _modal: NgbModal,
    private _db: AngularFirestore,
  ) { }

  ngOnInit() {
    this.socketListObservable = this._socket.lobbyListObservable.subscribe((lobbyList: string) => {
      const parsedList = JSON.parse(lobbyList);
      this.listLobby.length = 0
      for(let i=0;i<parsedList.length;i++) {
        this.listLobby.push({gameId:parsedList[i].gameId, 
                            isClassic:parsedList[i].gameMode===0,
                            gotPower:parsedList[i].hasPower,
                            difficulty:parsedList[i].difficulty,
                            host:parsedList[i].host, 
                            users:parsedList[i].users, 
                            password : parsedList[i].password ? parsedList[i].password : "",
                          })
      }
      this.filteredLobbies = this.listLobby;
      this.filterLobbies();
    });

    this.socketJoinObservable = this._socket.lobbyResponseObservable.subscribe((isAccept: boolean) => {
      if (isAccept) {
        this.gameService.gameId = this.curGameId;
        this._router.navigateByUrl(RoutingConstants.ROUTE_TO_GAME_LOBBY);
        this._socket.emit("askTheGameData", this.curGameId);
      } else {
        this.curGameId = '';
        this.errorMessage = 'Vous n\'avez pas été accepté';
        setTimeout(() => { this.errorMessage = '' }, 3000);
      }
    }, (error) => {
      this.errorMessage = ERR_JOINING_LOBBY
      setTimeout(() => { this.errorMessage = '' }, 3000);
    });
    this._socket.emit('requestGameWaiting');

    this._db.firestore.collection('friends').where('users', 'array-contains', this.auth.username).get().then((result) => {
      if(result.docs.length > 0) {
        let requests: any[] = [];
        for(let doc of result.docs){
          let friend = doc.data().users.filter((u: string) => u !== this.auth.username)[0];
          requests.push(this._db.firestore.collection('users').where("username", "==", friend).get());
        }
        Promise.all(requests).then((results: any[]) => {
          for(let res of results){
            if(res.docs.length > 0){
              let data = res.docs[0].data();
              this.friends.push({username: data.username, avatar: data.avatar, status: -1})
            }
          }
          this.hasLoaded = true;
        }).catch(() => {this.hasLoaded = true;})
      } else {
        this.hasLoaded = true;
      }
    }).catch(() => {this.hasLoaded = true;})
  }

  ngOnDestroy(){
    this.socketListObservable.unsubscribe();
    this.socketJoinObservable.unsubscribe();
  }

  public joinLobby(gameId: number) {
    this.curGameId = gameId.toString();
    const lobby: NewGame | undefined = this.listLobby.find((game: NewGame) => game.gameId.toString() == this.curGameId);
    if (lobby) {
      if (lobby.password.length === 0) {
        this._socket.emit("joiningLobby", this.curGameId);
      } else {
        if (this.curPassword === lobby.password) {
          this._socket.emit("joiningLobby", this.curGameId);
        }
        this.errorMessage = ERR_PASSWORD;
        setTimeout(() => { this.errorMessage = '' }, 3000);
      }
    }
  }

  filterLobbies() {
    let difficulty = +this.curDifficulty;
    if(this.curMode === 'all'){
      if(difficulty === -1){
        this.filteredLobbies = this.listLobby;
      } else {
        this.filteredLobbies = this.listLobby.filter(game => game.difficulty === difficulty);
      }
    } else {
      this.filteredLobbies =  this.listLobby.filter(game => game.isClassic === (this.curMode === 'classic'));
      if(difficulty !== -1){
        this.filteredLobbies = this.filteredLobbies.filter(game => game.difficulty === difficulty);
      }
    }
    if(this.hostName.length > 0){
      this.filteredLobbies = this.filteredLobbies.filter(game => game.host.includes(this.hostName));
    }
    this.moreFilterOptions();
  }

  moreFilterOptions(){
    if(this.extraOptions.hasPowers){
      this.filteredLobbies = this.filteredLobbies.filter(game => game.gotPower);
    } 
    if(this.extraOptions.hasSpace) {
      this.filteredLobbies = this.filteredLobbies.filter(game => game.isClassic ? game.users.length < 4: game.users.length < 8);
    }
    if(this.extraOptions.isPublic) {
      this.filteredLobbies = this.filteredLobbies.filter(game => game.password.length === 0);
    }
    if(this.extraOptions.friendsOnly){
      this.filteredLobbies = this.filteredLobbies.filter(game => this.friends.map(f => f.username).includes(game.host));
    }
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

  disconnectUser() {
    const modalRef = this._modal.open(ConfirmationModalComponent, { backdrop: 'static', centered: true, keyboard: false })
    modalRef.componentInstance.message = "Cette action vous déconnectera de l'application et vous enverra au menu de connexion";
    modalRef.result.then(() => {
      this._socket.emit('manual-disconnect');
      this.auth.username = '';
      this._router.navigateByUrl(RoutingConstants.ROUTE_TO_LOGIN);
    }).catch(() => { });
  }

  goToProfile() {
    this._router.navigateByUrl(RoutingConstants.ROUTE_TO_PROFILE);
  }

  goToMenu() {
    this._router.navigateByUrl(RoutingConstants.ROUTE_TO_MAIN_MENU);
  }

  trackByHost(index: number, item: NewGame){
    return item.host;
  }

}
