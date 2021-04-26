import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RoutingConstants } from 'src/app/services/utils/routingConstants';
import { AuthService } from '../../services/authService/auth.service';
import { SocketService } from '../../services/socket/socket.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { GameService } from '../../services/gameService/game-service.service';
import { Subscription } from 'rxjs';

export interface CreateGame {
  host:string,
  gameMode: number,
  gotPower: boolean,
  difficulty: number,
  password: string
};

@Component({
  selector: 'app-game-setup',
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.scss']
})
export class GameSetupComponent implements OnInit, OnDestroy {
  gameMode:number = 0;
  isPrivate: boolean = false;
  gotPower: boolean = false;
  difficulty: number = 0;
  password: string = "";
  showPassword = false;

  hostLobbyResponseSub: Subscription;

  constructor(
    public auth: AuthService,
    public gameService: GameService,
    private _socket: SocketService,
    private _router: Router,
    private _modal: NgbModal
  ) { }

  ngOnInit(): void {
    this.hostLobbyResponseSub = this._socket.hostLobbyResponseObservable.subscribe((gameId: string) => {
      this.gameService.gameId = gameId+'';
      this._router.navigateByUrl(RoutingConstants.ROUTE_TO_GAME_LOBBY);
    });
  }

  ngOnDestroy() {
    this.hostLobbyResponseSub.unsubscribe();
  }

  public sendGameCreationRequest(): void {
    const newGame: CreateGame =
    {
      host:this.auth.username,
      gameMode: this.gameMode,
      gotPower: this.gotPower,
      difficulty: this.difficulty,
      password: (this.isPrivate) ? this.password : "",
    };
    this._socket.emit('createGame', JSON.stringify(newGame));
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

}
