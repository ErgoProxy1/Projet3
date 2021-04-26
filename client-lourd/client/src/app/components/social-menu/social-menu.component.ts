import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { faArrowCircleLeft, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { AngularFirestore } from '@angular/fire/firestore'
import { AuthService } from 'src/app/services/authService/auth.service';
import { Router } from '@angular/router';
import { RoutingConstants } from 'src/app/services/utils/routingConstants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { SocketService } from 'src/app/services/socket/socket.service';
import { interval, Subscription } from 'rxjs';
import { AddFriendModalComponent } from './add-friend-modal/add-friend-modal.component';
import { MessageHandlerService } from 'src/app/services/messageHandler/message-handler.service';
import { MessageType } from 'src/app/services/utils/constantsAndEnums';

export interface Friend {
  username: string;
  avatar: string;
  status: number;
}

export interface FriendRequest {
  sender: string;
  avatar: string;
}

@Component({
  selector: 'app-social-menu',
  templateUrl: './social-menu.component.html',
  styleUrls: ['./social-menu.component.scss']
})
export class SocialMenuComponent implements OnInit, AfterViewInit, OnDestroy {

  faCircleNotch = faCircleNotch;
  faArrowCircleLeft = faArrowCircleLeft;

  hasLoaded = false;

  friends: Friend[] = [];

  requests: FriendRequest[] = [];

  requestStatusSub: Subscription;
  getStatusSub: Subscription;
  updateFriendsSub: Subscription;
  updateRequestSub: Subscription;

  constructor(
    private _db: AngularFirestore,
    public auth: AuthService,
    private _router: Router,
    private _modal: NgbModal,
    private _socket: SocketService,
    private _messageHandler: MessageHandlerService
  ) { }

  ngOnInit(): void {
    const statusPingTimer = interval(2000);
    this.requestStatusSub = statusPingTimer.subscribe(() => {
      this._socket.emit('request-status', JSON.stringify(this.friends.map(f => f.username)));
    })

    this.getStatusSub = this._socket.statusObservable.subscribe((statuses: string) => {
      console.log(statuses);
      let parsedStatuses: any[] = JSON.parse(statuses);
      for (let st of parsedStatuses) {
        let friendIndex = this.friends.findIndex(f => f.username === st.username);
        if (friendIndex !== -1) {
          this.friends[friendIndex].status = st.status;
        }
      }
    })

    this.updateFriendsSub = this._socket.updateFriendsObservable.subscribe(() => {
      this.getFriendsList();
    })

    this.updateRequestSub = this._socket.updateFriendRequestsObservable.subscribe(() => {
      this.getRequests();
    })
  }

  ngOnDestroy() {
    this.requestStatusSub.unsubscribe();
    this.getStatusSub.unsubscribe();
    this.updateFriendsSub.unsubscribe();
    this.updateRequestSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.getFriendsList();
    this.getRequests();
  }

  getFriendsList() {
    this.friends.length = 0;
    this._db.firestore.collection('friends').where('users', 'array-contains', this.auth.username).get().then((result) => {
      if (result.docs.length > 0) {
        let requests: any[] = [];
        for (let doc of result.docs) {
          let friend = doc.data().users.filter((u: string) => u !== this.auth.username)[0];
          requests.push(this._db.firestore.collection('users').where("username", "==", friend).get());
        }
        Promise.all(requests).then((results: any[]) => {
          for (let res of results) {
            if (res.docs.length > 0) {
              let data = res.docs[0].data();
              this.friends.push({ username: data.username, avatar: data.avatar, status: -1 })
            }
          }
          this.friends = this.friends.sort((a, b) => a.username.localeCompare(b.username));
          this.hasLoaded = true;
        }).catch(() => { this.hasLoaded = true; })
      } else {
        this.hasLoaded = true;
      }
    }).catch(() => { this.hasLoaded = true; })
  }

  getRequests() {
    this.requests.length = 0;
    this._db.firestore.collection('friend_requests').where('target', '==', this.auth.username).get().then((result) => {
      if (result.docs.length > 0) {
        let requests: any[] = [];
        for (let doc of result.docs) {
          let sender = doc.data().sender;
          requests.push(this._db.firestore.collection('users').where("username", "==", sender).get());
        }
        Promise.all(requests).then((results: any[]) => {
          for (let res of results) {
            if (res.docs.length > 0) {
              let data = res.docs[0].data();
              this.requests.push({ sender: data.username, avatar: data.avatar })
            }
          }
        })
      }
    }).catch(() => { this.hasLoaded = true; })
  }

  addFriend() {
    const modal = this._modal.open(AddFriendModalComponent, { backdrop: 'static', centered: true, keyboard: false });
    modal.componentInstance.friends = this.friends;
    modal.result.then(() => {
      this._messageHandler.showMessage("Votre requête d\'ami a été envoyée", MessageType.Success, 4000, true, true)
    }).catch((e) => { if (e === 'error') this._messageHandler.showMessage("Une erreur s\'est produite", MessageType.Danger, 4000, true, true) })
  }

  acceptRequest(request: FriendRequest) {
    this._db.firestore.collection('friend_requests').where('target', '==', this.auth.username).where('sender', '==', request.sender).get().then((res) => {
      if (res.docs.length > 0) {
        this._db.firestore.collection('friend_requests').doc(res.docs[0].id).delete().then(() => {
          this._db.firestore.collection('friends').add({ users: [this.auth.username, request.sender] }).then(() => {
            this._socket.emit('update-friends-list', request.sender);
            this.getFriendsList();
            this.getRequests();
          });
        });
      }
    });
  }

  rejectRequest(request: FriendRequest) {
    this._db.firestore.collection('friend_requests').where('target', '==', this.auth.username).where('sender', '==', request.sender).get().then((res) => {
      if (res.docs.length > 0) {
        this._db.firestore.collection('friend_requests').doc(res.docs[0].id).delete().then(() => {
          this.getRequests();
        });
      }
    });
  }

  removeFriend(friend: Friend) {
    const modalRef = this._modal.open(ConfirmationModalComponent, { backdrop: 'static', centered: true, keyboard: false })
    modalRef.componentInstance.message = `Cette action retirera ${friend.username} de votre liste d'amis.`;
    modalRef.result.then(() => {
      this._db.firestore.collection('friends').where('users', 'array-contains', this.auth.username).get().then((res) => {
        if (res.docs.length > 0) {
          for (let doc of res.docs) {
            if (doc.data().users.includes(friend.username)) {
              this._db.firestore.collection('friends').doc(doc.id).get().then((relationToRemove) => {
                this._db.firestore.collection('friends').doc(relationToRemove.id).delete().then(() => {
                  this._socket.emit('update-friends-list', friend.username);
                  this.getFriendsList();
                });
              })
            }
          }
        }
      });
    }).catch((e) => { console.log(e); });
  }

  goToMenu() {
    this._router.navigateByUrl(RoutingConstants.ROUTE_TO_MAIN_MENU);
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

}
