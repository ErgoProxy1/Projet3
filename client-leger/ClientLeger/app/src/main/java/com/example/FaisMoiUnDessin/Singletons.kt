package com.example.FaisMoiUnDessin

import com.example.FaisMoiUnDessin.Authentication.CredentialsManager
import com.example.FaisMoiUnDessin.Chat.ChatRepository
import com.example.FaisMoiUnDessin.Chat.MessageAdapter
import com.example.FaisMoiUnDessin.Chat.MessageManager
import com.example.FaisMoiUnDessin.Chat.Notifications.ChannelNotificationsManager
import com.example.FaisMoiUnDessin.Chat.Notifications.NotificationChannelGateway
import com.example.FaisMoiUnDessin.Enums.NavigationWindow
import com.example.FaisMoiUnDessin.Game.GameManager
import com.example.FaisMoiUnDessin.Game.GameSwitchingManager
import com.example.FaisMoiUnDessin.GameSelection.FriendsRepository
import com.example.FaisMoiUnDessin.GameSelection.GamesListManager
import com.example.FaisMoiUnDessin.LittleHelpers.OptionsManager
import com.example.FaisMoiUnDessin.Model.UserSettings
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import io.socket.client.IO
import io.socket.client.Socket

class Singletons {
    companion object {
        var firebaseDB = Firebase.firestore
        val localServerURL = "http://10.0.2.2:20504/"
        val remoteServerURL = "https://projet3-111.herokuapp.com/"
        var socket: Socket = IO.socket(localServerURL)
        var credentialsManager = CredentialsManager(socket)
        var username: String = ""
        get() = credentialsManager.userInfo.username
        val chatRepository = ChatRepository()
        var messageManager = MessageManager(inGame = false)
        var messageAdapter = MessageAdapter()

        var userSettings = UserSettings()
        var currentServer:  ServerType = ServerType.REMOTE
        var isInGame: Boolean = false
        var isPartOfGame: Boolean = false
        var uid: String = ""

        var gamesListManager = GamesListManager()
        var gamesSwitchingManager = GameSwitchingManager()
        var gameManager = GameManager()
        var optionManager = OptionsManager()
        var gameId: Int = 0
        get() = gameManager.detailedGameInfo.value.gameId
        var gameIdString: String = ""
        get() = "game$gameId"
        var isInLobby = false
        var currentWindow = NavigationWindow.AUTHENTICATION
        val friendsRepository = FriendsRepository()
        val notifManager = ChannelNotificationsManager()

        var gameMode: Int = 0
        get() = gameManager.detailedGameInfo.value.gameMode

        var hintList: Array<String>
        get() = gameManager.detailedGameInfo.value.hintList
        set(value) {gameManager.detailedGameInfo.value.hintList = value}
    }

    init {

    }
}

enum class ServerType {
    REMOTE,
    LOCAL
}