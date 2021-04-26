package com.example.FaisMoiUnDessin.Game

import android.util.Log
import com.beust.klaxon.Klaxon
import com.example.FaisMoiUnDessin.Data.DetailedGameInfo
import com.example.FaisMoiUnDessin.Data.GameInfo
import com.example.FaisMoiUnDessin.Singletons
import io.reactivex.rxjava3.subjects.BehaviorSubject
import io.reactivex.rxjava3.subjects.PublishSubject
import io.socket.emitter.Emitter

class GameSwitchingManager() {
    private var gameToJoin = GameInfo()
    var joiningStatusEmitter: PublishSubject<Boolean> = PublishSubject.create<Boolean>().apply {
        Log.d("GameSwitchingManager", "=> onNext(defaultValue), applying default value")
        onNext(false)
    } // Default value
    private val subsManager = com.example.FaisMoiUnDessin.LittleHelpers.SubscriptionManager()
    init{
        //this.setUpServerEvents()
    }
    fun askToJoinGame(gameInfo: GameInfo) {
        Log.d("GameSwitchingManager","Switching to game $gameInfo")
        this.gameToJoin = gameInfo
        Singletons.socket.emit("joiningLobby",gameInfo.gameId.toString()) // Hoping to get accepted into the lobby
    }

    private fun joinGame() {
        Log.d("GameSwitchingManager","<**> GameSwitchingManager.joiningStatusEmitter.onNext(true)")
        this.joiningStatusEmitter.onNext(true)
    }

    fun disableListeners() {
        Log.d("GameSwitchingManager","<**> subsManager.unsubscribeFromAllSubscriptions\n that means: ${subsManager}")
        subsManager.unsubscribeFromAllSubscriptions()
    }

    fun setUpServerEvents() {
        Log.d("GameSwitchingManager","<**> Setting up events")
        val lobbyAccesListener = Emitter.Listener {
            Log.d("GameSwitchingManager", "=> socket.on(\"lobbyAcces\") it=${it[0]}") // Did we get accepted into the lobby?
            val accepted = it[0].toString().toBoolean()
            Log.d("GameSwitchingManager","Got raw lobby response as ${it[0]}")
            if (accepted){ // Yay we got accepted into the lobby!
                Log.d("GameSwitchingManager", "<**> got \"lobbyAccess\", therefore socket.emit(\"askTheGameData\",\"${this.gameToJoin.gameId}\")")
                Singletons.gameManager.detailedGameInfo.onNext(DetailedGameInfo(listOf(),gameToJoin.gameId,gameToJoin.gameMode,false,false,gameToJoin.difficulty,gameToJoin.host))
                this.joinGame()
                // Let's get to know this lobby in detail!
            } else {
                Log.d("GameSwitchingManager", "<**> => got rejected from the lobby")
                this.joiningStatusEmitter.onNext(false) // Let's warn the view we got rejected by the lobby
            }
        }

        Singletons.socket.on("lobbyAcces", lobbyAccesListener)
        this.subsManager.recordSocketSubscription("lobbyAcces",lobbyAccesListener)
    }


}