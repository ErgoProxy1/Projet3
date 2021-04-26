import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '../../components/game-zone/right-aside/chat/chat.component';
import { environment } from 'src/environments/environment';
import { VoteKick } from 'src/app/components/lobby/lobby.component';

export interface pairBoolString {
  isAccept: boolean,
  data: string
};

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  static instance: SocketService;

  private socket: Socket;

  messagesObservable: Observable<ChatMessage>;
  private _messagesSubject = new Subject<ChatMessage>();

  loginPassObservable: Observable<string>;
  private _loginPassSubject = new Subject<string>();

  loginFailObservable: Observable<string>;
  private _loginFailSubject = new Subject<string>();

  lobbyListObservable: Observable<string>;
  private _lobbyListSubject = new Subject<string>();

  drawingStartObservable: Observable<string>;
  private _drawingStartSubject = new Subject<string>();

  drawingUpdateObservable: Observable<string>;
  private _drawingUpdateSubject = new Subject<string>();

  drawingEndObservable: Observable<string>;
  private _drawingEndSubject = new Subject<string>();

  redrawCanvasObservable: Observable<string>;
  private _redrawCanvasSubject = new Subject<string>();

  updateBackgroundObservable: Observable<string>;
  private _updateBackgroundubject = new Subject<string>();

  updateChannelsObservable: Observable<string>;
  private _updateChannelsSubject = new Subject<string>();

  deleteChannelObservable: Observable<string>;
  private _deleteChannelSubject = new Subject<string>();

  lobbyResponseObservable: Observable<boolean>;
  private _lobbyResponseSubject = new Subject<boolean>();

  hostLobbyResponseObservable: Observable<string>;
  private _hostLobbyResponseSubject = new Subject<string>();

  getLobbyObservable: Observable<string>;
  private _getLobbySubject = new Subject<string>();

  removeAllPlayersObservable: Observable<string>;
  private _removeAllPlayersSubject = new Subject<string>();

  getVoteKickObservable: Observable<VoteKick>;
  private _getVoteKickSubject = new Subject<VoteKick>();

  endVoteKickObservable: Observable<void>;
  private _endVoteKickSubject = new Subject<void>();

  drawingWordObservable: Observable<string>;
  private _drawingWordSubject = new Subject<string>();

  startGameObservable: Observable<void>;
  private _startGameSubject = new Subject<void>();

  nextPlayerObservable: Observable<string>;
  private _nextPlayerSubject = new Subject<string>();

  nextRoundObservable: Observable<string>;
  private _nextRoundSubject = new Subject<string>();

  newClockTimeObservable: Observable<string>;
  private _newClockTimeSubject = new Subject<string>();

  newPointsObservable: Observable<string>;
  private _newPointsSubject = new Subject<string>();

  correctGuessObservable: Observable<string>;
  private _correctGuessSubject = new Subject<string>();

  incorrectGuessObservable: Observable<string>;
  private _incorrectGuessSubject = new Subject<string>();

  wordSuggestionsObservable: Observable<string>;
  private _wordSuggestionsSubject = new Subject<string>();
  statusObservable: Observable<string>;
  private _statusSubject = new Subject<string>();

  updateFriendsObservable: Observable<void>;
  private _updateFriendsSubject = new Subject<void>();

  updateFriendRequestsObservable: Observable<void>;
  private _updateFriendRequestsSubject = new Subject<void>();

  endGameObservable: Observable<string>;
  private _endGameSubject = new Subject<string>();

  recapGameObservable: Observable<string>;
  private _recapGameSubject = new Subject<string>();

  doNotDisturbObservable: Observable<boolean>;
  private _doNotDisturbSubject = new Subject<boolean>();

  relaunchObservable: Observable<string>;
  private _relaunchSubject = new Subject<string>();

  receiveReactionObservable: Observable<string>;
  private _receiveReactionSubject = new Subject<string>();

  popupObservable: Observable<string>;
  private _popupSubject = new Subject<string>();

  channelRequestObservable: Observable<string>;
  private _channelRequestSubject = new Subject<string>();

  /* for closing the word modal */

  constructor() {
    SocketService.instance = this;

    this.socket = io(environment.socketUrl);

    this.messagesObservable = this._messagesSubject.asObservable();
    this.loginPassObservable = this._loginPassSubject.asObservable();
    this.loginFailObservable = this._loginFailSubject.asObservable();
    this.lobbyListObservable = this._lobbyListSubject.asObservable();
    this.drawingStartObservable = this._drawingStartSubject.asObservable();
    this.drawingUpdateObservable = this._drawingUpdateSubject.asObservable();
    this.drawingEndObservable = this._drawingEndSubject.asObservable();
    this.redrawCanvasObservable = this._redrawCanvasSubject.asObservable();
    this.updateBackgroundObservable = this._updateBackgroundubject.asObservable();
    this.updateChannelsObservable = this._updateChannelsSubject.asObservable();
    this.deleteChannelObservable = this._deleteChannelSubject.asObservable();
    this.lobbyResponseObservable = this._lobbyResponseSubject.asObservable();
    this.hostLobbyResponseObservable = this._hostLobbyResponseSubject.asObservable();
    this.getLobbyObservable = this._getLobbySubject.asObservable();
    this.removeAllPlayersObservable = this._removeAllPlayersSubject.asObservable();
    this.getVoteKickObservable = this._getVoteKickSubject.asObservable();
    this.endVoteKickObservable = this._endVoteKickSubject.asObservable();
    this.startGameObservable = this._startGameSubject.asObservable();
    this.nextPlayerObservable = this._nextPlayerSubject.asObservable();
    this.drawingWordObservable = this._drawingWordSubject.asObservable();
    this.nextRoundObservable = this._nextRoundSubject.asObservable();
    this.newClockTimeObservable = this._newClockTimeSubject.asObservable();
    this.newPointsObservable = this._newPointsSubject.asObservable();
    this.correctGuessObservable = this._correctGuessSubject.asObservable();
    this.incorrectGuessObservable = this._incorrectGuessSubject.asObservable();
    this.wordSuggestionsObservable = this._wordSuggestionsSubject.asObservable();
    this.statusObservable = this._statusSubject.asObservable();
    this.updateFriendsObservable = this._updateFriendsSubject.asObservable();
    this.updateFriendRequestsObservable = this._updateFriendRequestsSubject.asObservable();
    this.endGameObservable = this._endGameSubject.asObservable();
    this.recapGameObservable = this._recapGameSubject.asObservable();
    this.doNotDisturbObservable = this._doNotDisturbSubject.asObservable();
    this.relaunchObservable = this._relaunchSubject.asObservable();
    this.receiveReactionObservable = this._receiveReactionSubject.asObservable();
    this.popupObservable = this._popupSubject.asObservable();
    this.channelRequestObservable = this._channelRequestSubject.asObservable();

    this.socket.on('message-broadcast', (data: string) => {
      let message = JSON.parse(data) as ChatMessage;
      this._messagesSubject.next(message);
    });

    this.socket.on('login-pass', (data: string) => {
      this._loginPassSubject.next(data);
    });

    this.socket.on('login-fail', (data: string) => {
      this._loginFailSubject.next(data);
    });

    this.socket.on('lobbyList', (data: string) => {
      this._lobbyListSubject.next(data);
    });

    this.socket.on('receive-start-draw', (data: string) => {
      this._drawingStartSubject.next(data);
    });

    this.socket.on('receive-update-draw', (data: string) => {
      this._drawingUpdateSubject.next(data);
    });

    this.socket.on('receive-finish-draw', (data: string) => {
      this._drawingEndSubject.next(data);
    });

    this.socket.on('receive-redraw-canvas', (data: string) => {
      this._redrawCanvasSubject.next(data);
    });

    this.socket.on('receive-update-background', (data: string) => {
      this._updateBackgroundubject.next(data);
    });

    this.socket.on('receive-new-channel', (data: string) => {
      this._updateChannelsSubject.next(data);
    })

    this.socket.on('receive-delete-channel', (data: string) => {
      this._deleteChannelSubject.next(data);
    })

    this.socket.on('lobbyAcces', (isAccept: boolean) => {
      this._lobbyResponseSubject.next(isAccept);
    });

    this.socket.on('hostJoinLobby', (gameId: number) => {
      this._hostLobbyResponseSubject.next(gameId + '');
    });

    this.socket.on('getTheGameData', (lobby: string) => {
      this._getLobbySubject.next(lobby);
    });

    this.socket.on('removeAllPlayers', (lobby: string) => {
      this._removeAllPlayersSubject.next(lobby);
    });

    this.socket.on('get-vote-kick', (voteKick: string) => {
      let parsed = JSON.parse(voteKick);
      this._getVoteKickSubject.next(parsed as VoteKick);
    });

    this.socket.on('end-vote-kick', () => {
      this._endVoteKickSubject.next();
    });

    this.socket.on('gameStart', () => {
      console.log('game started !');
      this._startGameSubject.next();
    });

    this.socket.on('nextDrawing', (data: string) => {
      this._nextPlayerSubject.next(data);
    });

    this.socket.on('drawingTurn', (drawingWord: string) => {
      this._drawingWordSubject.next(drawingWord);
    });

    this.socket.on('roundEnd', (nRound: string) => {
      this._nextRoundSubject.next(nRound);
    });

    this.socket.on("receiveClockTime", (newTime: string) => {
      this._newClockTimeSubject.next(newTime);
    });

    this.socket.on("receivePoints", (newPoints: string) => {
      this._newPointsSubject.next(newPoints);
    });

    this.socket.on("correctGuess", (newPoints: string) => {
      this._correctGuessSubject.next(newPoints);
    });

    this.socket.on("incorrectGuess", (newPoints: string) => {
      this._incorrectGuessSubject.next(newPoints);
    });

    this.socket.on("wordSuggestions", (words: string) => {
      this._wordSuggestionsSubject.next(words);
    })

    this.socket.on("receive-status", (statuses: string) => {
      this._statusSubject.next(statuses);
    })

    this.socket.on("receive-update-friends-list", () => {
      this._updateFriendsSubject.next();
    })

    this.socket.on("receive-update-friend-requests", () => {
      this._updateFriendRequestsSubject.next();
    })

    this.socket.on("endGame", (data: string) => {
      this._endGameSubject.next(data);
    });

    this.socket.on("recapGame", (data: string) => {
      this._recapGameSubject.next(data);
    });

    this.socket.on("receive-is-do-not-disturb", (isDoNotDisturb: boolean) => {
      this._doNotDisturbSubject.next(isDoNotDisturb)
    });

    this.socket.on("relaunch", (data: string) => {
      this._relaunchSubject.next(data);
    });

    this.socket.on("receive-reaction", (data: string) => {
      this._receiveReactionSubject.next(data);
    })

    this.socket.on("receivePopup",(data:string) => {
      this._popupSubject.next(data);
    })

    this.socket.on("receive-channels-list", (data: string) => {
      this._channelRequestSubject.next(data);
    })
  }

  emit(channel: string, data?: any) {
    data ? this.socket.emit(channel, data) : this.socket.emit(channel);
  }

  /* for closing the word modal */

  private _closeModalsOnSocketEventSubject = new Subject<void>();
  closeModalsOnSocketEventObservable: Observable<void> = this._closeModalsOnSocketEventSubject.asObservable();

  requestCloseModal(){
    this._closeModalsOnSocketEventSubject.next();
  }

}
