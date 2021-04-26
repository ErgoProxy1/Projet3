import { Socket } from "socket.io";
import * as fire from 'firebase/app'
import firebase from "firebase";
import { interval } from "rxjs";
import { Team, TurnRecap, VoteKick } from "./interfaces"
import { Clock } from "./clock";
import { Statistics } from "./statistics";
import { GameHistory } from "./gameHistory";
import { BOTS_LIST, BOT_GUESS_MESSAGE, BOT_START_MESSAGES, BOT_OTHER_GUESS_MESSAGE, BOT_NEXT_TURN_MESSAGE, BOT_TIMEOUT_MESSAGE, BOT_VICTORY_MESSAGE, BOT_DEFEAT_MESSAGE, BOT_SECOND_TIMEOUT_MESSAGE } from './bots'
import { pointsOnPath } from "./pointsOnPath";
import { Server } from "socket.io";
import { ChatChannel, ChatMessage } from "./chat";

const MILLISECONDS_IN_A_SECOND = 1000;
const BASE_TURN_DURATION = 60;
const MAX_USERS_IN_CLASSIC = 4;
const MAX_USERS_IN_FFA = 8;
const MIN_USERS_IN_FFA = 3;
const MAX_ROUND_FFA = 3;
const MAX_ROUND_CLASSIC = 4;
const MAX_POINTS = 5;
const NUMBER_OF_SUGGESTIONS = 3;


var test: string[] = [];

export class TimeStamp extends fire.default.firestore.Timestamp { };

export class Pair {
    word: string
    hints: string[]

    constructor(word: string, hints: string[]) {
        this.word = word;
        this.hints = hints;
    }
}

export class Game {
    gameId: number;
    gameMode: number; // 0 -> classique, 1 -> chacun pour soi
    hasPowerUps: boolean;
    isStarted: boolean;
    difficulty: number; // 0 -> facile, 1 -> normale, 2 -> difficile
    host: string;
    userPlaying: string;
    users: string[];
    password?: string;
    roundCounter: number;
    teamPlaying: Team;
    teamsWaiting: Team[];
    wordsAlreadyUsed: string[];
    currentWord: string;
    teams: Team[];
    interruptBot: boolean = false;
    finishedInterruption: boolean = false;
    isInRelaunch: boolean = false;
    isOver: boolean = false;
    correctGuesses: number;
    winners: string[];
    start: TimeStamp;
    end: TimeStamp;
    turnsRecap: TurnRecap[];
    clockDifMod = 1;
    readyCount = 0;
    botPlayCount: number = 0; //counts the number of times a bot drew to allow him to draw twice in a row
    chatChanels: ChatChannel[] = [];
    channelParticipants = {};


    constructor(gameId: number, gameMode: number, hasPowerUps: boolean, difficulty: number, host: string, password?: string,) {
        this.gameId = gameId;
        this.gameMode = gameMode;
        this.hasPowerUps = hasPowerUps;
        this.isStarted = false;
        this.difficulty = difficulty;
        this.host = host;
        this.userPlaying = host;
        this.users = [this.host];
        this.password = password;
        this.roundCounter = 1;
        this.teamsWaiting = [];
        this.wordsAlreadyUsed = new Array<string>();
        this.currentWord = "";
        this.teams = [];
        for (let i = 0; i < 2; i++) {
            this.teams.push({ users: [], points: 0, hasBot: false })
        }
        this.correctGuesses = 0;
        this.winners = [];
        this.turnsRecap = [];
    }

    initTurnRecap() {
        this.turnsRecap.push({ playerWhoDraw: this.userPlaying, playersWhoGuess: [], round: this.roundCounter, word: this.currentWord, svg: [], backgroundColor: "{\"rgbaTextForm\":\"none\",\"r\":255,\"g\":255,\"b\":255,\"a\":255}" });
    }

    saveGuesserForGameRecap(user: string) {
        this.turnsRecap[this.turnsRecap.length - 1].playersWhoGuess.push(user);
    }
}

export class GameManager {
    public io: Server;
    private db: firebase.app.App
    private gameId: number;
    private gamesInLobbyList: Game[];
    private activeGamesList: Game[];
    private voteKicks: VoteKick[];
    private clocks: {};
    private stat: Statistics;
    private gameHisto: GameHistory;
    private wordsEasy: Pair[];
    private wordsNormal: Pair[];
    private wordsHard: Pair[];
    private globalChatChannels: ChatChannel[] = [{ gameId: '', name: 'Global', messages: [], creator: '' }];

    constructor(io: any, fireDb: firebase.app.App) {
        this.io = io;
        this.db = fireDb;
        this.stat = new Statistics(fireDb);
        this.gameHisto = new GameHistory(fireDb);
        this.gameId = 0;
        this.gamesInLobbyList = new Array<Game>();
        this.activeGamesList = new Array<Game>();
        this.voteKicks = new Array<VoteKick>();
        this.clocks = {};
        this.wordsEasy = [];
        this.wordsNormal = [];
        this.wordsHard = [];
        this.getWordsFromDatabase();
    }

    initializeClock(socket: Socket, gameId: number, users: any) {
        console.log('clock was initialized !');
        const targetClock = this.clocks[gameId];
        targetClock.clockInterval = setInterval(() => {
            const targetGame = this.activeGamesList.find((game) => game.gameId === gameId);
            if (targetGame) {

                if (targetGame.users.length === 0) {
                    targetClock.clockIsSuspended = true;
                    clearInterval(targetClock.clockInterval);
                }

                if (targetClock.secondsRemaining > 0 && !targetClock.clockIsSuspended && targetGame.users.length !== 0) {
                    targetClock.secondsRemaining--;
                    this.io.to("game" + gameId).emit('receiveClockTime', JSON.stringify(targetClock.secondsRemaining));
                }

                if (targetClock.secondsRemaining <= 0 && !targetClock.clockIsSuspended && targetGame.users.length !== 0) {
                    if (targetGame.gameMode === 0 && targetGame.correctGuesses === 0 && !targetGame.isInRelaunch) {
                        targetGame.isInRelaunch = true;
                        if (targetGame.teamPlaying.hasBot) {
                            const bot = targetGame.teamPlaying.users.find((u) => BOTS_LIST.map(b => b.name).includes(u));
                            if (bot) {
                                this.sendBotMessage(targetGame.gameId.toString(), bot, BOT_TIMEOUT_MESSAGE);
                            }
                        }
                    }
                    else if (targetGame.gameMode === 0 && targetGame.isInRelaunch) {
                        targetGame.isInRelaunch = false;
                        // emits relaunch with no data to tell clients relaunch is over
                        this.io.to("game" + targetGame.gameId).emit("relaunch");
                        if (targetGame.teamPlaying.hasBot) {
                            const bot = targetGame.teamPlaying.users.find((u) => BOTS_LIST.map(b => b.name).includes(u));
                            if (bot) {
                                this.sendBotMessage(targetGame.gameId.toString(), bot, BOT_SECOND_TIMEOUT_MESSAGE);
                            }
                        }
                    }
                    targetGame.interruptBot = true;
                    this.turnTransition(socket, targetGame, targetClock, users);
                }
            }

        }, MILLISECONDS_IN_A_SECOND);
    }

