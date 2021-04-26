import * as fire from 'firebase/app'
import firebase from "firebase";

export class Statistics {

    userId : string = "";
    public gamesPlayed:number = 0;
    public gamesWon:number = 0;
    public totalPlayTime:number = 0;

    constructor(private _db:firebase.app.App) {}

    updateStats(username:string, gameIsWon: boolean, beginning: fire.default.firestore.Timestamp, end:  fire.default.firestore.Timestamp) {
        this._db.firestore().collection("users").where("username","==",username).get().
        then((result) => { 
          this.userId = result.docs[0].id;
        }).
        then(()=>{  
          const userDocRef = this._db.firestore().collection("users").doc(this.userId);
          return this._db.firestore().runTransaction((transaction) => {
            return transaction.get(userDocRef).then((userDoc) => {
                if (!userDoc.exists) {
                  throw "document does not exist !";
                }
                else {
                  const userData = userDoc.data();
                  if(userData) {

                    const beginningDate = beginning.toDate();
                    const endDate = end.toDate();
                    this.gamesPlayed = userData.gamesPlayed + 1;
                    this.gamesWon = gameIsWon ? userData.gamesWon + 1 : userData.gamesWon;
                    this.totalPlayTime = userData.totalPlayTime + endDate.getTime()-beginningDate.getTime();
    
                    transaction.update(userDocRef, {gamesPlayed: this.gamesPlayed, gamesWon: this.gamesWon,totalPlayTime : this.totalPlayTime,});
                  }
                }
            }).
            catch((e) => {});
          })
        }).
        catch((e) => {});
      }

}