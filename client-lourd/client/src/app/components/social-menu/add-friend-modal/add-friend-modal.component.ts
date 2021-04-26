import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/authService/auth.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { BOTS_LIST } from 'src/app/services/utils/bots';
import { Friend } from '../social-menu.component';

@Component({
  selector: 'app-add-friend-modal',
  templateUrl: './add-friend-modal.component.html',
  styleUrls: ['./add-friend-modal.component.scss']
})
export class AddFriendModalComponent implements OnInit {

  searchName = '';
  gotResult = false;
  result: any[] = [];

  @Input() friends: Friend[];

  constructor(
    private _activeModal: NgbActiveModal,
    private _db: AngularFirestore,
    private _auth: AuthService,
    private _socket: SocketService
  ) { }

  ngOnInit(): void {

  }

  searchUser() {
    this.result.length = 0;
    if (!BOTS_LIST.map(b => b.name).includes(this.searchName) && this.searchName !== this._auth.username) {
      this._db.firestore.collection('users').where('username', '==', this.searchName).get().then((res) => {
        if (res.docs.length > 0) {
          let data = res.docs[0].data();
          if (!this.friends.map(f => f.username).includes(data.username)) {
            this.result.push({ avatar: data.avatar, username: data.username })
            this.gotResult = true;
          } else {
            this.gotResult = false;
          }
        } else {
          this.gotResult = false;
        }
      }).catch((e) => {
        this.gotResult = false;
      })
    } else {
      this.gotResult = false;
    }
  }

  sendRequest() {
    this._db.firestore.collection('friend_requests').where('target', '==', this.searchName).where('sender', '==', this._auth.username).get().then((res) => {
      if (res.docs.length === 0) {
        this._db.firestore.collection('friend_requests').add({ sender: this._auth.username, target: this.result[0].username }).then(() => {
          this._socket.emit('update-friend-requests', (this.result[0].username));
          this._activeModal.close();
        })
      }
    }).catch(() => {
      this._activeModal.dismiss('error')
    })
  }

  dismiss() {
    this._activeModal.dismiss();
  }

}