    createGame(socket: Socket, users: any, gameCreationData: string) {
        const newGameIndex = this.gamesInLobbyList.findIndex((game: Game) => {
            game.host === users[socket.id];
        })
        if (newGameIndex !== -1) {
            this.gamesInLobbyList.splice(newGameIndex, 1);
            console.log(`Lobby created by ${users[socket.id]} has been deleted`);
            this.io.emit("lobbyList", JSON.stringify(this.gamesInLobbyList));
        }
        const newGameData = JSON.parse(gameCreationData);
        const newGame = new Game(this.gameId++, newGameData.gameMode, newGameData.gotPower, newGameData.difficulty, newGameData.host, newGameData.password);
        newGame.chatChanels.push({ gameId: newGame.gameId + '', name: 'Tous', messages: [], creator: '' })
        newGame.teams[0].users.push(newGame.host);
        newGame.channelParticipants[newGame.chatChanels[0].name] = [newGame.host];
        this.gamesInLobbyList.push(newGame);
        if (newGame.difficulty === 0) {
            newGame.clockDifMod = 1.3;
        } else if (newGame.difficulty === 2) {
            newGame.clockDifMod = 0.7;
        }
        this.clocks[newGame.gameId] = new Clock(Math.floor(BASE_TURN_DURATION * newGame.clockDifMod));
        console.log(`A new game created by ${users[socket.id]} with the id: ${newGame.gameId}`);
        this.io.emit("lobbyList", JSON.stringify(this.gamesInLobbyList));
        socket.join("game" + newGame.gameId.toString());
        this.io.to("game" + newGame.gameId).emit("hostJoinLobby", newGame.gameId);
    }

    requestLobbyList(socket: Socket, users: any) {
        console.log(`${users[socket.id]} has request the lobby list`);
        this.io.emit("lobbyList", JSON.stringify(this.gamesInLobbyList));
    }

    joinLobby(socket: Socket, users: any, gameId: string) {
        let gameToJoin: Game;
        if (users[socket.id]) {
            for (let i = 0; i < this.gamesInLobbyList.length; i++) {
                if (this.gamesInLobbyList[i].gameId.toString() === gameId) {
                    gameToJoin = this.gamesInLobbyList[i];
                }
            }
            if (!gameToJoin.users.includes(users[socket.id])) {
                if (gameToJoin && ((gameToJoin.gameMode === 0 && gameToJoin.users.length < MAX_USERS_IN_CLASSIC) || (gameToJoin.gameMode === 1 && gameToJoin.users.length < MAX_USERS_IN_FFA))) {
                    socket.join("game" + gameId);
                    gameToJoin.users.push(users[socket.id]);
                    gameToJoin.channelParticipants[gameToJoin.chatChanels[0].name].push(users[socket.id]);
                    if (gameToJoin.gameMode === 0) {
                        if (gameToJoin.teams[0].users.length < 2) {
                            gameToJoin.teams[0].users.push(users[socket.id]);
                        } else if (gameToJoin.teams[1].users.length < 2) {
                            gameToJoin.teams[1].users.push(users[socket.id]);
                        }
                    }
                    this.io.to("game" + gameId).emit("lobbyAcces", true);
                    console.log(`${users[socket.id]} has joined lobby with id ${gameId}`);
                }

                if (gameToJoin && !((gameToJoin.gameMode === 0 && gameToJoin.users.length < MAX_USERS_IN_CLASSIC) || (gameToJoin.gameMode === 1 && gameToJoin.users.length < MAX_USERS_IN_FFA))) {
                    socket.emit("lobbyAcces", false);
                    console.log(`Lobby with id ${gameId} is full`);
                }

                if (!gameToJoin) {
                    socket.emit("lobbyAcces", false);
                    console.log(`${users[socket.id]} attempted to join a lobby that does not exist`);
                }
                this.io.emit("lobbyList", JSON.stringify(this.gamesInLobbyList));
            }
        }
    }

    requestGameData(gameId: string, isActiveGame: boolean) {
        const targetGame = isActiveGame ? this.activeGamesList.find((lobby: Game) => lobby.gameId.toString() === gameId) : this.gamesInLobbyList.find((lobby: Game) => lobby.gameId.toString() === gameId);
        if (targetGame) this.io.to("game" + gameId).emit("getTheGameData", JSON.stringify(targetGame));
    }

