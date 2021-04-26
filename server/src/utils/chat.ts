export interface ChatMessage {
    username: string;
    date: any;
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