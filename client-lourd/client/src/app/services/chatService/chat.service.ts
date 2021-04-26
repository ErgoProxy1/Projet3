import { Injectable } from '@angular/core';
import { ChatChannel, ChatMessage } from 'src/app/components/game-zone/right-aside/chat/chat.component';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  globalMessages: ChatMessage[] = [];
  savedChannels: ChatChannel[] = [];
  savedJoinedChannels: string[] = [];
  
  keepHistoryToggled = false;

  isWindowChat = false;

  constructor() { }
}
