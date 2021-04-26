import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { faArrowCircleLeft, faCaretSquareDown, faCaretSquareRight, faCircleNotch, faFileUpload } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/authService/auth.service';
import { TimeStamp } from 'src/app/services/utils/firebase-utils';
import { RoutingConstants } from 'src/app/services/utils/routingConstants';
import { AvatarSelectionComponent } from './avatar-selection/avatar-selection.component';
import { StatisticsService} from 'src/app/services/statistics/statistics.service';
import { GameHistoryService } from 'src/app/services/gameHistory/game-history.service';
import { GameService } from 'src/app/services/gameService/game-service.service';


export class AvatarUpload {
  name: string;
  file: File;

  constructor(name: string, file: File) {
    this.name = name;
    this.file = file;
  }
}

export class UserProfile {
  username = '';
  firstName = '';
  lastName = '';
  connections: string[] = [];
  disconnections: string[] = [];
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, AfterViewInit, OnDestroy {

  faArrowCircleLeft = faArrowCircleLeft;
  faCircleNotch = faCircleNotch;
  faFileUpload = faFileUpload;
  faCaretRight = faCaretSquareRight;
  faCaretDown = faCaretSquareDown;

  profile = new UserProfile();
  isUploading = false;

  avatarError = '';

  hasLoaded = false;

  constructor(
    private _router: Router,
    private _db: AngularFirestore,
    public auth: AuthService,
    private _storage: AngularFireStorage,
    private _modal: NgbModal,
    public _stats: StatisticsService,
    public _games: GameHistoryService,
    private _gameManager: GameService
  ) { }

  ngOnInit(): void {
    this._gameManager.gameId = '';
    this._gameManager.isCreatingWordPair = false;
    this._gameManager.isCreatingAvatar = false;
    this._stats.getStats(this.auth.username);
    this._games.getGamesFromDatabase(this.auth.username);
  }

  ngAfterViewInit() {
    this._db.firestore.collection('users').where('username', '==', this.auth.username).get().then((result) => {
      if (result.docs.length > 0) {
        let data = result.docs[0].data()
        this.profile.username = data.username;
        this.profile.firstName = data.firstName;
        this.profile.lastName = data.lastName;
        this.profile.connections = (data.connections as []).map(time => { return this.formatDate((time as TimeStamp).toDate()) });
        this.profile.disconnections = (data.disconnections as []).map(time => { return this.formatDate((time as TimeStamp).toDate()) });
        this.auth.uid = result.docs[0].id;
      } else {
        this.profile.username = 'NA';
        this.profile.firstName = 'NA';
        this.profile.lastName = 'NA';
      }
      this.hasLoaded = true
    }).catch((e) => { })
  }

  ngOnDestroy() {
    this._stats.clearStats();
    this._games.clearGames();
  }

  saveImage(files: FileList) {
    if (files) {
      if (files.item(0)) {
        let file = files.item(0) as File;
        if (['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'].includes(file.type)) {
          this.pushFileToStorage(new AvatarUpload(`${this.auth.uid}`, new File([file], `${this.auth.uid}`, { type: 'image/png' })))
        } else {
          this.avatarError = 'Format de fichier invalide.'
          setTimeout(() => { this.avatarError = '';}, 2000);
        }
      }
    }
  }

  pushFileToStorage(fileUpload: AvatarUpload) {
    this.isUploading = true;
    const filePath = `avatars/${this.auth.uid}`;
    const storageRef = this._storage.ref(filePath);
    const uploadTask = this._storage.upload(filePath, fileUpload.file);

    uploadTask.snapshotChanges().toPromise().then(() => {
      storageRef.getDownloadURL().subscribe(downloadURL => {
        this.isUploading = false;
        this.auth.avatarSrc = downloadURL;
        this._db.collection('users').doc(this.auth.uid).update({ avatar: downloadURL });
      });
    }).catch((e) => {this.isUploading = false;})
  }

  openImageSelection(){
    const modalRef = this._modal.open(AvatarSelectionComponent, { centered: true, keyboard: false })
    modalRef.result.then((src: string) => {
      if(src){
        if(src.length > 0){
          this.auth.avatarSrc = src;
          this._db.firestore.collection('users').doc(this.auth.uid).update({ avatar: src });
        }
      }
    }).catch(() => { });
  }

  formatDate(date: Date){
    let formated = date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' })
    return formated[0].toUpperCase() + formated.slice(1);
  }

  goToMenu() {
    this._router.navigateByUrl(RoutingConstants.ROUTE_TO_MAIN_MENU);
  }

  goToCanvas() {
    this._gameManager.isCreatingAvatar = true;
    this._gameManager.gameId = '';
    this._router.navigateByUrl(RoutingConstants.ROUTE_TO_GAME_ZONE);
  }

}
