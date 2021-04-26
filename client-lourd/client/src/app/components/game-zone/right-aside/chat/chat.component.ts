import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { faExpandArrowsAlt, faMinus, faPaperPlane, faPlus } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/authService/auth.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { Subscription } from 'rxjs';
import { ElectronService } from 'src/app/services/electron/electron.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChannelCreationModalComponent } from 'src/app/components/channel-creation-modal/channel-creation-modal.component';
import { KeyboardService } from 'src/app/services/keyboard/keyboard.service';
import { TimeStamp } from 'src/app/services/utils/firebase-utils';
import { GameService } from 'src/app/services/gameService/game-service.service';
import { ChannelModalComponent } from 'src/app/components/channel-modal/channel-modal.component';
import { ChatService } from 'src/app/services/chatService/chat.service';


export interface ChatMessage {
  username: string;
  date: TimeStamp;
  formatedTime: string;
  text: string;
  channel_name: string;
  gameId: string;
}

export interface ChatChannel {
  gameId: string;
  name: string;
  messages: ChatMessage[];
  creator: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {

  faExpand = faExpandArrowsAlt;
  faSend = faPaperPlane;
  faPlus = faPlus;
  faMinus = faMinus;

  channels: ChatChannel[] = [];
  joinedChannels: string[] = [];
  curChannel: ChatChannel;
  activeChannels: number;
  curIndex: number;
  channelName: string;

  tempReceivedMessages: ChatMessage[] = [];

  showChat = true;

  @Input() isInAppWindow?= false;
  @Input() isInGameZone?= true;
  @Input() isInLobby?= false;

  @ViewChild("messagesContainer") messagesContainer: ElementRef;

  messagesSub: Subscription;
  channelsSub: Subscription;
  channelsRequestSub: Subscription;
  deleteSub: Subscription;

  showHistory = false;

  constructor(
    public auth: AuthService,
    private _socket: SocketService,
    private _electron: ElectronService,
    private _detector: ChangeDetectorRef,
    private _modal: NgbModal,
    public keyboard: KeyboardService,
    private _game: GameService,
    private _chatService: ChatService
  ) {
    if (this._electron.ipc) {
      this._electron.ipc.on('send-chat-data', (event, arg) => {
        this.auth.username = arg[0];
        this.auth.connectionTime = new TimeStamp(arg[7].seconds, arg[7].nanoseconds);
        this.channels = arg[1] as ChatChannel[];
        this.joinedChannels = arg[6];
        if (!this.curChannel) {
          this.curChannel = arg[2] as ChatChannel;
        } else {
          let curChannelName = arg[2].name;
          this.channels = arg[1];
          let channelToJoin = this.channels.find(c => c.name === curChannelName)
          if (channelToJoin) {
            this.curChannel = channelToJoin
          } else {
            this.curChannel = this.channels[0]
          }
        }
        this.activeChannels = arg[3];
        this.curIndex = arg[4];
        this._game.gameId = arg[5];
        if (this.channels.map(c => c.name).includes('Global')) { this.isInGameZone = false };
        this.tempReceivedMessages = [];
        this.updateDisplayMessages(this.showHistory);
        this._detector.detectChanges();
      });

      this._electron.ipc.on('send-chat-data-with-message', (event, arg) => {
        let curChannelName = arg[2].name;
        this.channels = arg[1];
        let channelToJoin = this.channels.find(c => c.name === curChannelName)
        if (channelToJoin) {
          this.curChannel = channelToJoin
        } else {
          this.curChannel = this.channels[0]
        }
        this.tempReceivedMessages = [];
        this.updateDisplayMessages(this.showHistory);
      });

      this._electron.ipc.on('receive-message-from-chat-window', (event, arg) => {
        this.sendMessage(arg)
      })

      this._electron.ipc.on('receive-create-channel-from-chat-window', (event, arg) => {
        this.doAddChannel(arg);
      })

      this._electron.ipc.on('receive-join-channel-from-chat-window', (event, arg) => {
        this.doJoinChannels(arg as string[])
      })

      this._electron.ipc.on('receive-update-to-chat-window', (event, arg) => {
        this.updateChannels(arg as ChatChannel);
      })

      this._electron.ipc.on('chat-closed', () => {
        this.showChat = true;
        this._chatService.isWindowChat = false;
        this.tempReceivedMessages = [];
        this.updateDisplayMessages(this.showHistory);
        this._detector.detectChanges();
      })

      this._electron.ipc.on('receive-leave-channel-from-chat-window', (event, arg) => {
        this.leaveChannel(arg as ChatChannel)
      })

      this._electron.ipc.on('post-request-chat-data', () => {
        if (this._electron.ipc) this._electron.ipc.send('response-chat-data', [this.auth.username, this.channels, this.curChannel, this.activeChannels, this.curIndex, this._game.gameId, this.joinedChannels, this.auth.connectionTime]);
      })

      this._electron.ipc.on('receive-switch-channel-from-window', (event, arg) => {
        this.onChangeChannel(arg);
      })
    }
  }

  ngOnInit(): void {
    if (this._chatService.isWindowChat) {
      this.showChat = false;
    }
    this.setupSocket();
    if (this.isInAppWindow) {
      this.showHistory = this._chatService.keepHistoryToggled;
    }
  }

  setupSocket() {
    this.messagesSub = this._socket.messagesObservable.subscribe((data: ChatMessage) => {
      if (data) {
        for (let channel of this.channels) {
          if (channel.name === data.channel_name && channel.gameId === data.gameId && data.username !== this.auth.username) {
            data.date = new TimeStamp(data.date.seconds, data.date.nanoseconds);
            data.formatedTime = this.formatDate(data.date);
            channel.messages.push(data);
            if (this.curChannel.name === channel.name) {
              this.tempReceivedMessages = [];
              this.updateDisplayMessages(this.showHistory);
            };
            if (this._electron.ipc) this._electron.ipc.send('send-to-chat-window', [this.auth.username, this.channels, this.curChannel, this.activeChannels, this.curIndex, this._game.gameId, data, this.joinedChannels])
            setTimeout(() => {
              if (this.messagesContainer) {
                this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
              }
            });
            break;
          }
        }
      }
    });

    this.channelsSub = this._socket.updateChannelsObservable.subscribe((data: string) => {
      const newChannel: ChatChannel = JSON.parse(data);
      if (newChannel.gameId === this._game.gameId) {
        this.updateChannels(newChannel);
        if (this._electron.ipc) this._electron.ipc.send('send-update-to-chat-window', newChannel);
      }
    });

    this.channelsRequestSub = this._socket.channelRequestObservable.subscribe((data: string) => {
      let parsedData: any = JSON.parse(data);
      let channelsList = parsedData.channels as ChatChannel[];
      let joinedChannelsList = parsedData.joined as string[];
      this.channels = [...channelsList];
      this.joinedChannels = joinedChannelsList;
      this.curChannel = this.channels[0];
      this.tempReceivedMessages = [];
      this.updateDisplayMessages(this.showHistory);
      if (this._chatService.isWindowChat) {
        if (this._electron.ipc) this._electron.ipc.send('response-chat-data', [this.auth.username, this.channels, this.curChannel, this.activeChannels, this.curIndex, this._game.gameId, this.joinedChannels, this.auth.connectionTime]);
      }
    })

    this.deleteSub = this._socket.deleteChannelObservable.subscribe((data) => {
      let parsedData: any = JSON.parse(data);
      if (this._game.gameId === parsedData.gameId) {
        this.channels = this.channels.filter(c => c.name !== parsedData.channel_name)
      }
    })

    if (this.isInAppWindow) {
      this._socket.emit("request-init-channels", JSON.stringify({ gameId: this._game.gameId, sender: this.auth.username }))
    } else {
      if (this._electron.ipc) {
        this._electron.ipc.send('request-chat-data');
      }
    }
  }

  ngOnDestroy() {
    this.messagesSub.unsubscribe();
    this.channelsSub.unsubscribe();
    this.channelsRequestSub.unsubscribe();
    this.deleteSub.unsubscribe();

    if (this._electron.ipc) {
      this._electron.ipc.removeAllListeners('send-chat-data');
      this._electron.ipc.removeAllListeners('send-chat-data-with-message');
      this._electron.ipc.removeAllListeners('receive-message-from-chat-window');
      this._electron.ipc.removeAllListeners('receive-create-channel-from-chat-window');
      this._electron.ipc.removeAllListeners('receive-join-channel-from-chat-window');
      this._electron.ipc.removeAllListeners('receive-delete-channel-from-chat-window');
      this._electron.ipc.removeAllListeners('receive-update-to-chat-window');
      this._electron.ipc.removeAllListeners('receive-delete-to-chat-window');
      this._electron.ipc.removeAllListeners('chat-closed');
      this._electron.ipc.removeAllListeners('receive-leave-channel-from-chat-window');
      this._electron.ipc.removeAllListeners('post-request-chat-data');
      this._electron.ipc.removeAllListeners('receive-switch-channel-from-window');
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    });
  }

