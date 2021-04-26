import firebase from "firebase";
import * as fire from 'firebase/app'

export class GameHistory {

  constructor(private _db: firebase.app.App) { }

  addGameToDatabase(difficulty: number,
    gameMode: number,
    hasPowerUps: boolean,
    host: string,
    players: string[],
    points: number[],
    winners: string[],
    start: fire.default.firestore.Timestamp,
    end: fire.default.firestore.Timestamp
  ) {
    let gameId: string;
    console.log(points);
    this._db.firestore().collection("games").add({
      difficulty: difficulty,
      gameMode: gameMode,
      hasPowerUps: hasPowerUps,
      host: host,
      players: players,
      points: points,
      winners: winners,
      timeStart: start,
      timeEnd: end
    }).then((result) => {
      gameId = result.id;
      return gameId;
    }).
      then((id) => {
        const promiseArray = [];
        for (let i = 0; i < players.length; i++) {
          promiseArray[i] = this._db.firestore().collection("users").where("username", "==", players[i]).get();
        }
        return promiseArray;
      }).
      then((promises) => {
        const games: string[][] = [];
        Promise.all(promises).then((users) => {
          for (let i = 0; i < users.length; i++) {
            if (users[i].docs[0].data().games) {
              games[i] = users[i].docs[0].data().games;
              games[i].push(gameId);
              this._db.firestore().collection('users').doc(users[i].docs[0].id).update({ games: games[i] });
            }
          }
        }).catch((e) => { console.log(e); })
      }).
      catch((e) => { });
  }

}