    removeUserFromGame(socket: Socket, users: any, gameId: string, targetUsername: string, inActiveGame: boolean) {
        const targetGameIndex = inActiveGame ? this.activeGamesList.findIndex((lobby: Game) => lobby.gameId.toString() === gameId) : this.gamesInLobbyList.findIndex((lobby: Game) => lobby.gameId.toString() === gameId);
        if (targetGameIndex !== -1) {
            const game = this.activeGamesList[targetGameIndex];
            if (game) {
                var team = game.teams.find(t => t.users.includes(targetUsername));
                var teamHasBot = team ? team.hasBot : false;
            }
            if (inActiveGame ? game.users.find((user => user === targetUsername)) : this.gamesInLobbyList[targetGameIndex].users.find((user => user === targetUsername))) {
                if (inActiveGame) {
                    //retirer les bots
                    if (BOTS_LIST.map(b => b.name).includes(targetUsername)) {
                        if (game.teams[0].users.includes(targetUsername)) {
                            console.log('removed bot team 1');
                            game.teams[0].hasBot = false;
                        } else if (game.teams[1].users.includes(targetUsername)) {
                            console.log('removed bot team 2');
                            game.teams[1].hasBot = false;
                        }
                    }
                    game.users = game.users.filter(user => user !== targetUsername);

                    //remove player from waiting teams
                    for (let team of game.teamsWaiting) {
                        team.users = team.users.filter(u => u !== targetUsername);
                        const teamIndex = game.teamsWaiting.findIndex(t => t === team);
                        if (team.users.length === 0) {
                            game.teamsWaiting.splice(teamIndex, 1);
                        }
                    }

                    //remove player from his team
                    for (let team of game.teams) {
                        team.users = team.users.filter(u => u !== targetUsername);
                        const teamIndex = game.teams.findIndex(t => t === team);
                        // delete team if it no longer has players
                        if (team.users.length === 0) {
                            game.teams.splice(teamIndex, 1);
                        }
                    }

                    if (game.gameMode === 0 && !team.hasBot) {
                        const teamateUsername = team.users.find(u => u !== targetUsername);
                        const teamIndex = game.teams[0] === team ? 0 : 1;
                        const opposingTeam = game.teams[0] === team ? game.teams[1] : game.teams[0];
                        const botToAdd = opposingTeam.users.includes(BOTS_LIST[0].name) ? BOTS_LIST[1].name : BOTS_LIST[0].name;
                        this.addBotToTeam(JSON.stringify({ gameId: game.gameId, team: teamIndex, botName: botToAdd }));
                        const message = `${botToAdd} a été ajouté à votre équipe en raison du départ de ${targetUsername}`;
                        this.io.to(this.getSocketId(teamateUsername, users)).emit("receivePopup", JSON.stringify(message));
                    }

                    // if it was the leaving player's turn to play, move on to the next player
                    if ((game.userPlaying === targetUsername || game.gameMode === 0) && game.host !== targetUsername) {
                        const clock = this.clocks[game.gameId];
                        this.turnTransition(socket, game, clock, users);
                    }

                } else {
                    //remove bots
                    if (BOTS_LIST.map(b => b.name).includes(targetUsername)) {
                        if (this.gamesInLobbyList[targetGameIndex].teams[0].users.includes(targetUsername)) {
                            console.log('removed bot team 1');
                            this.gamesInLobbyList[targetGameIndex].teams[0].hasBot = false;
                        } else if (this.gamesInLobbyList[targetGameIndex].teams[1].users.includes(targetUsername)) {
                            console.log('removed bot team 2');
                            this.gamesInLobbyList[targetGameIndex].teams[1].hasBot = false;
                        }
                    }
                    this.gamesInLobbyList[targetGameIndex].users = this.gamesInLobbyList[targetGameIndex].users.filter(user => user !== targetUsername);
                    //remove player from his team
                    this.gamesInLobbyList[targetGameIndex].teams[0].users = this.gamesInLobbyList[targetGameIndex].teams[0].users.filter(u => u !== targetUsername)
                    this.gamesInLobbyList[targetGameIndex].teams[1].users = this.gamesInLobbyList[targetGameIndex].teams[1].users.filter(u => u !== targetUsername)
                }
            }
            if (inActiveGame ? this.activeGamesList[targetGameIndex] : this.gamesInLobbyList[targetGameIndex]) {

                if (inActiveGame ? this.activeGamesList[targetGameIndex].users.includes(this.activeGamesList[targetGameIndex].host) : this.gamesInLobbyList[targetGameIndex].users.includes(this.gamesInLobbyList[targetGameIndex].host)) {
                    this.io.to("game" + gameId).emit("getTheGameData", JSON.stringify(inActiveGame ? this.activeGamesList[targetGameIndex] : this.gamesInLobbyList[targetGameIndex]));
                    //if the player count is below the minimum in FFA, end the game
                    if (game) {
                        if ((game.gameMode === 1 && game.users.length < MIN_USERS_IN_FFA) || (game.gameMode === 0 && teamHasBot)) {
                            const message = `La partie s'est terminée en raison d'un nombre insuffisant de joueurs`;
                            game.isOver = true;
                            game.interruptBot = true;
                            this.io.to("game" + game.gameId).emit("removeAllPlayers", JSON.stringify({ game: game, message: message }));
                            for (let user of game.users) {
                                let socketId = Object.keys(users).find(id => users[id] === user);
                                if (socketId) {
                                    let socketToRemove = this.io.sockets.sockets.get(socketId)
                                    socketToRemove.leave("game" + gameId);
                                }
                            }
                            this.activeGamesList.splice(targetGameIndex, 1);
                            console.log(`Cancelled game created by ${game.host} due to insufficient player count`);
                            this.io.emit("lobbyList", JSON.stringify(this.activeGamesList));
                        }
                    }
                }

                else {
                    let socketId = Object.keys(users).find(id => users[id] === targetUsername);
                    if (socketId) {
                        let socketToRemove = this.io.sockets.sockets.get(socketId)
                        this.clearUserGameActivity(socketToRemove, users);
                    }
                }
            }
            let socketId = Object.keys(users).find(id => users[id] === targetUsername);
            if (socketId) {
                let socketToRemove = this.io.sockets.sockets.get(socketId)
                socketToRemove.leave("game" + gameId);
            }
        }

        this.voteKicks = this.voteKicks.filter(vote => vote.user !== targetUsername);
        this.io.to("game" + gameId).emit("end-vote-kick");
        this.io.emit("lobbyList", JSON.stringify(this.gamesInLobbyList));
    }

    clearUserGameActivity(socket: Socket, users: any) {
        let targetGameIndex: number = this.gamesInLobbyList.findIndex((game: Game) => game.host === users[socket.id]);
        let activeTargetGameIndex: number = this.activeGamesList.findIndex((game: Game) => game.host === users[socket.id])
        //If in game lobby
        if (targetGameIndex !== -1) { //is host
            const game = this.gamesInLobbyList[targetGameIndex];
            const message = `La partie de ${game.host} s'est terminée en raison du départ de l'hôte`;
            this.io.to("game" + this.gamesInLobbyList[targetGameIndex].gameId).emit("removeAllPlayers", JSON.stringify({ game: game, message: message }))
            socket.leave("game" + this.gamesInLobbyList[targetGameIndex].gameId);
            this.gamesInLobbyList.splice(targetGameIndex, 1);
            console.log(`Cancelled game created by ${users[socket.id]} due to host departure`);
            this.io.emit("lobbyList", JSON.stringify(this.gamesInLobbyList));

        }

        else { //is not host
            targetGameIndex = this.gamesInLobbyList.findIndex((game: Game) => game.users.includes(users[socket.id]));
            if (targetGameIndex !== -1) {
                this.gamesInLobbyList[targetGameIndex].users = this.gamesInLobbyList[targetGameIndex].users.filter(user => user !== users[socket.id]);
                this.gamesInLobbyList[targetGameIndex].teams[0].users = this.gamesInLobbyList[targetGameIndex].teams[0].users.filter(u => u !== users[socket.id])
                this.gamesInLobbyList[targetGameIndex].teams[1].users = this.gamesInLobbyList[targetGameIndex].teams[1].users.filter(u => u !== users[socket.id])
                this.io.to("game" + this.gamesInLobbyList[targetGameIndex].gameId).emit("getTheGameData", JSON.stringify(this.gamesInLobbyList[targetGameIndex]));
                socket.leave("game" + this.gamesInLobbyList[targetGameIndex].gameId);
            }
        }

        this.io.emit("lobbyList", JSON.stringify(this.gamesInLobbyList));

        //If in active game
        if (activeTargetGameIndex !== -1) { //is host
            const game = this.activeGamesList[activeTargetGameIndex];
            game.isOver = true;
            game.interruptBot = true;
            console.log(`boolean was set to: ${game.isOver}`);
            const message = `La partie de ${game.host} s'est terminée en raison du départ de l'hôte`;
            this.io.to("game" + this.activeGamesList[activeTargetGameIndex].gameId).emit("removeAllPlayers", JSON.stringify({ game: game, message: message }));
            socket.leave("game" + this.activeGamesList[activeTargetGameIndex].gameId);
            this.activeGamesList.splice(activeTargetGameIndex, 1);
            console.log(`Cancelled game created by ${users[socket.id]} due to host departure`);
            this.io.emit("lobbyList", JSON.stringify(this.activeGamesList));
        }

        else { //is not host
            activeTargetGameIndex = this.activeGamesList.findIndex((game: Game) => game.users.includes(users[socket.id]));
            if (activeTargetGameIndex !== -1) {
                const game = this.activeGamesList[activeTargetGameIndex];
                const username = users[socket.id];
                const team = game.teams.find(t => t.users.includes(username));

                game.users = game.users.filter(u => u !== username);

                //remove player from waiting teams
                for (let team of game.teamsWaiting) {
                    team.users = team.users.filter(u => u !== username);
                    const teamIndex = game.teamsWaiting.findIndex(t => t === team);
                    if (team.users.length === 0) {
                        game.teamsWaiting.splice(teamIndex, 1);
                    }
                }

                //remove player from his team
                for (let team of game.teams) {
                    team.users = team.users.filter(u => u !== username);
                    const teamIndex = game.teams.findIndex(t => t === team);
                    // delete team if it no longer has players
                    if (team.users.length === 0) {
                        game.teams.splice(teamIndex, 1);
                    }
                }

                this.io.to("game" + this.activeGamesList[activeTargetGameIndex].gameId).emit("getTheGameData", JSON.stringify(this.activeGamesList[activeTargetGameIndex]));
                socket.leave("game" + this.activeGamesList[activeTargetGameIndex].gameId);

                if ((game.gameMode === 1 && game.users.length < MIN_USERS_IN_FFA) || (game.gameMode === 0 && team.hasBot)) {
                    game.isOver = true;
                    game.interruptBot = true;
                    const message = `La partie s'est terminée en raison d'un nombre insuffisant de joueurs`;
                    this.io.to("game" + game.gameId).emit("removeAllPlayers", JSON.stringify({ game: game, message: message }));
                    socket.leave("game" + game.gameId);
                    this.activeGamesList.splice(targetGameIndex, 1);
                    console.log(`Cancelled game created by ${game.host} due to insufficient player count`);
                    this.io.emit("lobbyList", JSON.stringify(this.activeGamesList));
                }

                if (game.gameMode === 0 && !team.hasBot) {
                    const teamateUsername = team.users.find(u => u !== username);
                    const teamIndex = game.teams[0] === team ? 0 : 1;
                    const opposingTeam = game.teams[0] === team ? game.teams[1] : game.teams[0];
                    const botToAdd = opposingTeam.users.includes(BOTS_LIST[0].name) ? BOTS_LIST[1].name : BOTS_LIST[0].name;
                    this.addBotToTeam(JSON.stringify({ gameId: game.gameId, team: teamIndex, botName: botToAdd }));
                    const message = `${botToAdd} a été ajouté à votre équipe en raison du départ de ${username}`;
                    this.io.to(this.getSocketId(teamateUsername, users)).emit("receivePopup", JSON.stringify(message))
                }

                if (game.userPlaying === username || game.gameMode === 0) {
                    const clock = this.clocks[game.gameId];
                    this.turnTransition(socket, game, clock, users);
                }

            }
        }
    }