  onChangeChannel(channel: ChatChannel) {
    let index = this.channels.map(c => c.name).indexOf(channel.name);
    if (index > -1) {
      if(!this.isInAppWindow && this._electron.ipc) this._electron.ipc.send('switch-channel-from-window', this.channels[index]);
      this.curIndex = index;
      this.curChannel = this.channels[index];
      this.tempReceivedMessages = [];
      this.updateDisplayMessages(this.showHistory);
      setTimeout(() => {
        if (this.messagesContainer) {
          this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
        }
      });
    }
  }

  sendMessage(message: string) {
    if (message.length > 0 && message.replace(/\s/g, '').length > 0) {
      let date = TimeStamp.now();
      let newMessage: ChatMessage = { username: this.auth.username, gameId: this._game.gameId, date: date, text: message, channel_name: this.curChannel.name, formatedTime: this.formatDate(date) };
      this.curChannel.messages.push(newMessage);
      this.tempReceivedMessages = [];
      this.updateDisplayMessages(this.showHistory);
      setTimeout(() => {
        if (this.messagesContainer) {
          this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
        }
      });
      if (this.isInAppWindow) {
        this._socket.emit('message', JSON.stringify(newMessage));
        if (this.isInGameZone) {
          this._chatService.savedChannels = [...this.channels];
        } else {
          this._chatService.globalMessages = this.curChannel.messages;
        }
      } else if (this._electron.ipc) {
        this._electron.ipc.send('send-message-from-chat-window', message);
      }
    }
  }

