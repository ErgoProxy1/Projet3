import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/authService/auth.service';
import { GameService } from 'src/app/services/gameService/game-service.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { RoutingConstants } from 'src/app/services/utils/routingConstants';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {
  gameZoneRoute = `/${RoutingConstants.ROUTE_TO_GAME_ZONE}`;
  profileRoute = `/${RoutingConstants.ROUTE_TO_PROFILE}`
  gameSetupRoute = `/${RoutingConstants.ROUTE_TO_GAME_SETEUP}`
  selectLobbyRoute = `/${RoutingConstants.ROUTE_TO_SELECT_GAME}`

  faArrowCircleLeft = faArrowCircleLeft;

  constructor(
    public auth: AuthService,
    private _socket: SocketService,
    private _router: Router,
    private _modal: NgbModal,
    private _tutorial: TutorialService,
    private _game: GameService
  ) {

  }

  ngOnInit() {
    this._game.gameId = '';
    this._game.isCreatingWordPair = false;
    this._game.isCreatingAvatar = false;
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

  startTutorial() {
    this._tutorial.start();
    this._router.navigateByUrl(RoutingConstants.ROUTE_TO_GAME_ZONE);
  }

  startWordCreator(){
    this._game.gameId = '';
    this._game.isCreatingWordPair = true;
    this._tutorial.end();
    this._router.navigateByUrl(RoutingConstants.ROUTE_TO_GAME_ZONE);
  }

  socialMenu(){
    this._router.navigateByUrl(RoutingConstants.ROUTE_TO_SOCIAL);
  }

}