    voteKick(socket: Socket, users: any, gameId: string, targetUsername: string, action: string, isActiveGame: boolean) {
        const voteKick = this.voteKicks.find((vote: VoteKick) => vote.gameId.toString() === gameId);
        const game = isActiveGame ? this.activeGamesList.find((game: Game) => game.gameId.toString() === gameId) : this.gamesInLobbyList.find((game: Game) => game.gameId.toString() === gameId);

        if (voteKick) {
            action === 'vote' ? voteKick.votes++ : voteKick.rejections++;
            if (voteKick.votes > game.users.length / 2) {
                this.removeUserFromGame(socket, users, gameId, targetUsername, isActiveGame);
            } else if (voteKick.rejections >= (game.users.length - (Math.floor(game.users.length / 2) + 1))) {
                this.voteKicks = this.voteKicks.filter(vote => vote.user !== targetUsername);
                this.io.to("game" + gameId).emit("end-vote-kick");
            } else {
                this.io.to("game" + gameId).emit("get-vote-kick", JSON.stringify(voteKick));
            }
        } else if (game) {
            this.voteKicks.push({ gameId: +gameId, user: targetUsername, votes: 1, rejections: 0 });
            this.io.to("game" + gameId).emit("get-vote-kick", JSON.stringify(this.voteKicks[this.voteKicks.length - 1]));
        } else {
            console.log(`Attempted to vote kick player ${targetUsername} in non-existant vote`)
        }
    }


    loadGame(socket: Socket, users: any, gameId: string) {
        const targetGameIndex = this.gamesInLobbyList.findIndex((lobby: Game) => lobby.gameId.toString() === gameId);
        if (targetGameIndex !== -1) {
            const gameToLoad = this.gamesInLobbyList[targetGameIndex];
            this.assignFfaTeams(targetGameIndex);
            gameToLoad.teamPlaying = gameToLoad.teams[0];
            gameToLoad.start = TimeStamp.now();
            if (gameToLoad.gameMode === 1) {
                gameToLoad.teamsWaiting = gameToLoad.teams;
                gameToLoad.teamsWaiting = gameToLoad.teamsWaiting.filter(team => !team.users.includes(gameToLoad.host));
            }
            else {
                gameToLoad.teamsWaiting = [];
                gameToLoad.teamsWaiting.push(gameToLoad.teams[1]);
                if (gameToLoad.teamPlaying.hasBot) {
                    const bot = gameToLoad.teamPlaying.users.find((u) => BOTS_LIST.map(b => b.name).includes(u));
                    if (bot) {
                        gameToLoad.userPlaying = bot;
                    }
                }
            }
            gameToLoad.isStarted = true;

            this.activeGamesList.push(gameToLoad);
            this.gamesInLobbyList.splice(targetGameIndex, 1);
            this.io.emit("lobbyList", JSON.stringify(this.gamesInLobbyList));
            this.io.to("game" + gameId).emit("gameStart");
        }
    }

    awaitGameStart(socket: Socket, users: any, gameId: string) {
        let gameToLoad = this.activeGamesList.find((lobby: Game) => lobby.gameId.toString() === gameId);
        if (gameToLoad) {
            gameToLoad.readyCount++;
            let botCount = 0;
            for (let team of gameToLoad.teams) {
                if (team.hasBot) {
                    botCount++;
                }
            }
            if (gameToLoad.readyCount >= gameToLoad.users.length - botCount) {
                const suggestedPairs = this.generateWordSuggestions(gameToLoad);
                if (!gameToLoad.teamPlaying.hasBot) {
                    this.io.to("game" + gameToLoad.gameId).emit("wordSuggestions", JSON.stringify({ pairs: suggestedPairs, user: gameToLoad.userPlaying }));
                }
                else {
                    //Send bot init message
                    setTimeout(() => {
                        if (BOTS_LIST.map(b => b.name).includes(gameToLoad.userPlaying)) {
                            this.sendBotMessage(gameToLoad.gameId.toString(), gameToLoad.userPlaying, BOT_START_MESSAGES);
                        }
                        this.pickAndDrawWord(socket, gameToLoad.gameId.toString(), users);
                        gameToLoad.botPlayCount++;
                    }, 250);
                }
                this.initializeClock(socket, +gameId, users);
            }
        }
    }

    assignFfaTeams(gameIndex) {
        const game = this.gamesInLobbyList[gameIndex];
        if (game && game.gameMode === 1) {
            game.teams = [];
            for (let user of game.users) {
                game.teams.push({ users: [user], points: 0, hasBot: BOTS_LIST.map(b => b.name).includes(user) })
            }
        }
    }

    getSocketId(username: string, users: any) {
        return Object.keys(users)[Object.values(users).findIndex((user: string) => username === user)];
    }

