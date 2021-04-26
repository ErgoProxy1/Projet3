import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ProfileInfo } from 'src/app/components/login-menu/login-menu.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  username: string = '';
  test: number = 0;
  uid: string = "";
  avatarSrc = "";
  connectionTime: any;

  constructor(private _db: AngularFirestore) { }
  addUser(data: ProfileInfo) {
    this.queryUsername(data.username).then((result) => {
      if (result.docs.length == 0) {
        this._db.collection("users").add(Object.assign({}, data)).then((result) => {
          this.uid = result.id;
        });
      }
    })
  }

  queryUsername(username: string) {
    return this._db.firestore.collection('users').where("username", "==", username).get();
  }

  setupConnection() {
    this._db.firestore.collection('users').where('username', '==', this.username).get().then((result) => {
      if (result.docs.length > 0) {
        let data = result.docs[0].data();
        this.uid = result.docs[0].id;
        if (data.avatar) {
          this.avatarSrc = data.avatar;
        }
      }
    })
  }
}
