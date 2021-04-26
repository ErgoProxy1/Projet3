package com.example.FaisMoiUnDessin.Chat

import android.util.Log
import com.example.FaisMoiUnDessin.Constants
import com.example.FaisMoiUnDessin.Singletons
import org.json.JSONObject

class ChatRepository {
    var globalMessages: ChatChannel = ChatChannel("",Constants.GLOBAL_CHANNEL_NAME)
    var inGameGlobalMessages = ChatChannel("",Constants.GLOBAL_CHANNEL_NAME)
    var savedChannels = mutableListOf(globalMessages)
    var savedJoinedChannels = mutableListOf(savedChannels[0])
    var savedActiveChannel = savedJoinedChannels[0]
    var historyEnabled: Boolean = false
    init {
        Log.d("ChatRepository", "instantiated")
    }

    fun setupServerEvents() {
        Singletons.socket.on("message-broadcast"){ parameters ->
            Log.d("ChatRepository","socket.on(message-broadcast) ACT")
            if(Singletons.isPartOfGame) {
                var messageJSON = JSONObject(parameters[0].toString())
                val messageToAdd = MessageManager.jsonToMessage(messageJSON)
                val messageIsForGlobal = messageToAdd.channel_name == Constants.GLOBAL_CHANNEL_NAME
                if(messageIsForGlobal) MessageManager.safeAddToChannel(globalMessages,messageToAdd)
            }
        }
    }

    /*fun clearChannels() {
        savedChannels = mutableListOf()
        savedJoinedChannels = mutableListOf()
    }*/

    fun saveMessageManagerState(savedChannels: MutableList<ChatChannel>, savedJoinedChannels: MutableList<ChatChannel>, activeChannel: ChatChannel, globalMessages:ChatChannel = this.globalMessages, inGameGlobalMesages: ChatChannel = this.inGameGlobalMessages) {
        this.savedChannels = savedChannels
        this.savedJoinedChannels = savedJoinedChannels
        this.globalMessages = globalMessages
        this.savedActiveChannel = activeChannel
        this.inGameGlobalMessages = inGameGlobalMesages
    }
}