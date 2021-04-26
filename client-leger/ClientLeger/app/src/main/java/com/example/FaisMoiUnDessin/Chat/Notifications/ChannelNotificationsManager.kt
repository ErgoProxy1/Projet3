package com.example.FaisMoiUnDessin.Chat.Notifications

import android.util.Log
import com.example.FaisMoiUnDessin.Chat.ChatChannel
import com.example.FaisMoiUnDessin.Chat.ChatMessage
import com.example.FaisMoiUnDessin.Singletons
import io.reactivex.rxjava3.subjects.PublishSubject

class ChannelNotificationsManager() {
    val newUnreadMessageNotifier = PublishSubject.create<ChatChannel>()
    val noNewMessagesNotifier = PublishSubject.create<Boolean>()
    val someMessagesReadNotifier = PublishSubject.create<ChatChannel>()
    private var lastPassedMessage = ChatMessage()
    private var alreadyNotifiedMessages = mutableListOf<ChatMessage>()
    private val flaggedChannels = HashMap<String,Int>()

    fun registerNewMessage(chatChannel: ChatChannel) {
        //Log.d("ChannelNotifications","ADD ${chatChannel.name}")
        val clientAlreadyNotified = this.flaggedChannels.contains(chatChannel.name)
        if(!clientAlreadyNotified){
            this.flaggedChannels[chatChannel.name] = 1
        } else {
            this.flaggedChannels[chatChannel.name] = this.flaggedChannels[chatChannel.name]!!.plus(1)
        }
        this.notifyClientWithNewMessage(chatChannel)
    }

    fun notifyChannelRead(chatChannel: ChatChannel) {
        //Log.d("ChannelNotifications","REMOVE ${chatChannel.name}")
        this.flaggedChannels.remove(chatChannel.name)
        if(!unreadMessages()) noNewMessagesNotifier.onNext(true) else { someMessagesReadNotifier.onNext(chatChannel) }
    }

    fun channelHasUnreadMessages(channelName:String): Boolean {
        return this.flaggedChannels.any { c-> c.key.compareTo(channelName)==0 }
    }

    fun unreadMessages(): Boolean = this.flaggedChannels.isNotEmpty()

    private fun notifyClientWithNewMessage(chatChannel: ChatChannel) {
        if(chatChannel.messages.isNotEmpty()) {//This should always be true
            Log.d("ChannelNotifications","notifyClientWithNewMessage(chName==${chatChannel.name})")
            //NotificationCompat.Builder(this,)
            if(chatChannel.messages.last()!=lastPassedMessage){
                newUnreadMessageNotifier.onNext(chatChannel)
                lastPassedMessage = chatChannel.messages.last()
            }
        }
    }

    fun nbUnreadMessages(): Int {
        var sum = 0
        this.flaggedChannels.values.forEach{nbUnreadMessages -> sum += nbUnreadMessages}
        return sum
    }

    fun registerMessageAsNotified(chatMessage: ChatMessage) = alreadyNotifiedMessages.add(chatMessage)
    fun channelAlreadyNotified(chatChannel: ChatChannel): Boolean = if(chatChannel.messages.isEmpty()) true else  alreadyNotifiedMessages.contains(chatChannel.messages.last())

    fun cleanoutDeadChannels() {

        val liveChannelNames = Singletons.messageManager.getAllChannelNames()
        val channelsToForget = mutableListOf<String>()

        this.flaggedChannels.forEach{it ->
            val mustForgetChannel = !liveChannelNames.contains(it.key)
            if (mustForgetChannel) channelsToForget.add(it.key)
        }
        Log.d("ChannelNotifications","cleanoutDeadChannels\nliveChannelNames==$liveChannelNames\nchannelsToForget==$channelsToForget")
        channelsToForget.forEach { this.flaggedChannels.remove(it) }
    }
}