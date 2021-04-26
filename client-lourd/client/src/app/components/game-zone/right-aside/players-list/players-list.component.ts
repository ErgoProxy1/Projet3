import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Game, Player, VoteKick } from 'src/app/components/lobby/lobby.component';
import { AuthService } from 'src/app/services/authService/auth.service';
import { SocketService } from 'src/app/services/socket/socket.service';

export class Team {
  users: string[] = [];
  points: number = 0;
}

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.scss']
})

export class PlayersListComponent implements OnInit, OnDestroy {
  @Input() players: Player[];
  @Input() activeGame: Game;
  @Input() hasVotedToKick: boolean;
  @Input() activeVoteKick: VoteKick;
  @Input() hasActiveVoteKick: boolean;
  @Input() team1: string[];
  @Input() teamHasBot: boolean[];

  @Output() kickPlayer = new EventEmitter<string>();
  @Output() voteKick = new EventEmitter<string>();
  @Output() rejectKick = new EventEmitter<string>();

  @ViewChildren('reaction') reactions: QueryList<NgbPopover>;

  newPointsSub: Subscription;
  reactSub: Subscription;

  playersLikeReacting: string[] = [];
  playersDislikeReacting: string[] = [];

  constructor(
    public auth: AuthService,
    public socket: SocketService,
  ) { }

  ngOnInit(): void {
    this.newPointsSub = this.socket.newPointsObservable.subscribe((data) => {
      const parsedData = JSON.parse(data) as { users: string[], points: number };
      for (var i: number = 0; i < parsedData.users.length; i++) {
        var playerPoints = this.players.find((player: Player) => parsedData.users[i] === player.name);
        if (playerPoints) {
          playerPoints.points = parsedData.points;
        }
      }
    })

    this.reactSub = this.socket.receiveReactionObservable.subscribe((data) => {
      console.log('got here');
      let reactData = JSON.parse(data) as { gameId: string, username: string, reaction: string };
      if (reactData.reaction === 'like') {
        this.playersLikeReacting.unshift(reactData.username);
        this.reactions.toArray()[this.players.findIndex(p => p.name === reactData.username)].open();
        setTimeout(() => {
          this.reactions.toArray()[this.players.findIndex(p => p.name === reactData.username)].close();
        }, 3000);
        setTimeout(() => {
          this.playersLikeReacting.pop();
        }, 4000);
      } else if (reactData.reaction === 'dislike') {
        this.playersDislikeReacting.unshift(reactData.username);
        this.reactions.toArray()[this.players.findIndex(p => p.name === reactData.username)].open();
        setTimeout(() => {
          this.reactions.toArray()[this.players.findIndex(p => p.name === reactData.username)].close();
        }, 3000);
        setTimeout(() => {
          this.playersDislikeReacting.pop();
        }, 4000);
      }
    })
  }

  ngOnDestroy() {
    this.newPointsSub.unsubscribe();
    this.reactSub.unsubscribe();
  }

  hasValidPlayerCount(){
    if(this.activeGame){
      if(this.activeGame.isClassic){
        return this.teamHasBot[0] || this.teamHasBot[1];
      }
      return false;
    }
    return false;
  }
}
