package com.example.FaisMoiUnDessin.Consts

class OptionStrings {
    companion object{
        // Social actions
        val KICK_PLAYER = "Expulser"
        val VOTE_KICK_PLAYER = "Vote d'expulsion"
        val CHANGE_PLAYER_TEAM = "Changer d'equipe"
        val ADD_FRIEND = "Ajouter ami"
        val hostActions = listOf(VOTE_KICK_PLAYER,KICK_PLAYER,CHANGE_PLAYER_TEAM)
        val guestActions = listOf(VOTE_KICK_PLAYER)

        // Channel and message actions
        const val ADD_CHANNEL = "Ajouter Canal"
        const val JOIN_CHANNEL = "Rejoindre Canal"
    }
}