    guessWord(socket: Socket, gameId: string, word: string, users: any) {
        const actualGame: Game = this.activeGamesList.find((game: Game) => game.gameId.toString() === gameId);
        if (actualGame) {
            const clock: Clock = this.clocks[actualGame.gameId];
            if (word.toLowerCase() === actualGame.currentWord.toLowerCase()) {
                if (BOTS_LIST.map(b => b.name).includes(actualGame.userPlaying)) { //Send correct guess message from bot
                    actualGame.isInRelaunch ? this.sendBotMessage(actualGame.gameId.toString(), actualGame.userPlaying, BOT_OTHER_GUESS_MESSAGE) : this.sendBotMessage(actualGame.gameId.toString(), actualGame.userPlaying, BOT_GUESS_MESSAGE);
                }
                actualGame.correctGuesses++;
                socket.emit('correctGuess');
                actualGame.isInRelaunch = false;
                const timeAtGuess = clock.secondsRemaining;
                this.computeGuessersPoints(actualGame, timeAtGuess, users[socket.id]);
                actualGame.saveGuesserForGameRecap(users[socket.id]);
                const correctGuessesNeeded = actualGame.gameMode === 0 ? 1 : actualGame.users.length - 1;
                if (actualGame.correctGuesses >= correctGuessesNeeded) {
                    actualGame.interruptBot = true;
                    this.turnTransition(socket, actualGame, clock, users);
                }

            } else {
                socket.emit('incorrectGuess');
            }
        }
    }

    turnTransition(socket: Socket, actualGame: Game, clock: Clock, users: any) {
        //in free-for-all, drawer points are calculated at the end of the turn (after everyone has guessed correctly or timer has run out)
        if (actualGame.gameMode === 1) {
            actualGame.teamPlaying.points += Math.ceil(actualGame.correctGuesses / (actualGame.teams.length - 1) * MAX_POINTS);
        }
        this.io.to("game" + actualGame.gameId).emit("receivePoints", JSON.stringify(actualGame.teamPlaying));
        actualGame.correctGuesses = 0;
        clock.clockIsSuspended = true;
        if (!actualGame.isInRelaunch) {
            actualGame.wordsAlreadyUsed.push(actualGame.currentWord);

            // emits relaunch with no data to tell clients relaunch is over
            this.io.to("game" + actualGame.gameId).emit("relaunch");
            let suggestedWords: Pair[] = [];
            suggestedWords = this.generateWordSuggestions(actualGame);
            this.nextTurn(socket, actualGame, users);
            console.log(`game is over: ${actualGame.isOver}`);
            if (!actualGame.isOver && !actualGame.teamPlaying.hasBot) {
                this.io.to("game" + actualGame.gameId).emit("wordSuggestions", JSON.stringify({ pairs: suggestedWords, user: actualGame.userPlaying }));
            }
            else if (!actualGame.isOver && actualGame.teamPlaying.hasBot) {
                this.io.to("game" + actualGame.gameId).emit("nextDrawing", JSON.stringify({ userPlaying: actualGame.userPlaying, teamPlaying: actualGame.teamPlaying }));
                setTimeout(() => {
                    actualGame.finishedInterruption = true;
                    this.pickAndDrawWord(socket, actualGame.gameId.toString(), users);
                    actualGame.botPlayCount++;
                }, 2000);
                actualGame.finishedInterruption = false;
            }

        }
        else {
            const teamRelaunching = actualGame.teamPlaying === actualGame.teams[0] ? actualGame.teams[1] : actualGame.teams[0];
            this.io.to("game" + actualGame.gameId).emit("relaunch", JSON.stringify(teamRelaunching));
            clock.secondsRemaining = Math.round(BASE_TURN_DURATION * actualGame.clockDifMod / 2);
            clock.clockIsSuspended = false;
        }
    }

    onWordReceive(gameId: string, word: string, hints: string[], users: any) {
        const actualGame = this.activeGamesList.find((game: Game) => game.gameId.toString() === gameId);
        if (actualGame) {
            actualGame.currentWord = word;
            actualGame.initTurnRecap();
            this.io.to("game" + actualGame.gameId).emit("drawingTurn", JSON.stringify({ word: word, hints: hints, user: actualGame.userPlaying }));
            this.io.to("game" + actualGame.gameId).emit("nextDrawing", JSON.stringify({ userPlaying: actualGame.userPlaying, teamPlaying: actualGame.teamPlaying }));
            const clock = this.clocks[gameId];
            clock.secondsRemaining = Math.round(BASE_TURN_DURATION * actualGame.clockDifMod);
            clock.clockIsSuspended = false;
        }
    }

    getActiveGame(gameId: string): Game {
        return this.activeGamesList.find((actualGame: Game) => actualGame.gameId + '' === gameId);
    }

    getLobbyObject(gameId: string): Game {
        return this.gamesInLobbyList.find((actualGame: Game) => actualGame.gameId + '' === gameId);
    }

    nextTurn(socket: Socket, actualGame: Game, users: any) {
        if (actualGame.gameMode === 1) {
            this.nextTurnFFA(socket, actualGame, users);
        } else {
            this.nextTurnClassic(socket, actualGame, users);
        }
    }

    nextTurnClassic(socket: Socket, actualGame: Game, users: any) {
        const teamPlayingIndex = actualGame.teams.findIndex((team) => team === actualGame.teamPlaying);
        const otherTeamIndex = teamPlayingIndex === 0 ? 1 : 0;
        const bot = actualGame.teams[otherTeamIndex].users.find((u) => BOTS_LIST.map(b => b.name).includes(u));

        //if both teams have bots
        if (actualGame.teamPlaying.hasBot && actualGame.teams[otherTeamIndex].hasBot) {

            if (actualGame.botPlayCount < 2) {
                actualGame.botPlayCount++;
                return;
            }

            if (bot) {
                actualGame.botPlayCount = 0;
                actualGame.userPlaying = bot;
                this.sendBotMessage(actualGame.gameId.toString(), actualGame.userPlaying, BOT_NEXT_TURN_MESSAGE)
            }

            if (actualGame.teamPlaying === actualGame.teams[1] && actualGame.roundCounter < MAX_ROUND_CLASSIC) {
                actualGame.roundCounter++;
                this.io.to("game" + actualGame.gameId).emit("roundEnd", actualGame.roundCounter.toString());
            }

            else if (actualGame.teamPlaying === actualGame.teams[1] && actualGame.roundCounter === MAX_ROUND_CLASSIC) {
                actualGame.isOver = true;
                actualGame.interruptBot = true;
                this.endGame(socket, actualGame, users);
                return;
            }

            actualGame.teamPlaying = actualGame.teams[otherTeamIndex];
        }

        //if the team that just played doesnt have a bot but the other team does
        else if (!actualGame.teamPlaying.hasBot && actualGame.teams[otherTeamIndex].hasBot && bot) {
            actualGame.botPlayCount = 0;
            if (actualGame.userPlaying === actualGame.teams[1].users[1]) {
                actualGame.teamPlaying = actualGame.teams[0];
                actualGame.userPlaying = bot;
                if (actualGame.roundCounter < MAX_ROUND_CLASSIC) {
                    this.sendBotMessage(actualGame.gameId.toString(), actualGame.userPlaying, BOT_NEXT_TURN_MESSAGE)
                    actualGame.roundCounter++;
                    this.io.to("game" + actualGame.gameId).emit("roundEnd", actualGame.roundCounter.toString());
                }
                else {
                    actualGame.isOver = true;
                    actualGame.interruptBot = true;
                    this.endGame(socket, actualGame, users);
                    return;
                }
            }
            else if (actualGame.userPlaying === actualGame.teamPlaying.users[0]) {
                actualGame.userPlaying = actualGame.teamPlaying.users[1];
            }
            else if (actualGame.userPlaying === actualGame.teamPlaying.users[1]) {
                actualGame.userPlaying = bot;
                this.sendBotMessage(actualGame.gameId.toString(), actualGame.userPlaying, BOT_NEXT_TURN_MESSAGE);
                actualGame.teamPlaying = actualGame.teams[otherTeamIndex];
            }
        }

        //if the team that just played has a bot but the other team doesn't
        else if (actualGame.teamPlaying.hasBot && !actualGame.teams[otherTeamIndex].hasBot) {

            if (actualGame.botPlayCount < 2) {
                actualGame.botPlayCount++;
                return;
            }

            if (actualGame.teamPlaying === actualGame.teams[1]) {
                if (actualGame.roundCounter < MAX_ROUND_CLASSIC) {
                    actualGame.roundCounter++;
                    this.io.to("game" + actualGame.gameId).emit("roundEnd", actualGame.roundCounter.toString());
                }
                else {
                    actualGame.isOver = true;
                    actualGame.interruptBot = true;
                    this.endGame(socket, actualGame, users);
                    return;
                }
            }
            actualGame.userPlaying = actualGame.teams[otherTeamIndex].users[0];
            actualGame.teamPlaying = actualGame.teams[otherTeamIndex];

        }

        //if none of the teams have bots
        else if (!actualGame.teamPlaying.hasBot && !actualGame.teams[otherTeamIndex].hasBot) {

            if (actualGame.userPlaying === actualGame.teams[1].users[1]) {
                actualGame.userPlaying = actualGame.teams[otherTeamIndex].users[0];
                actualGame.teamPlaying = actualGame.teams[otherTeamIndex];
                if (actualGame.roundCounter < MAX_ROUND_CLASSIC) {
                    actualGame.roundCounter++;
                    this.io.to("game" + actualGame.gameId).emit("roundEnd", actualGame.roundCounter.toString());
                }
                else {
                    actualGame.isOver = true;
                    actualGame.interruptBot = true;
                    this.endGame(socket, actualGame, users);
                    return;
                }
            }
            else if (actualGame.userPlaying === actualGame.teamPlaying.users[0]) {
                actualGame.userPlaying = actualGame.teamPlaying.users[1];
            }
            else if (actualGame.userPlaying === actualGame.teamPlaying.users[1]) {
                actualGame.userPlaying = actualGame.teams[otherTeamIndex].users[0];
                actualGame.teamPlaying = actualGame.teams[otherTeamIndex];
            }
        }

        console.log(`bot play count is : ${actualGame.botPlayCount}`);
    }

