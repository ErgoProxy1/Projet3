package com.example.FaisMoiUnDessin.LittleHelpers


import android.content.Context
import android.util.Log
import androidx.fragment.app.FragmentActivity
import com.example.FaisMoiUnDessin.Chat.JoinChannelDialogFragment
import com.example.FaisMoiUnDessin.Chat.CreateChannelDialogFragment
import com.example.FaisMoiUnDessin.Consts.OptionStrings

import com.example.FaisMoiUnDessin.Constants

import com.example.FaisMoiUnDessin.Data.DetailedGameInfo
import com.example.FaisMoiUnDessin.Data.GameInfo
import com.example.FaisMoiUnDessin.Enums.BotName
import com.example.FaisMoiUnDessin.Enums.GameMode
import com.example.FaisMoiUnDessin.Enums.VoteKickActions
import com.example.FaisMoiUnDessin.GameSelection.InsertPasswordPopupFragment
import com.example.FaisMoiUnDessin.Singletons
import java.util.*

class OptionsManager() {
    //This class allows us to dynamically change the options that are available to the user throughout different menus in the app.
    fun clientIsHost(): Boolean {
        val clientUsername = Singletons.credentialsManager.userInfo.username
        val gameHostUsername = Singletons.gameManager.detailedGameInfo.value.host
        return clientUsername == gameHostUsername
    }

    fun canBeginGame(): Boolean { // Can the user press the "begin game button"?
        if (!this.clientIsHost()) return false
        return when (this.gameInfo().gameMode) {
            GameMode.CLASSIC.value -> {
                this.classicGameCanStart()
            }
            GameMode.FREE_FOR_ALL.value -> {
                this.freeForAllGameCanStart()
            }
            else -> false
        }
    }

    fun canAddBotToTeam(teamNb: Int): Boolean {// Can the user add bots to this team?
        if(!this.clientIsHost() || this.gameInfo().gameMode != GameMode.CLASSIC.value || this.gameInfo().isStarted || gameInfo().teams.size === 0) return false // Only the "CLASSIC" game mode can have bots
        //val oppositeTeamNb = 1 - teamNb
        //return gameInfo().teams[teamNb].users.size < gameInfo().teams[oppositeTeamNb].users.size
        val maxTeamSize = if(this.gameInfo().gameMode == GameMode.CLASSIC.value) Constants.MAX_TEAM_SIZE_CLASSIC else Constants.MAX_TEAM_SIZE_FFA
        return gameInfo().teams[teamNb].users.size < maxTeamSize
    }

    fun availableBots(): Vector<String> {
        val possibleBots = BotName.values()
        val availableBots = Vector<String>()
        val presentUsers = gameInfo().users
        for (possibleBot in possibleBots) {
            val botName = possibleBot.value
            if(!presentUsers.contains(botName)) availableBots.add(botName)
        }
        return availableBots
    }

    private fun classicGameCanStart():Boolean {
        val NB_TEAM_MEMBERS = 2
        val nbTeam1Players = this.gameInfo().teams[0].users.size
        val bnTeam2Players = this.gameInfo().teams[1].users.size
        return nbTeam1Players == NB_TEAM_MEMBERS && bnTeam2Players == NB_TEAM_MEMBERS
    }

    private fun freeForAllGameCanStart(): Boolean {
        val MINIMUM_NB_PLAYERS = 3
        return this.gameInfo().users.size >= MINIMUM_NB_PLAYERS
    }

    private fun gameInfo(): DetailedGameInfo {
        return Singletons.gameManager.detailedGameInfo.value
    }

    fun playerActionsAvailableOptions(targetPlayerName: String?): List<String> {
        if(targetPlayerName==null) return listOf("Aucune action disponible")
        var availableOptions = if(clientIsHost()) { OptionStrings.hostActions.toMutableList() } else {OptionStrings.guestActions.toMutableList()}
        val targetPlayerIsClient = targetPlayerName == Singletons.credentialsManager.userInfo.username
        if(targetPlayerIsClient) {
            val actionsOnlyForOthers = listOf(OptionStrings.KICK_PLAYER,OptionStrings.VOTE_KICK_PLAYER)
            for(unavailableAction in actionsOnlyForOthers) availableOptions.remove(unavailableAction)
        }
        val targetPlayerIsHost = targetPlayerName == gameInfo().host
        if(targetPlayerIsHost) {
            val actionsHostIsImmuneTo = listOf(OptionStrings.KICK_PLAYER,OptionStrings.VOTE_KICK_PLAYER)
            for(unavailableAction in actionsHostIsImmuneTo) availableOptions.remove(unavailableAction)
        }
        val gameIsClassic = gameInfo().gameMode== GameMode.CLASSIC.value
        if(gameIsClassic){
            val usersList =Singletons.gameManager.detailedGameInfo.value.users
            val botIsPresent = BotName.values().map{it.value}.any { botName-> usersList.contains(botName) }
            val notEnoughPlayers = usersList.size <3
            if(botIsPresent || notEnoughPlayers) availableOptions.remove(OptionStrings.VOTE_KICK_PLAYER)
        }

        else{ availableOptions.remove(OptionStrings.CHANGE_PLAYER_TEAM)}

        if (availableOptions.isEmpty()) availableOptions.add("Aucune action disponible")
        return availableOptions.toList()
    }

    fun actUponChannelCreationMenu(ctx: Context, actionName:String) {
        Log.d("OptionsManager",actionName)
        when(actionName) {
            OptionStrings.ADD_CHANNEL -> {
                val fragmentManager = (ctx as FragmentActivity).supportFragmentManager
                CreateChannelDialogFragment(ctx).show(fragmentManager, null)
            }

            OptionStrings.JOIN_CHANNEL -> {
                val fragmentManager = (ctx as FragmentActivity).supportFragmentManager
                JoinChannelDialogFragment(ctx,Singletons.messageManager.getJoinableChannels()).show(fragmentManager, null)
            }
        }
    }

    fun actUponPlayerMenu(ctx:Context,actionName:String,playerName:String) {
        val gameManager = Singletons.gameManager
        when(actionName) {
            OptionStrings.KICK_PLAYER -> {
                gameManager.kickPlayer(playerName)
            }
            OptionStrings.VOTE_KICK_PLAYER -> {
                gameManager.voteKickPlayer(playerName,VoteKickActions.KICK.value)
            }
            OptionStrings.CHANGE_PLAYER_TEAM -> {
                gameManager.sendToOtherTeam(playerName)
            }
            OptionStrings.ADD_FRIEND -> {
                //TODO call social manager's add friend method
            }
        }
    }

    fun reactToGameClick(ctx: Context, gameInfo: GameInfo) {
        val gameHasPassword = gameInfo.password != ""
        if (gameHasPassword) {
            val fragmentManager = (ctx as FragmentActivity).supportFragmentManager
            InsertPasswordPopupFragment(gameInfo).show(fragmentManager,null)
        } else {
            Singletons.gamesSwitchingManager.askToJoinGame(gameInfo)
        }
    }

}