  openChatWindow() {
    if (this._electron.ipc) this._electron.ipc.send('openChatWindow');
    this.showChat = false;
    this._detector.detectChanges();
    if (this.isInAppWindow) {
      this._chatService.isWindowChat = true;
    }
  }

  closeChatWindow() {
    if (this._electron.ipc) this._electron.ipc.send('closeChatWindow', [this.auth.username, this.channels, this.curChannel, this.activeChannels, this.curIndex, this._game.gameId, this.joinedChannels]);
  }

  formatDate(date: TimeStamp) {
    let curDate = new TimeStamp(date.seconds, date.nanoseconds);
    return curDate.toDate().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  updateChannels(newChannel: ChatChannel) {
    if (newChannel.creator !== this.auth.username) {
      this.activeChannels++;
      if (newChannel.name) {
        this.channels.push(newChannel);
        this._chatService.savedChannels = [...this.channels];
      }
    }
  }

  addChannel() {
    this.keyboard.modalWindowActive = true;
    this.keyboard.inputFocusedActive = true;
    const modal = this._modal.open(ChannelCreationModalComponent, { backdrop: 'static', centered: true, keyboard: true });
    modal.componentInstance.channels = this.channels;
    modal.result.then((channelName) => {
      this.keyboard.modalWindowActive = false;
      this.keyboard.inputFocusedActive = false;
      this.doAddChannel(channelName);
    }).catch(() => {
      this.keyboard.modalWindowActive = false;
      this.keyboard.inputFocusedActive = false;
    })
  }

  doAddChannel(channelName: string) {
    this.channelName = channelName;
    this.activeChannels++;
    this.channels.push({ gameId: this._game.gameId, name: this.channelName, messages: [], creator: this.auth.username });
    this.curChannel = this.channels[this.channels.length - 1];
    this.joinedChannels.push(this.curChannel.name);

    this._chatService.savedChannels = [...this.channels];
    this.tempReceivedMessages = [];
    this.updateDisplayMessages(this.showHistory);
    if (this.isInAppWindow) {
      this._socket.emit("send-new-channel", JSON.stringify(this.curChannel));
    } else if (this._electron.ipc) {
      this._electron.ipc.send('create-channel-from-chat-window', channelName)
    }
  }

  joinChannel() {
    const modal = this._modal.open(ChannelModalComponent, { backdrop: 'static', centered: true, keyboard: true });
    this.keyboard.modalWindowActive = true;
    modal.componentInstance.channels = this.channels;
    modal.componentInstance.joined = this.joinedChannels;
    modal.result.then((joinedChannels: string[]) => {
      this.doJoinChannels(joinedChannels);
      this.keyboard.modalWindowActive = false;
    }).catch(() => {
      this.keyboard.modalWindowActive = false;
    })
  }

  doJoinChannels(joinedChannels: string[]) {
    let channelNames = this.channels.map(c => c.name);
    for (let jc of joinedChannels) {
      if (channelNames.includes(jc)) {
        this.joinedChannels.push(jc);
        if (this.isInAppWindow) {
          this._socket.emit('user-joined-channel', JSON.stringify({ gameId: this._game.gameId, channel_name: jc }))
        }
      }
    }
    let channelToSwitchTo = this.channels.find(c => c.name === this.joinedChannels[this.joinedChannels.length - 1])
    if (channelToSwitchTo) {
      this.curChannel = channelToSwitchTo;
    }
    this.tempReceivedMessages = [];
    this.updateDisplayMessages(this.showHistory);
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    });
    if (this._electron.ipc && !this.isInAppWindow) {
      this._electron.ipc.send('join-channel-from-chat-window', joinedChannels);
    }
  }

  updateShowHistory(show: boolean) {
    this._chatService.keepHistoryToggled = show;
    this.tempReceivedMessages = [];
    this.updateDisplayMessages(show);
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    });
  }

  updateDisplayMessages(show: boolean) {
    if (show) {
      this.tempReceivedMessages = this.curChannel.messages;
      for(let message of this.tempReceivedMessages){
        message.formatedTime = this.formatDate(new TimeStamp(message.date.seconds, message.date.nanoseconds));
      }
    } else {
      this.tempReceivedMessages = this.curChannel.messages.filter(m => {
        let date = new TimeStamp(m.date.seconds, m.date.nanoseconds);
        return date.toMillis() >= this.auth.connectionTime.toMillis()
      })
      for(let message of this.tempReceivedMessages){
        message.formatedTime = this.formatDate(new TimeStamp(message.date.seconds, message.date.nanoseconds));
      }
      this._detector.detectChanges();
    }
  }

  leaveChannel(leftChannel: ChatChannel) {
    this.joinedChannels = this.joinedChannels.filter(c => c !== leftChannel.name)
    if (this.isInAppWindow) {
      this._socket.emit('user-left-channel', JSON.stringify({ gameId: this._game.gameId, channel_name: leftChannel.name }))
    } else if (this._electron.ipc) {
      this._electron.ipc.send('leave-channel-from-chat-window', leftChannel)
    }
    this.curChannel = this.channels[0];
    this.tempReceivedMessages = [];
    this.updateDisplayMessages(this.showHistory);
  }
}
