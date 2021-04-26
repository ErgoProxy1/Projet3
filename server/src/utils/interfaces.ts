export interface Team {
    users: string[];
    points: number;
    hasBot: boolean;
}

export interface VoteKick {
    gameId: number;
    user: string;
    votes: number;
    rejections: number;
}

export interface Bot {
    name: string;
    personality: number;
}

export interface TurnRecap {
    playerWhoDraw: string;
    word: string;
    round: number;
    playersWhoGuess: string[];
    svg: any[];
    backgroundColor: any;
}