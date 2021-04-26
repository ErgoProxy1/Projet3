package com.example.FaisMoiUnDessin.Game

import android.util.Log
import com.beust.klaxon.Klaxon
import com.example.FaisMoiUnDessin.Data.*
import com.example.FaisMoiUnDessin.Singletons
import io.reactivex.rxjava3.subjects.BehaviorSubject

class GameManager() {
    var detailedGameInfo = BehaviorSubject.create<DetailedGameInfo>().apply { onNext(DetailedGameInfo()) }
    var hasVotedToKick = false
    var voteKickIsActive = false

    fun voteKickPlayer(playerName: String, action: String) {
        this.hasVotedToKick = true
        this.voteKickIsActive = true
        val kickInfo = Klaxon().toJsonString(VoteKickRequestInfo(Singletons.gameManager.detailedGameInfo.value.gameId.toString(), playerName, action))
        Log.d("GameManager","kickInfo == $kickInfo")
        val kickingEmitString = if(Singletons.isInGame) "vote-kick-in-game" else "vote-kick"
        Log.d("GameManager", "Kicking $playerName with emit==$kickingEmitString")
        Singletons.socket.emit(kickingEmitString, kickInfo)
    }

    fun kickPlayer(playerName: String) {
        Log.d("GameManager", "Kicking $playerName")
        val kickInfo = Klaxon().toJsonString(LeaveGameInfo(Singletons.gameManager.detailedGameInfo.value.gameId.toString(), playerName))
        val tryingToKickHost = playerName == Singletons.gameManager.detailedGameInfo.value.host
        if (!tryingToKickHost) Singletons.socket.emit("kick-player", kickInfo)
    }

    fun sendToOtherTeam(playerName: String) {
        val newTeamsAfterSwitch = this.getNewTeamsAfterSwitch(playerName)
        val newLobbyTeams = NewLobbyTeamsInfo(detailedGameInfo.value.gameId, newTeamsAfterSwitch[0], newTeamsAfterSwitch[1])
        Singletons.socket.emit("sendNewLobbyTeams", Klaxon().toJsonString(newLobbyTeams))
        Log.d("GameManager", "Switching $playerName") //TODO communicate with server
    }
    fun addBot(team: Team, botName: String) {
        val gameInfo = Singletons.gameManager.detailedGameInfo.value
        val teamNum = gameInfo.teams.indexOf(team)
        val newBotInfo = AddBotInfo(gameInfo.gameId, teamNum, botName)
        Singletons.socket.emit("add-bot", Klaxon().toJsonString(newBotInfo))
    }

    fun clientIsHost(): Boolean {
        val clientUsername = Singletons.credentialsManager.userInfo.username
        val gameHostUsername = Singletons.gameManager.detailedGameInfo.value.host
        return clientUsername == gameHostUsername
    }

    private fun getNewTeamsAfterSwitch(playerName: String): MutableList<MutableList<String>> {
        val teams = detailedGameInfo.value.teams
        val newTeams = mutableListOf<MutableList<String>>()
        for (team in teams) {
            val users: MutableList<String> = team.users.toMutableList()
            if(users.contains(playerName)) {
                users.remove(playerName)
            } else {
                users.add(playerName)
            }
            newTeams.add(users)
        }
        return newTeams
    }
}