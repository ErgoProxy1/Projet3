import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/authService/auth.service';
import { GameService } from 'src/app/services/gameService/game-service.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { TimeStamp } from 'src/app/services/utils/firebase-utils';
import { RoutingConstants } from 'src/app/services/utils/routingConstants';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

export class LoginFormData {
  username: string = '';
  password: string = '';
}

export class LoginFormErrors {
  username: string = '';
  password: string = '';
}

export class RegisterFormData {
  username: string = '';
  password: string = '';
  firstName: string = '';
  lastName: string = '';
}

export class RegisterFormErrors {
  username: string = '';
  password: string = '';
  firstName: string = '';
  lastName: string = '';
  usernameTaken: boolean = false;
  finishedCheckingTaken: boolean = false;
  usernameHasSpace: boolean = false;
}

export class ProfileInfo {
  avatar = '';
  connections = [TimeStamp.now()];
  disconnections = [];
  gamesPlayed = 0;
  gamesWon = 0;
  totalPlayTime = 0;
  games = [];
  firstName = '';
  lastName = '';
  username = '';
  password = '';
}

@Component({
  selector: 'app-login-menu',
  templateUrl: './login-menu.component.html',
  styleUrls: ['./login-menu.component.scss']
})
export class LoginMenuComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('loginForm') loginForm: NgForm;
  loginFormData = new LoginFormData();
  loginErrors = new LoginFormErrors();

  @ViewChild('registerForm') registerForm: NgForm;
  registerFormData = new RegisterFormData();
  registerErrors = new RegisterFormErrors();

  loginPassSub: Subscription;
  loginFailSub: Subscription;

  isRegistering = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private _socket: SocketService,
    private _modal: NgbModal,
    private _tutorial: TutorialService,
    private _gameManager: GameService
  ) { }

  ngOnInit(): void {
    this.setupSocket();
    this.auth.avatarSrc = '';
    this.auth.uid = '';
    this.auth.username = '';
    this.isRegistering = false;
    this._gameManager.gameId = '';
    this._gameManager.isCreatingWordPair = false;
    this._gameManager.isCreatingAvatar = false;
  }

  ngAfterViewInit() {

  }

  setupSocket() {
    this.loginPassSub = this._socket.loginPassObservable.subscribe((username: string) => {

      if (username === this.loginFormData.username.trim() || username === this.registerFormData.username.trim()) {
        this.auth.username = username;
        if (this.isRegistering) { //register
          //save user info
          let userInfo = new ProfileInfo();
          userInfo.firstName = this.registerFormData.firstName;
          userInfo.lastName = this.registerFormData.lastName;
          userInfo.username = this.registerFormData.username;
          userInfo.password = this.registerFormData.password;
          this.auth.addUser(userInfo);

          //suggest tutorial
          const modal = this._modal.open(ConfirmationModalComponent, { backdrop: 'static', centered: true, keyboard: false });
          modal.componentInstance.title = `Bienvenue ${username}`
          modal.componentInstance.message = 'Merci de vous être inscris à Fais-moi un Dessin!'
          modal.componentInstance.question = 'Voudriez-vous aller au tutoriel?'
          modal.componentInstance.confirmationText = 'Oui'
          modal.componentInstance.dismissText = 'Non'
          modal.result.then(() => {
            this._tutorial.start();
            this.auth.connectionTime = TimeStamp.now();
            this.router.navigateByUrl(RoutingConstants.ROUTE_TO_GAME_ZONE);
          }).catch(() => {
            this.auth.connectionTime = TimeStamp.now();
            this.router.navigateByUrl(RoutingConstants.ROUTE_TO_MAIN_MENU);
          })

        } else { //login
          this.auth.setupConnection();
          this.auth.connectionTime = TimeStamp.now();
          this.router.navigateByUrl(RoutingConstants.ROUTE_TO_MAIN_MENU);
        }
      }
    });

    this.loginFailSub = this._socket.loginFailObservable.subscribe((username: string) => {
      if (username === this.loginFormData.username.trim()) {
        this.loginErrors.username = `L'utilisateur ${username} est déjà connecté`
        this.loginFormData = new LoginFormData();
      } else if (username === this.registerFormData.username.trim()) {
        this.registerErrors.username = `Le nom d'utilisateur ${username} est déjà pris`
        this.registerFormData.username = ''
        this.registerFormData.password = ''
      }
    });
  }

  ngOnDestroy() {
    this.loginPassSub.unsubscribe();
    this.loginFailSub.unsubscribe();
  }

  submitLogin() {
    this.auth.queryUsername(this.loginFormData.username).then((result) => {
      const docData = result.docs[0].data();
      if (result.docs.length > 0 && docData.password == this.loginFormData.password) {
        this._socket.emit('request-login', this.loginFormData.username.trim());
      }
      else if (docData.password != this.loginFormData.password && result.docs.length > 0) {
        this.loginErrors.password = "Le mot de passe est incorrect";
      }
    }).catch((e) => { this.loginErrors.username = "Le nom d'utilisateur n'existe pas" })
  }

  submitRegister() {
    this._socket.emit('request-login', this.registerFormData.username.trim());
  }

  clearError(field: string) {
    if (this.isRegistering) {
      if (this.registerFormData.username.length > 0) {
        this.registerErrors.finishedCheckingTaken = false;
        this.auth.queryUsername(this.registerFormData.username).then((result) => {
          if (result.docs.length > 0) {
            this.registerErrors.username = "Ce nom d'utilisateur est déja pris";
            this.registerErrors.usernameTaken = true;
          }
          else {
            this.registerErrors.usernameTaken = false;
            this.registerErrors.finishedCheckingTaken = true;
          }
        });
      }
      if (field === 'username') {
        this.registerErrors.username = '';
        if (this.registerFormData.username.match(/^[^\s].*/) === null && this.registerFormData.username.length > 0) {
          this.registerErrors.username = "Les noms d'utilisateurs ne peuvent pas commencer par un espace";
          this.registerErrors.usernameHasSpace = true;
        }
        else {
          this.registerErrors.usernameHasSpace = false;
        }
      } else if (field === 'password') {
        this.registerErrors.password = '';
      } else if (field === 'firstName') {
        this.registerErrors.firstName = '';
      } else if (field === 'lastName') {
        this.registerErrors.lastName = '';
      }
    } else {
      if (field === 'username') {
        this.loginErrors.username = '';
        if (this.loginFormData.username.match(/^[^\s].*/) === null && this.loginFormData.username.length > 0) {
          this.loginErrors.username = "Les noms d'utilisateurs ne peuvent pas commencer par un espace"
        }
      } else if (field === 'password') {
        this.loginErrors.password = '';
      }
    }
  }
}
