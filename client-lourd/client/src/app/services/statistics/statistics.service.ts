import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';


const MILLISECONDS_IN_AN_HOUR = 3600000;
const MILLISECONDS_IN_A_MINUTE = 60000;

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  userId: string = "";
  public gamesPlayed: number = 0;
  public gamesWon: number = 0;
  public percentageGamesWon: number = 0;
  public averageGameDuration: number = 0;
  public averageHours: number = 0;
  public averageMinutes: number = 0;
  public totalHours: number = 0;
  public totalMinutes: number = 0;
  public totalPlayTime: number = 0;

  constructor(private _db: AngularFirestore) { }

  getStats(username: string) {
    this._db.firestore.collection('users').where('username', '==', username).get().
      then((result) => {
        const userData = result.docs[0].data();
        this.gamesPlayed = userData.gamesPlayed;
        this.gamesWon = userData.gamesWon;
        this.totalPlayTime = userData.totalPlayTime;
        this.computeDerivedStats();
      }).
      catch((e) => { });
  }


  computeDerivedStats() {
    this.percentageGamesWon = +(this.gamesWon != 0 ? (this.gamesWon / this.gamesPlayed) * 100 : 0).toPrecision(3);
    this.averageGameDuration = this.gamesPlayed != 0 ? Math.round(this.totalPlayTime / this.gamesPlayed) : 0;
    this.totalHours = (this.totalPlayTime - (this.totalPlayTime % MILLISECONDS_IN_AN_HOUR)) / MILLISECONDS_IN_AN_HOUR;
    this.totalMinutes = ((this.totalPlayTime % MILLISECONDS_IN_AN_HOUR) - ((this.totalPlayTime % MILLISECONDS_IN_AN_HOUR) % MILLISECONDS_IN_A_MINUTE)) / MILLISECONDS_IN_A_MINUTE;
    this.averageHours = (this.averageGameDuration - (this.averageGameDuration % MILLISECONDS_IN_AN_HOUR)) / MILLISECONDS_IN_AN_HOUR;
    this.averageMinutes = ((this.averageGameDuration % MILLISECONDS_IN_AN_HOUR) - ((this.averageGameDuration % MILLISECONDS_IN_AN_HOUR) % MILLISECONDS_IN_A_MINUTE)) / MILLISECONDS_IN_A_MINUTE;
  }

  clearStats() {
    this.gamesPlayed = 0;
    this.gamesWon = 0;
    this.percentageGamesWon = 0;
    this.averageGameDuration = 0;
    this.averageHours = 0;
    this.averageMinutes = 0;
    this.totalHours = 0;
    this.totalMinutes = 0;
    this.totalPlayTime = 0;
  }
}
