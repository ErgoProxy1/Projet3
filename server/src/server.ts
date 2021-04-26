import { Socket } from "socket.io";
import firebase from "firebase";
import { TimeStamp } from "./utils/firebase-utils";
import { GameManager } from "./utils/gameService";
import { ChatChannel, ChatMessage } from "./utils/chat";

var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http, { cors: { origin: true, methods: ["GET", "POST"] }, pingInterval: 25000, pingTimeout: 60000 });

const firebaseConfig = {
  apiKey: "AIzaSyCOrCdJWpRHh1r0qI72v4i-C9QgFUOgexY",
  authDomain: "projet3-111.firebaseapp.com",
  databaseURL: "https://projet3-111-default-rtdb.firebaseio.com",
  projectId: "projet3-111",
  storageBucket: "projet3-111.appspot.com",
  messagingSenderId: "1077399373603",
  appId: "1:1077399373603:web:6ee11954f608e5a24f2e96",
  measurementId: "G-MD9LD5MRB8"
};

let users = {}
let userJoinedChannels = {};
let doNotDisturb: string[] = [];
let inactive: string[] = [];
let fireDb = firebase.initializeApp(firebaseConfig);
var gameManager = new GameManager(io, fireDb);

io.on("connection", (socket: Socket) => {
  console.log("a socket connection was established");

  socket.on("request-login", (username: string) => {
    if (!Object.values(users).includes(username)) {
      users[socket.id] = username;
      if (!userJoinedChannels[username]) {
        userJoinedChannels[username] = ['Global'];
      }
      console.log(`${username} has connected`);
      fireDb.firestore().collection('users').where('username', '==', username).get().then((result) => {
        if (result.docs.length > 0) {
          let data = result.docs[0].data();
          data.connections.unshift(TimeStamp.now());
          if (data.connections.length >= 50) data.connections.length = 50;
          fireDb.firestore().collection('users').doc(result.docs[0].id).update({ connections: data.connections })
        }
      })
      socket.emit("login-pass", username);
    } else {
      console.log(`Connection with ${username} was refused`);
      socket.emit("login-fail", username);
    }
  })

  socket.on("start-draw", (path: string) => {
    let parsedPath = JSON.parse(path);
    socket.to("game" + parsedPath.gameId).emit("receive-start-draw", path)
  })

  socket.on("update-draw", (path: string) => {
    let parsedPath = JSON.parse(path);
    socket.to("game" + parsedPath.gameId).emit("receive-update-draw", path)
  })

  socket.on("finish-draw", (path: string) => {
    let parsedPath = JSON.parse(path);
    socket.to("game" + parsedPath.gameId).emit("receive-finish-draw", path)
    gameManager.updatePath(parsedPath.gameId + '', users[socket.id], parsedPath.path);
  })

  socket.on("redraw-canvas", (primitives: string) => {
    let parsedPath = JSON.parse(primitives);
    socket.to("game" + parsedPath.gameId).emit("receive-redraw-canvas", primitives);
    gameManager.redrawPaths(parsedPath.gameId + '', users[socket.id], parsedPath.primitives);
  })

  socket.on("update-background", (color: string) => {
    let parsedData = JSON.parse(color);
    socket.to("game" + parsedData.gameId).emit("receive-update-background", color)
    gameManager.updateRecapBackground(parsedData.gameId + '', users[socket.id], parsedData.color);
  })

  /* channel shenanigans */
  socket.on("message", (msg) => {
    let parsedMessage = JSON.parse(msg) as ChatMessage;
    console.log(`user ${parsedMessage.username} sent a message`);
    gameManager.addMessage(parsedMessage.gameId, parsedMessage);
    if (parsedMessage.gameId.length > 0) {
      socket.to("game" + parsedMessage.gameId).emit("message-broadcast", msg);
    } else {
      socket.broadcast.emit("message-broadcast", msg);
    }
  });

  socket.on("send-new-channel", (channel: string) => {
    let parsedChannel = JSON.parse(channel) as ChatChannel;
    gameManager.addChatChannel(parsedChannel.gameId, parsedChannel.name, parsedChannel.creator);
    if (parsedChannel.gameId.length > 0) {
      socket.to("game" + parsedChannel.gameId).emit("receive-new-channel", channel)
    } else {
      userJoinedChannels[parsedChannel.creator].push(parsedChannel.name);
      socket.broadcast.emit("receive-new-channel", channel)
    }
  })

  socket.on("request-init-channels", (data: string) => {
    let parsedData = JSON.parse(data) as { gameId: string, sender: string };
    if (users[socket.id]) {
      let user = users[socket.id]
      if (parsedData.gameId.length > 0) {
        let listOfChannels = gameManager.getAllGameChannels(parsedData.gameId);
        let joinedChannels = gameManager.getUserJoinedChannels(parsedData.gameId, user);
        if (listOfChannels) {
          io.to(socket.id).emit("receive-channels-list", JSON.stringify({ channels: listOfChannels, joined: joinedChannels ? joinedChannels : [] }));
        }
      } else {
        let listOfChannels = gameManager.getAllGlobalChannels();
        let joinedChannels = userJoinedChannels[user];
        if (listOfChannels) {
          io.to(socket.id).emit("receive-channels-list", JSON.stringify({ channels: listOfChannels, joined: joinedChannels ? joinedChannels : [] }));
        }
      }
    }
  })

  socket.on('user-joined-channel', (data: string) => {
    let parsedData = JSON.parse(data) as { gameId: string, channel_name: string }
    if (users[socket.id]) {
      let username = users[socket.id]
      if (parsedData.gameId.length > 0) {
        gameManager.addUserToJoinedChannels(username, parsedData.gameId, parsedData.channel_name);
      } else {
        if (userJoinedChannels[username]) {
          userJoinedChannels[username].push(parsedData.channel_name);
        } else {
          userJoinedChannels[username] = [parsedData.channel_name];
        }
      }
    }
  })

  socket.on('user-left-channel', (data: string) => {
    let parsedData = JSON.parse(data) as { gameId: string, channel_name: string }
    if (users[socket.id]) {
      let user = users[socket.id]
      if (parsedData.gameId.length > 0) {
        gameManager.removeUserFromJoinedChannels(user, parsedData.gameId, parsedData.channel_name);
      } else {
        if (userJoinedChannels[user]) {
          userJoinedChannels[user] = userJoinedChannels[user].filter(c => c !== parsedData.channel_name);
          let channelIsEmpty = true;
          for (const username in userJoinedChannels) {
            if (userJoinedChannels[username].includes(parsedData.channel_name)) {
              channelIsEmpty = false;
              break;
            }
          }
          if (channelIsEmpty) {
            gameManager.deleteChannel(parsedData.gameId, parsedData.channel_name);
            userJoinedChannels[user] = userJoinedChannels[user].filter(c => c !== parsedData.channel_name);
            io.emit('receive-delete-channel', JSON.stringify({gameId: parsedData.gameId, channel_name: parsedData.channel_name}))
          }
        }
      }
    }
  })

  /*socket.on("send-init-channels", (data: string) => {
    let parsedData = JSON.parse(data) as { user: string, channelsToSend: any[] };
    let socketId = Object.keys(users).find(id => users[id] === parsedData.user);
    if (socketId) {
      io.to(socketId).emit("get-init-channels", JSON.stringify(parsedData.channelsToSend))
    }
  })*/

  /* disconnect */

  function disconnectUser(socketId) {
    if (Object.keys(users).includes(socketId)) {
      fireDb.firestore().collection('users').where('username', '==', users[socketId]).get().then((result) => {
        if (result.docs.length > 0) {
          let data = result.docs[0].data();
          data.disconnections.unshift(TimeStamp.now());
          if (data.disconnections.length >= 50) data.disconnections.length = 50;
          fireDb.firestore().collection('users').doc(result.docs[0].id).update({ disconnections: data.disconnections });
        }
      })
      gameManager.clearUserGameActivity(socket, users);
      console.log(`${users[socketId]} disconnected`);
      inactive = inactive.filter(u => u !== users[socketId]);
      delete users[socketId];
    }
  }

  socket.on("manual-disconnect", () => {
    disconnectUser(socket.id);
  });

  socket.on("disconnect", () => {
    disconnectUser(socket.id);
  });

  /* game logic */

  socket.on("createGame", (createGameSend: string) => {
    gameManager.createGame(socket, users, createGameSend);
  });

  socket.on("requestGameWaiting", () => {
    gameManager.requestLobbyList(socket, users);
  });

  socket.on("joiningLobby", (gameId: string) => {
    gameManager.joinLobby(socket, users, gameId + '');
  });

  socket.on("askTheGameData", (gameId: string) => {
    gameManager.requestGameData(gameId + '', false);
  });

  socket.on("leaveTheLobby", (data: string) => {
    let parsedData = JSON.parse(data) as { gameId: string, user: string };
    gameManager.removeUserFromGame(socket, users, parsedData.gameId + '', parsedData.user, false);
    console.log(`${parsedData.user} left lobby with id ${parsedData.gameId}`);
  });

  socket.on("leaveTheGame", (data: string) => {
    let parsedData = JSON.parse(data) as { gameId: string, user: string };
    gameManager.removeUserFromGame(socket, users, parsedData.gameId + '', parsedData.user, true);
    console.log(`${parsedData.user} left lobby with id ${parsedData.gameId}`);
  });

  socket.on("delete-game", () => {
    gameManager.clearUserGameActivity(socket, users);
  });

  socket.on("vote-kick", (data: string) => {
    let parsedData = JSON.parse(data) as { gameId: string, user: string, action: string };
    gameManager.voteKick(socket, users, parsedData.gameId + '', parsedData.user, parsedData.action, false);
  });

  socket.on("kick-player", (data: string) => {
    let parsedData = JSON.parse(data) as { gameId: string, user: string };
    gameManager.removeUserFromGame(socket, users, parsedData.gameId + '', parsedData.user, false);
  });

  socket.on("loadGame", (data: string) => {
    let parsedData = JSON.parse(data) as { gameId: string, teams: string[][] };
    gameManager.loadGame(socket, users, parsedData.gameId + '');
  });

  socket.on('ready-to-start', (gameId: string) => {
    gameManager.awaitGameStart(socket, users, gameId + '');
  })

  socket.on("attemptWord", (data: string) => {
    let parsedData = JSON.parse(data) as { gameId: string, word: string };
    if (parsedData.gameId !== undefined) {
      gameManager.guessWord(socket, parsedData.gameId + '', parsedData.word, users);
    } else {
      console.error("The game id is undefined")
    }
  });

  socket.on("requestActiveGame", (gameId: string) => {
    socket.emit("receiveActiveGame", JSON.stringify(gameManager.getActiveGame(gameId + '')));
  });

  socket.on('vote-kick-in-game', (data: string) => {
    let parsedData = JSON.parse(data) as { gameId: string, user: string, action: string };
    console.log('that happened')
    gameManager.voteKick(socket, users, parsedData.gameId + '', parsedData.user, parsedData.action, true);
  });

  socket.on("kick-player-in-game", (data: string) => {
    let parsedData = JSON.parse(data) as { gameId: string, user: string };
    console.log('this happened');
    gameManager.removeUserFromGame(socket, users, parsedData.gameId + '', parsedData.user, true);
  });

  socket.on('ask-active-game-data', (gameId: string) => {
    gameManager.requestGameData(gameId + '', true);
  });

  socket.on("chooseWord", (data) => {
    const parsedData = JSON.parse(data) as { gameId: string, word: string, hints: string[] };
    gameManager.onWordReceive(parsedData.gameId + '', parsedData.word, parsedData.hints, users);
  })

  socket.on("sendNewLobbyTeams", (data) => {
    gameManager.updateLobbyTeams(data);
  })

  /* status management (0 is online, 1 is do not disturb, 2 is inactive, 3 is ingame, 4 is in lobby, 5 is offline) */
  socket.on('request-status', (userList: string) => {
    let parsedUsers: string[] = JSON.parse(userList);
    let statusResult = [];
    for (let u of parsedUsers) {
      if (doNotDisturb.includes(u)) {
        if (Object.values(users).includes(u)) {
          statusResult.push({ username: u, status: 1 });
        } else {
          statusResult.push({ username: u, status: 5 });
        }
        continue;
      } else if (inactive.includes(u)) {
        statusResult.push({ username: u, status: 2 });
        continue;
      } else if (gameManager.isUserInActiveGame(u)) {
        statusResult.push({ username: u, status: 3 });
        continue;
      } else if (gameManager.isUserInLobby(u)) {
        statusResult.push({ username: u, status: 4 });
        continue;
      } else if (Object.values(users).includes(u)) {
        statusResult.push({ username: u, status: 0 });
        continue;
      } else {
        statusResult.push({ username: u, status: 5 });
        continue;
      }
    }
    socket.emit('receive-status', JSON.stringify(statusResult))
  })

  socket.on('is-inactive', (user: string) => {
    inactive.push(user);
  })

  socket.on('not-inactive', (user: string) => {
    inactive = inactive.filter(u => u !== user);
  })

  socket.on('set-do-not-disturb', (user: string) => {
    doNotDisturb.push(user);
  })

  socket.on('unset-do-not-disturb', (user: string) => {
    doNotDisturb = doNotDisturb.filter(u => u !== user);
  })

  socket.on('is-do-not-disturb', (username: string) => {
    socket.emit('receive-is-do-not-disturb', doNotDisturb.includes(username));
  })

  /* social management */

  socket.on('update-friends-list', (userToUpdate: string) => {
    let socketId = Object.keys(users).find(id => users[id] === userToUpdate);
    if (socketId) {
      io.to(socketId).emit('receive-update-friends-list');
    }
  })

  socket.on('update-friend-requests', (userToUpdate: string) => {
    let socketId = Object.keys(users).find(id => users[id] === userToUpdate);
    console.log(userToUpdate);
    if (socketId) {
      io.to(socketId).emit('receive-update-friend-requests');
    }
  })

  /* bots */

  socket.on('add-bot', (data: string) => {
    gameManager.addBotToTeam(data)
  })

  /* reactions */

  socket.on('send-reaction', (data: string) => {
    let parsedData = JSON.parse(data) as { gameId: string, username: string, reaction: string };
    io.to("game" + parsedData.gameId).emit('receive-reaction', data);
  })
});

app.get("/", (req, res) => res.send("hello all!"));
if (!process.argv.includes("test")) {
  http.listen(process.env.PORT || 5000, () => {
    console.log("server listening on heroku (v1.1.0)");
  });
} else {
  http.listen(20504, () => {
    console.log("server listening on local, port 20504 (v1.1.0)");
  });
}