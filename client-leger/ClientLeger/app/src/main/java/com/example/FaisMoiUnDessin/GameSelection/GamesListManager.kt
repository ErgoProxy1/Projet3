package com.example.FaisMoiUnDessin.GameSelection

import android.util.Log
import com.beust.klaxon.Klaxon
import com.example.FaisMoiUnDessin.Constants
import com.example.FaisMoiUnDessin.Data.GameInfo
import com.example.FaisMoiUnDessin.Data.GameSearchSettings
import com.example.FaisMoiUnDessin.Enums.GameMode
import com.example.FaisMoiUnDessin.Enums.Privacy
import com.example.FaisMoiUnDessin.Singletons
import io.reactivex.rxjava3.kotlin.subscribeBy
import io.reactivex.rxjava3.subjects.BehaviorSubject
import org.json.JSONArray

class GamesListManager() {
    private var gamesList = BehaviorSubject.create<MutableList<GameInfo>>()
    var visibleGamesList = BehaviorSubject.create<MutableList<GameInfo>>()

    init{
        this.gamesList.onNext(mutableListOf())
        this.visibleGamesList.onNext(mutableListOf())
        this.setUpEvents()
    }

    private fun setUpEvents() {
        Singletons.userSettings.gameSearchSearchSettings.subscribeBy( onNext={ _ -> //Visible games must change when user selection criteria changes
            Log.d("GamesListManager","() GamesSettingsFetched!")
            this.updateVisibleGamesList()
        }, onError = {})
        this.gamesList.subscribeBy( onNext = {_ -> //Visible games must change when available games change
            this.updateVisibleGamesList()
        }, onError = {})
    }

    fun setupServerListener(){
        Log.d("GamesListManager","() listening on socket ${Singletons.socket}")
        Singletons.socket.on("lobbyList") { params->
            Log.d("GamesListManager","Got new lobby list as ${params[0].toString()}")
            this.reactToServerLobbyList(params[0].toString())
        }
    }

    private fun reactToServerLobbyList(it: String) {
        val parsedList = JSONArray(it)
        Log.d("GamesListManager","<? Updating underlying raw pasred list as $parsedList")
        val gameLobbies = this.jsonArrToGameInfo(parsedList)
        Log.d("GamesListManager","<? Updating underlying games list as $gameLobbies")
        this.gamesList.onNext(gameLobbies)
        Log.d("GamesListManager","<? Underlying games list is now ${this.gamesList.value}")
    }

    private fun jsonArrToGameInfo(jsonArr: JSONArray): MutableList<GameInfo> {
        val lobbies = mutableListOf<GameInfo>();
        for(i in 0 until jsonArr.length()) {
            val jsonGameInfo = jsonArr.get(i)
            val gameInfo = Klaxon().parse<GameInfo>(jsonGameInfo.toString())
            lobbies.add(gameInfo!!)
        }
        return lobbies
    }

    private fun updateVisibleGamesList() {
        Log.d("GamesListManager","updating lobby list from: ${this.gamesList.value}")
        Log.d("GamesListManager","updating lobby list with: ${this.filterGamesToCriteria(this.gamesList.value)}")
        this.visibleGamesList.onNext(this.filterGamesToCriteria(this.gamesList.value))
    }

    private fun filterGamesToCriteria(gamesToFilter: List<GameInfo>): MutableList<GameInfo> {
        var newList = mutableListOf<GameInfo>()
        for (game in gamesToFilter) {
            if(this.gamesMatch(Singletons.userSettings.gameSearchSearchSettings.value,game))
            newList.add(game)
        }
        return newList
    }

    private fun gamesMatch(gameSearchSettings: GameSearchSettings, game: GameInfo): Boolean {
        val gameModeAgnostic = gameSearchSettings.gameMode == -1
        Log.d("GamesListManager game",game.toString())
        Log.d("GamesListManager sett",gameSearchSettings.toString())
        val difficultyAgnostic = gameSearchSettings.difficulty == -1
        val privacyAgnostic = gameSearchSettings.privateGame == Privacy.ANY.value
        val friendsAgnostic = !gameSearchSettings.friendsOnly
        val openSpacesAgnostic = !gameSearchSettings.onlyHasOpenSpaces
        val hostNameAgnostic = gameSearchSettings.hostName.trim()==""
        val correctMode = gameModeAgnostic || (gameSearchSettings.gameMode == game.gameMode)
        val correctDifficulty = difficultyAgnostic || (gameSearchSettings.difficulty == game.difficulty)
        val correctPrivacy = privacyAgnostic || ((game.password == "")xor(gameSearchSettings.privateGame == Privacy.TRUE.value)) // We can't care about having a password and not care about it at the same time
        val friendIsInGame = Singletons.friendsRepository.friends.any { friend-> game.users.contains(friend) }
        val correctFriendPresence = friendsAgnostic || friendIsInGame
        val openSpacePresence = game.users.size < gameTypeToMaxPlayerCount(game.gameMode)
        val correctOpenSpacePresence = openSpacesAgnostic || openSpacePresence
        val correctHostName = hostNameAgnostic || game.host.contains(gameSearchSettings.hostName)
        Log.d("GamesListManager","corrMode $correctMode")
        Log.d("GamesListManager","corrDiff $correctDifficulty")
        Log.d("GamesListManager","corrPriv $correctPrivacy")
        Log.d("GamesListManager","corrFrien $correctFriendPresence\nbecause friendsAgnostic==$friendsAgnostic\nfriendIsInGame==$friendIsInGame")
        Log.d("GamesListManager","corrHost $correctHostName")
        return correctMode && correctPrivacy && correctDifficulty && correctFriendPresence && correctOpenSpacePresence && correctHostName
    }

    private fun gameTypeToMaxPlayerCount(gameMode: Int) : Int {
        return when (gameMode) {
            GameMode.FREE_FOR_ALL.value -> Constants.MAX_TEAM_SIZE_FFA
            GameMode.CLASSIC.value -> 2*Constants.MAX_TEAM_SIZE_CLASSIC
            else -> Constants.MAX_TEAM_SIZE_FFA //Should never happen
        }
    }

    fun fetchLobbyListFromServer() {
        Log.d("GamesListManager","() Fetching server lobby list ${Singletons.socket}")
        Singletons.socket.emit("requestGameWaiting")
    }


}