    nextTurnFFA(socket: Socket, actualGame: Game, users: any) {
        if (actualGame.roundCounter >= MAX_ROUND_FFA && actualGame.teamsWaiting.length === 0) {
            actualGame.isOver = true;
            actualGame.interruptBot = true;
            this.endGame(socket, actualGame, users);
            return;
        }
        if (actualGame.teamsWaiting.length === 0) {
            if (actualGame.roundCounter < MAX_ROUND_FFA) {
                actualGame.roundCounter++;
                this.io.to("game" + actualGame.gameId).emit("roundEnd", actualGame.roundCounter.toString());
                actualGame.teamsWaiting = [...actualGame.teams];
            }
        }
        if (actualGame.roundCounter <= MAX_ROUND_FFA && actualGame.teamsWaiting.length !== 0) {
            const indexTeam: number = Math.floor(Math.random() * actualGame.teamsWaiting.length);
            console.log(`index is : ${indexTeam}, out ouf bounds : ${actualGame.teams[indexTeam] === undefined}`)
            actualGame.userPlaying = actualGame.teamsWaiting[indexTeam].users[0];
            actualGame.teamPlaying = actualGame.teamsWaiting[indexTeam];
            actualGame.teamsWaiting.splice(indexTeam, 1);
        }
    }

    endGame(socket: Socket, actualGame: Game, users: any) {
        //if something explodes, here maybe?
        this.activeGamesList.splice(this.activeGamesList.findIndex((game: Game) => actualGame === game), 1);
        var winnerTeamsList: Team[] = [];
        var winnerUsersList: string[] = [];
        actualGame.end = TimeStamp.now();
        actualGame.teams.sort((a: Team, b: Team) => (a.points < b.points) ? 1 : ((a.points > b.points) ? -1 : 0));
        console.log(actualGame.teams);
        for (var i: number = 0; i < actualGame.teams.length; i++) {
            if (actualGame.teams[0].points === actualGame.teams[i].points && i < actualGame.teams.length) {
                winnerTeamsList.push(actualGame.teams[i]);
                winnerUsersList = winnerUsersList.concat(actualGame.teams[i].users);

                if (actualGame.gameMode === 0) { //message de victoire des bots
                    if (actualGame.teams[i].hasBot) {
                        const bot = actualGame.teams[i].users.find((u) => BOTS_LIST.map(b => b.name).includes(u));
                        if (bot) {
                            this.sendBotMessage(actualGame.gameId.toString(), bot, BOT_VICTORY_MESSAGE)
                        }
                    }
                }
            } else { //message de defaite des bots
                if (actualGame.gameMode === 0) {
                    if (actualGame.teams[i].hasBot) {
                        const bot = actualGame.teams[i].users.find((u) => BOTS_LIST.map(b => b.name).includes(u));
                        if (bot) {
                            this.sendBotMessage(actualGame.gameId.toString(), bot, BOT_DEFEAT_MESSAGE);
                        }
                    }
                }
            }
        }
        this.io.to("game" + actualGame.gameId).emit("endGame", JSON.stringify(winnerUsersList));
        let points = [];
        for (let i = 0; i < actualGame.users.length; i++) {
            const team = actualGame.teams.find((team: Team) => team.users.includes(actualGame.users[i]));
            if (team) {
                points[i] = team.points;
            }

        }
        this.gameHisto.addGameToDatabase(
            actualGame.difficulty,
            actualGame.gameMode,
            actualGame.hasPowerUps,
            actualGame.host,
            actualGame.users,
            points,
            winnerUsersList,
            actualGame.start,
            actualGame.end);
        for (var i: number = 0; i < actualGame.teams.length; i++) {
            for (var j: number = 0; j < actualGame.teams[i].users.length; j++) {
                this.stat.updateStats(
                    actualGame.teams[i].users[j],
                    winnerUsersList.includes(actualGame.teams[i].users[j]),
                    actualGame.start,
                    actualGame.end);
            }
        }
        // actualGame.turnsRecap.forEach( (recap: TurnRecap) => this.io.to("game" + actualGame.gameId).emit("recapGame", JSON.stringify(recap)));
        this.io.to("game" + actualGame.gameId).emit("recapGame", JSON.stringify(actualGame.turnsRecap));
        // TODO faire qui les salles a tout le monde
        /* this.io.of('/').in("game" + actualGame.gameId).clients((error, socketIds) => {
            if (error) throw error;
            socketIds.forEach(socketId => this.io.sockets.sockets[socketId].leave("game" + actualGame.gameId));
          });*/

        // TODO envoyer recap
    }

    computeGuessersPoints(game: Game, time: number, username: string) {
        const indexTeam = game.teams.findIndex((team: Team) => team.users.includes(username));
        if (indexTeam !== -1) {
            if (game.gameMode === 0) {
                game.teams[indexTeam].points++;
                this.io.to("game" + game.gameId).emit("receivePoints", JSON.stringify(game.teams[indexTeam]));
            }

            if (game.gameMode === 1) {
                game.teams[indexTeam].points += Math.ceil((time / game.clockDifMod) / 12);
                this.io.to("game" + game.gameId).emit("receivePoints", JSON.stringify(game.teams[indexTeam]));
            }
        }
    }

