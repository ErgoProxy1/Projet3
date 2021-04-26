import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { TimeStamp } from '../utils/firebase-utils';


export enum Difficulty { "facile", "normale", "difficile" };
export enum GameMode { "classique", "chacun pour soi" };

export class Game {

  difficulty: string;
  gameMode: string;
  points: number[];
  hasPowerUps: boolean;
  host: string = "";
  players: string[];
  wasWon: boolean;
  start: string;
  end: string;

  constructor(difficulty: number, gameMode: number, points: number[], hasPowerUps: boolean, host: string, players: string[], wasWon: boolean, start: string, end: string) {
    this.difficulty = Difficulty[difficulty];
    this.gameMode = GameMode[gameMode];
    this.points = points;
    this.hasPowerUps = hasPowerUps;
    this.host = host;
    this.players = players;
    this.wasWon = wasWon;
    this.start = start;
    this.end = end;
  }

  getPoints(username: string): number {
    const index = this.players.findIndex((element: string) => username === element);
    return this.points[index];
  }
}

@Injectable({
  providedIn: 'root'
})
export class GameHistoryService {

  games: Game[] = [];
  gameIds: string[] = [];
  userId: string = "";

  constructor(private _db: AngularFirestore) { }

  // get games for a specified username
  getGamesFromDatabase(username: string) {
    return this._db.firestore.collection("users").where("username", "==", username).get().
      then((result) => {
        this.userId = result.docs[0].id;
        this.gameIds = result.docs[0].data().games;
        let gamesPromises = [];
        for (let id of this.gameIds) {
          gamesPromises.push(this._db.firestore.collection('games').doc(id).get())
        }
        Promise.all(gamesPromises).then((games) => {
          let actualGames = games.filter((doc) => doc.data() !== undefined);
          let sortedGame = actualGames.sort((a, b) => {
            let bdata = b.data();
            let adata = a.data();
            if(bdata && adata){
              let res = (bdata.timeEnd as TimeStamp).toDate().getTime() - (adata.timeEnd as TimeStamp).toDate().getTime();
              if(res){
                return res;
              }
              return 0;
            }
            return 0;
          })
          for (let g of sortedGame) {
            const gameData = g.data();
            if (gameData) {
              this.games.push(new Game(
                gameData.difficulty,
                gameData.gameMode,
                gameData.points,
                gameData.hasPowerUps,
                gameData.host,
                gameData.players,
                gameData.winners.includes(username),
                this.formatDate(gameData.timeStart.toDate()),
                this.formatDate(gameData.timeEnd.toDate())
              ))
            }
          }
        }).catch((e) => console.log(e))
      }).catch((e) => console.log(e));
  }

  formatDate(date: Date) {
    let formated = date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    return formated[0].toUpperCase() + formated.slice(1);
  }

  clearGames(){
    this.gameIds = [];
    this.games = [];
  }
}
