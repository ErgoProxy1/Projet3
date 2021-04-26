package com.example.FaisMoiUnDessin.Chat

data class ChatChannel(
        val gameId: String = "",
        var name:String = "",
        val creator: String = "",
        var messages: MutableList<ChatMessage> = mutableListOf(),
)