    getWordsFromDatabase() {
        this.db.firestore().collection('word_image_pairs').get()
            .then((result) => {
                for (let i = 0; i < result.docs.length; i++) {
                    let word = result.docs[i].data();
                    switch (word.difficulty) {
                        case 0: this.wordsEasy.push(new Pair(word.word, word.hints)); break;
                        case 1: this.wordsNormal.push(new Pair(word.word, word.hints)); break;
                        case 2: this.wordsHard.push(new Pair(word.word, word.hints)); break;
                        default: break;
                    }
                }
            }).
            catch((e) => { console.log(e) });
    }

    generateWordSuggestions(game: Game) {
        const difficulty = game.difficulty;
        let tempWords = [...this.wordsNormal];
        if (difficulty === 0) {
            tempWords.length = 0;
            tempWords = [...this.wordsEasy];
        } else if (difficulty === 2) {
            tempWords.length = 0;
            tempWords = [...this.wordsHard];
        }
        let shuffledWords: Pair[] = this.shuffleArray(tempWords);
        let suggestedPairs: Pair[] = [];
        suggestedPairs = [...this.getSuggestions(shuffledWords, game)]
        return suggestedPairs;
    }

    getSuggestions(words: Pair[], game: Game): Pair[] {
        let suggestedPairs: Pair[] = [];
        for (let pair of words) {
            if (!game.wordsAlreadyUsed.includes(pair.word)) {
                suggestedPairs.push(pair)
                if (suggestedPairs.length === NUMBER_OF_SUGGESTIONS) {
                    return suggestedPairs;
                }
            }
        }
        if (suggestedPairs.length < NUMBER_OF_SUGGESTIONS) {
            game.wordsAlreadyUsed = [];
            for (let pair of words) {
                if (!game.wordsAlreadyUsed.includes(pair.word)) {
                    suggestedPairs.push(pair)
                    if (suggestedPairs.length === NUMBER_OF_SUGGESTIONS) {
                        return suggestedPairs;
                    }
                }
            }
        }
        return suggestedPairs;
    }

    isUserInActiveGame(user: string) {
        let allGames = [...this.activeGamesList];
        let allPlayers = [].concat(...allGames.map(g => g.users));
        return allPlayers.includes(user);
    }

    isUserInLobby(user: string) {
        let allGames = [...this.gamesInLobbyList];
        let allPlayers = [].concat(...allGames.map(g => g.users));
        return allPlayers.includes(user);
    }

    updateLobbyTeams(data: any) {
        const parsedData = JSON.parse(data) as { gameId: number, team1: string[], team2: string[] };
        const targetGame = this.gamesInLobbyList.find((game: Game) => game.gameId === parsedData.gameId);
        const usersTeam1 = parsedData.team1;
        const usersTeam2 = parsedData.team2;
        const team1HasBot = usersTeam1.some(u => BOTS_LIST.map(b => b.name).indexOf(u) >= 0);
        const team2HasBot = usersTeam2.some(u => BOTS_LIST.map(b => b.name).indexOf(u) >= 0);
        if (targetGame) {
            targetGame.teams = []
            targetGame.teams.push({ users: [...usersTeam1], points: 0, hasBot: team1HasBot });
            targetGame.teams.push({ users: [...usersTeam2], points: 0, hasBot: team2HasBot });
            this.io.to("game" + parsedData.gameId).emit("getTheGameData", JSON.stringify(targetGame));
        }
    }

    addBotToTeam(data: any) {
        const parsedData = JSON.parse(data) as { gameId: number, team: number, botName: string };
        const gameInLobby = this.gamesInLobbyList.find((game: Game) => game.gameId === parsedData.gameId);
        const activeGame = this.activeGamesList.find((game: Game) => game.gameId === parsedData.gameId);
        const targetGame = gameInLobby ? gameInLobby : activeGame;
        if (targetGame) {
            if (targetGame.teams[parsedData.team].hasBot || targetGame.teams[parsedData.team].users.length >= 2) {
                return;
            }
            if (!targetGame.teams[0].users.includes(parsedData.botName) && !targetGame.teams[1].users.includes(parsedData.botName)) {
                targetGame.users.push(parsedData.botName);
                targetGame.teams[parsedData.team].users.push(parsedData.botName);
                targetGame.teams[parsedData.team].hasBot = true;
                console.log('Added bot to team', parsedData.team, 'of game:', parsedData.gameId)
                this.io.to("game" + parsedData.gameId).emit("getTheGameData", JSON.stringify(targetGame));
                this.io.emit("lobbyList", JSON.stringify(this.gamesInLobbyList));
            }
        }
    }

    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    pickAndDrawWord(socket, gameId: string, users: any) { //AI IS JUST A BUNCH OF IF STATEMENTS RIGHT??????
        const curGame = this.activeGamesList.find((actualGame: Game) => actualGame.gameId.toString() === gameId);
        if (curGame) {
            curGame.interruptBot = false;
            this.db.firestore().collection('word_image_pairs').get().then((pairs) => {
                let shuffledDocs = this.shuffleArray(pairs.docs)
                if (shuffledDocs.length > 0) {
                    let pair_data;
                    for (let doc of shuffledDocs) {
                        let curDocData = doc.data();
                        if (curDocData.data) {
                            if (!curGame.wordsAlreadyUsed.includes(curDocData.word) && curDocData.difficulty === curGame.difficulty) {
                                pair_data = curDocData;
                                break;
                            }
                        }
                    }
                    if (!pair_data) {
                        curGame.wordsAlreadyUsed = [];
                        for (let doc of shuffledDocs) {
                            let curDocData = doc.data();
                            if (curDocData.data) {
                                if (!curGame.wordsAlreadyUsed.includes(curDocData.word) && curDocData.difficulty === curGame.difficulty) {
                                    pair_data = curDocData;
                                    break;
                                }
                            }
                        }
                    }
                    if (pair_data) {
                        this.onWordReceive(gameId, pair_data.word, pair_data.hints, users);
                        this.db.firestore().collection('pairs_data').doc(pair_data.data).get().then(async (draw_info) => {
                            if (draw_info) {
                                let draw_info_data = draw_info.data();
                                this.io.to("game" + gameId).emit("receive-update-background", JSON.stringify({ gameId: gameId, color: JSON.parse(pair_data.bg) }))
                                this.updateRecapBackground(gameId, curGame.userPlaying, JSON.parse(pair_data.bg));
                                let shapes = JSON.parse(draw_info_data.shapes)
                                let totalLength = 0;
                                for (let shape of shapes) {
                                    totalLength += pointsOnPath(shape.path).length;
                                }
                                for (let shape of shapes) {
                                    let curPoints = pointsOnPath(shape.path);
                                    let curPath = { strokeColor: shape.color, strokeWidth: shape.width, commandSvg: '', points: [] }
                                    let isFirst = true;
                                    const lengthPerInterval = 34 * (totalLength / (((BASE_TURN_DURATION * 1000) * 0.5) * curGame.clockDifMod));
                                    let amountToDraw = 0;
                                    while (curPoints.length !== 0) {
                                        amountToDraw = amountToDraw % 1;
                                        while (amountToDraw < 1) {
                                            amountToDraw += lengthPerInterval;
                                            await this.sleep(17);
                                        }
                                        let pointsToAdd = curPoints.splice(0, Math.floor(amountToDraw));
                                        for (let point of pointsToAdd) {
                                            curPath.points.push({ x: point[0], y: point[1] });
                                            curPath.commandSvg += (curPath.commandSvg.length === 0) ? (`M${+point[0]} ${+point[1]} L${+point[0]} ${+point[1]}`) : (` L${+point[0]} ${+point[1]}`);
                                        }
                                        if (!curGame.interruptBot) {
                                            if (isFirst) {
                                                isFirst = false;
                                                this.io.to("game" + gameId).emit("receive-start-draw", JSON.stringify({ path: curPath }))
                                            } else {
                                                this.io.to("game" + gameId).emit("receive-update-draw", JSON.stringify({ path: curPath }))
                                            }
                                        } else {
                                            this.io.to("game" + gameId).emit("receive-finish-draw", JSON.stringify({ path: curPath }))
                                            curGame.interruptBot = false;
                                            curGame.finishedInterruption = true;
                                            this.updatePath(gameId, curGame.userPlaying, curPath)
                                            return;
                                        }
                                    }
                                    this.io.to("game" + gameId).emit("receive-finish-draw", JSON.stringify({ path: curPath }))
                                    this.updatePath(gameId, curGame.userPlaying, curPath)
                                }
                            }
                        })
                    }
                }
            })
        }
    }

    updatePath(gameId: string, username: string, path: any) {
        let actualGame: Game = this.activeGamesList.find((game: Game) => gameId === game.gameId.toString() && username === game.userPlaying);
        if (actualGame && path) actualGame.turnsRecap[actualGame.turnsRecap.length - 1].svg.push(path);
    }

    redrawPaths(gameId: string, username: string, path: any) {
        let actualGame: Game = this.activeGamesList.find((game: Game) => gameId === game.gameId.toString() && username === game.userPlaying);
        if (actualGame && path) actualGame.turnsRecap[actualGame.turnsRecap.length - 1].svg = path;
    }

    updateRecapBackground(gameId: string, username: string, color: any) {
        let actualGame: Game = this.activeGamesList.find((game: Game) => gameId === game.gameId.toString() && username === game.userPlaying);
        if (actualGame && color) actualGame.turnsRecap[actualGame.turnsRecap.length - 1].backgroundColor = color;
    }

    shuffleArray(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    /* message shenanigans */

    sendBotMessage(gameId: string, botName: string, messagePool: any) {
        let date = TimeStamp.now();
        let message: ChatMessage = {
            username: botName,
            gameId: gameId,
            date: date,
            text: messagePool[BOTS_LIST.find(b => b.name === botName).personality],
            channel_name: 'Tous',
            formatedTime: this.formatDate(date)
        }
        this.io.to("game" + gameId).emit("message-broadcast", JSON.stringify(message))
        this.addMessage(gameId, message);
    }

    getAllGlobalChannels() {
        return this.globalChatChannels;
    }

    getAllGameChannels(gameId: string) {
        let isInLobby = this.gamesInLobbyList.map(g => g.gameId + '').includes(gameId);
        let game = isInLobby ? this.getLobbyObject(gameId) : this.getActiveGame(gameId);
        if (game) {
            return game.chatChanels;
        }
        return undefined;
    }

    deleteChannel(gameId: string, channelName: string) {
        if (gameId.length > 0) {
            let isInLobby = this.gamesInLobbyList.map(g => g.gameId + '').includes(gameId);
            let game = isInLobby ? this.getLobbyObject(gameId) : this.getActiveGame(gameId);
            if (game) {
                game.chatChanels = game.chatChanels.filter(c => c.name !== channelName);
                delete game.channelParticipants[channelName]
                this.io.emit('receive-delete-channel', JSON.stringify({ gameId: gameId, channel_name: channelName }))
            }
        } else {
            this.globalChatChannels = this.globalChatChannels.filter(c => c.name !== channelName);
        }
    }

    addChatChannel(gameId: string, channelName: string, creator: string) {
        if (gameId.length > 0) {
            let isInLobby = this.gamesInLobbyList.map(g => g.gameId + '').includes(gameId);
            let game = isInLobby ? this.getLobbyObject(gameId) : this.getActiveGame(gameId);
            if (game) {
                game.chatChanels.push({ gameId: gameId, messages: [], creator: creator, name: channelName });
                game.channelParticipants[channelName] = [creator]
            }
        } else {
            this.globalChatChannels.push({ gameId: gameId, messages: [], creator: creator, name: channelName });
        }
    }

    addMessage(gameId: string, message: ChatMessage) {
        if (message) {
            if (gameId.length > 0) {
                let isInLobby = this.gamesInLobbyList.map(g => g.gameId + '').includes(gameId);
                let game = isInLobby ? this.getLobbyObject(gameId) : this.getActiveGame(gameId);
                if (game) {
                    let channelIndex = game.chatChanels.findIndex(c => c.name === message.channel_name);
                    if (channelIndex !== -1) {
                        message.formatedTime = this.formatDate(new TimeStamp(message.date.seconds, message.date.nanoseconds));
                        game.chatChanels[channelIndex].messages.push(message);
                    }
                }
            } else {
                let channelIndex = this.globalChatChannels.findIndex(c => c.name === message.channel_name);
                if (channelIndex !== -1) {
                    message.formatedTime = this.formatDate(new TimeStamp(message.date.seconds, message.date.nanoseconds));
                    this.globalChatChannels[channelIndex].messages.push(message);
                }
            }
        }
    }  

    formatDate(date: TimeStamp) {
        let curDate = new TimeStamp(date.seconds, date.nanoseconds);
        return curDate.toDate().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    addUserToJoinedChannels(user: string, gameId: string, channel_name: string) {
        let isInLobby = this.gamesInLobbyList.map(g => g.gameId + '').includes(gameId);
        let game = isInLobby ? this.getLobbyObject(gameId) : this.getActiveGame(gameId);
        if (game) {
            if (game.channelParticipants[channel_name]) {
                game.channelParticipants[channel_name].push(user)
            } else {
                game.channelParticipants[channel_name] = [user];
            }
        }
    }

    removeUserFromJoinedChannels(user: string, gameId: string, channel_name: string) {
        let isInLobby = this.gamesInLobbyList.map(g => g.gameId + '').includes(gameId);
        let game = isInLobby ? this.getLobbyObject(gameId) : this.getActiveGame(gameId);
        if (game) {
            if (game.channelParticipants[channel_name]) {
                game.channelParticipants[channel_name] = game.channelParticipants[channel_name].filter(u => u !== user);
                if (game.channelParticipants[channel_name].length === 0) {
                    this.deleteChannel(gameId, channel_name);
                }
            }
        }
    }

    getUserJoinedChannels(gameId: string, username: string): string[] {
        let isInLobby = this.gamesInLobbyList.map(g => g.gameId + '').includes(gameId);
        let game = isInLobby ? this.getLobbyObject(gameId) : this.getActiveGame(gameId);
        if (game) {
            let joined: string[] = [];
            for (const c in game.channelParticipants) {
                if (game.channelParticipants[c].includes(username)) {
                    joined.push(c);
                }
            }
            return joined;
        }
        return [];
    }
}