package com.example.FaisMoiUnDessin.Chat

import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.util.Log
import android.widget.TextView
import com.beust.klaxon.Klaxon
import com.example.FaisMoiUnDessin.Constants
import com.example.FaisMoiUnDessin.Data.ChannelInfo
import com.example.FaisMoiUnDessin.Data.ChannelsListInfo
import com.example.FaisMoiUnDessin.Data.InitChannelRequestInfo
import com.example.FaisMoiUnDessin.Data.OurTimeStamp
import com.example.FaisMoiUnDessin.LittleHelpers.ObservableRepository
import com.example.FaisMoiUnDessin.LittleHelpers.TextValidator
import com.example.FaisMoiUnDessin.Singletons
import com.google.firebase.Timestamp
import io.reactivex.rxjava3.subjects.PublishSubject
import org.json.JSONObject
import java.util.*


class MessageManager(val inGame: Boolean) {
    val channelsHaveChanged: PublishSubject<Boolean> = PublishSubject.create<Boolean>()
    //get() = ObservableRepository.messageManagerChannelsHaveChanged
    val messagesHaveChanged: PublishSubject<Boolean>
    get() = ObservableRepository.messagesHaveChanged
    private var allChannels: MutableList<ChatChannel> = mutableListOf(ChatChannel("", Constants.GLOBAL_CHANNEL_NAME)) // = mutableListOf(if(inGame)ChatChannel(Singletons.gameId.toString(),Constants.IN_GAME_GLOBAL_CHANNEL_NAME,"") else Singletons.chatRepository.globalMessages)
    private var joinedChannels/*: MutableList<ChatChannel>*/ = mutableListOf(allChannels[0])
    private var activeChannel/*:ChatChannel*/ = joinedChannels[0]
    private var historyEnabled = false
    var joinedChannelNames: MutableList<String> = mutableListOf()
    get() {
        val tempChannelNames = mutableListOf<String>()
        for(channel in joinedChannels) {
            tempChannelNames.add(channel.name)
        }
        Log.d("MessageManager", "*+* Access to this.channelNames as:\n$tempChannelNames\n" +
                "with joinedChannels==${this.joinedChannels}\n" +
                "with this==$this")
        return tempChannelNames
    }

    private var recentMessages = ChatChannel()
    private lateinit var messageTextField: TextView
    private var visibleChannel = ChatChannel()
    get() {
        if(historyEnabled){ return this.activeChannel }
        else{
            val ac= this.activeChannel.copy()
            val lastConnection = Singletons.credentialsManager.lastConnection.toDate()
            //val pred = { m: ChatMessage -> m.date.toDate().after(lastConnection)}
            if(ac.messages.any{messageIsRecent(it)}) {
                val ib1 = ac.messages.filter { messageIsRecent(it)}
                ac.messages = ac.messages.filter { messageIsRecent(it)}.toMutableList()
            } else {
                ac.messages = mutableListOf()
            }
            return ac
        }
    }

    private fun messageIsRecent(chatMassage: ChatMessage): Boolean {
        val messageDate = chatMassage.date.toDate()
        val latestConnection = Singletons.credentialsManager.lastConnection.toDate()
        return  messageDate.after(latestConnection)
    }

    init {
        Log.d("MessageManager", "]] -- Instantiated with this.inGame==$inGame")
        this.setupServerEvents()
        Log.d("MessageManager", "About to access channel; names")
        //restoreChannelsFromRepository(Singletons.isPartOfGame)
        requestChannelsList()
    }


    companion object{
        fun jsonToMessage(jsonMessage: JSONObject): ChatMessage {
            val chatMessage: ChatMessage = Klaxon().fieldConverter(OurTimeStamp::class, CustomMessageConverter.timeStampCustomConverter).parse<ChatMessage>(jsonMessage.toString())!!//Klaxon().parse<ChatMessage>(jsonMessage.toString())!!
            //var time = JSONObject(jsonMessage.getString("date"))
            //var timestamp = Timestamp(time.getLong("seconds"), time.getInt("nanoseconds"))
            //chatMessage.date = timestamp
            return chatMessage
        }

        fun safeAddToChannel(channel: ChatChannel, chatMessage: ChatMessage) {
            val redundantMessage = if(channel.messages.size==0) false else channel.messages.last() == chatMessage
            if(!redundantMessage){
                channel.messages.add(chatMessage)
            }
        }
    }

    private fun requestChannelsList() {
        val requestInfo = InitChannelRequestInfo(if (Singletons.isPartOfGame) Singletons.gameId.toString() else "", Singletons.username)
        Log.d("MessageManager", "requestChannelsList()\nrequestInfo==$requestInfo")
        Singletons.socket.emit("request-init-channels", Klaxon().toJsonString(requestInfo))
    }

    private fun onReceiveChannelsList(channelsListJsonStr: String) {
        val channelsList = Klaxon().fieldConverter(OurTimeStamp::class, CustomMessageConverter.timeStampCustomConverter).parse<ChannelsListInfo>(channelsListJsonStr)
        /*for (channel in channelsList!!.channels) {
            channel.messages.forEach { msg ->
                msg.date = Timestamp(msg)
            }
        }*/
        allChannels = channelsList!!.channels.toMutableList()
        if(channelsList.joined.isNotEmpty()) {
            this.joinedChannels.clear()
            this.joinedChannels.addAll(this.allChannels.filter { c -> channelsList.joined.contains(c.name) })
            this.activeChannel = joinedChannels[0]
        }
        Log.d("MessageManager", "onReceiveChannelsList $channelsListJsonStr")
        Singletons.notifManager.cleanoutDeadChannels()
        this.channelsHaveChanged.onNext(true)
    }

    fun setupServerEvents() {
        Singletons.socket.on("receive-new-channel") {onChannelReceived(it[0].toString())}
        Singletons.socket.on("receive-delete-channel") {onChannelDeletion(it[0].toString())}
        Singletons.socket.on("receive-channels-list") {onReceiveChannelsList(it[0].toString())}

        if(Singletons.isInLobby) this.requestNewChannels()
        Log.d("MessageManager", "(=) setupServerEvents() finished")
    }

    fun getNbMessages(): Int {
        return this.visibleChannel.messages.size
    }

    fun getMessageAt(idx: Int): ChatMessage {
        return visibleChannel.messages[idx]
    }

    private fun requestNewChannels() {
        val request = InitChannelRequestInfo(Singletons.gameId.toString(), Singletons.username)
        Log.d("MessageManager", "Singletons.socket.emit(\"request-init-channels\", ${Klaxon().toJsonString(request)}")
        Singletons.socket.emit("request-init-channels", Klaxon().toJsonString(request))
    }

    /*fun setupForGameContext() {
        allChannels = mutableListOf(ChatChannel("",if(inGame)"Tous" else "Global",""),ChatChannel("1","Saulis",""),ChatChannel("2","Poytkdsfes",""))//TODO remove extra channels
        setupAuxiliaryChannels()
    }

    fun setupForMaineMenuContext() {
        allChannels = mutableListOf(ChatChannel("",if(inGame)"Tous" else "Global",""),ChatChannel("1","Saulis",""),ChatChannel("2","Poytkdsfes",""))//TODO remove extra channels
        setupAuxiliaryChannels()
    }*/

    fun setHistory(enableHistory: Boolean) {
        val historyAlreadyEnabled = this.historyEnabled
        this.historyEnabled = enableHistory
        val redundantRequest = !(enableHistory xor historyAlreadyEnabled)
        if(redundantRequest) return
        this.recentMessages.messages.clear()
        //this.visibleChannel = if(enableHistory) this.activeChannel else this.recentMessages
        messagesHaveChanged.onNext(true)
        //Singletons.messageAdapter.notifyDataSetChanged()
    }

    /*private fun saveChannelsToRepository(partOfGame: Boolean) {
        return
        Log.d("MessageManager","/repFlow/ saveChannelsToRepository($partOfGame)")
        val contextSwitch = this.isSetupForGame() xor partOfGame
        val switchingFromMainToGame = contextSwitch && partOfGame
        val switchingFromGameToMain = contextSwitch && !partOfGame
        val goingFromGameToGame = !contextSwitch && partOfGame
        val goingFromMainToMain = !contextSwitch && !partOfGame
        val rep = Singletons.chatRepository
        when {
            switchingFromMainToGame-> {
                Log.d("MessageManager","/repFlow/ M->G")
                //Singletons.chatRepository.saveMessageManagerState(this.allChannels,this.joinedChannels,this.activeChannel,this.getGlobalChannel()!!)
                rep.globalMessages = this.getGlobalChannel()!!
            }
            switchingFromGameToMain-> {
                Log.d("MessageManager","/repFlow/ G->M")
                //Nothing to do expect remove this thing
                //this.joinedChannels.clear()
                //this.allChannels= mutableListOf(this.getGlobalChannel())
            }
            goingFromGameToGame-> {
                Log.d("MessageManager","/repFlow/ G->G")
                Singletons.chatRepository.saveMessageManagerState(this.allChannels,this.joinedChannels,this.activeChannel,inGameGlobalMesages = this.getInGameGlobalChannel()!!)
            }
            goingFromMainToMain-> {
                Log.d("MessageManager","/repFlow/ M->M")
                Singletons.chatRepository.saveMessageManagerState(this.allChannels,this.joinedChannels,this.activeChannel,globalMessages = this.getGlobalChannel()!!)
            }
        }
        rep.historyEnabled = this.historyEnabled
    }

    private fun restoreChannelsFromRepository(partOfGame: Boolean) {
        return
        Log.d("MessageManager","/repFlow/ restoreChannelsFromRepository($partOfGame)")
        val contextSwitch = this.isSetupForGame() xor partOfGame
        val switchingFromMainToGame = contextSwitch && partOfGame
        val switchingFromGameToMain = contextSwitch && !partOfGame
        val goingFromGameToGame = !contextSwitch && partOfGame
        val goingFromMainToMain = !contextSwitch && !partOfGame
        val rep = Singletons.chatRepository
        when {
            switchingFromMainToGame-> {
                Log.d("MessageManager","/repFlow/ M->G")
                this.allChannels = mutableListOf(ChatChannel(Singletons.gameId.toString(),Constants.IN_GAME_GLOBAL_CHANNEL_NAME))
                this.joinedChannels = mutableListOf(this.allChannels[0])
                this.activeChannel = this.allChannels[0]
            }
            switchingFromGameToMain-> {
                Log.d("MessageManager","/repFlow/ G->M")
                this.allChannels = mutableListOf(rep.globalMessages)
                this.joinedChannels = mutableListOf(this.allChannels[0])
                this.activeChannel = this.allChannels[0]
            }
            goingFromGameToGame||goingFromMainToMain-> {
                if(goingFromGameToGame) Log.d("MessageManager","/repFlow/ G->G")
                else Log.d("MessageManager","/repFlow/ M->M")
                this.allChannels = rep.savedChannels
                this.joinedChannels = rep.savedJoinedChannels
                this.activeChannel = rep.savedActiveChannel

            }
        }
        this.historyEnabled = rep.historyEnabled
    }*/

    /*private fun getGlobalChannel():ChatChannel? {
        return this.getChannelWithName(Constants.GLOBAL_CHANNEL_NAME)
    }

    private fun getInGameGlobalChannel(): ChatChannel? {
        return this.getChannelWithName(Constants.IN_GAME_GLOBAL_CHANNEL_NAME)
    }

    private fun getChannelWithName(name: String): ChatChannel? {
        return try {
            this.allChannels.first { c->c.name.compareTo(name)==0 }
        }
        catch (e: Exception) {
            null
        }

    }*/

    fun onChannelSwitch(idx: Long) {
        Log.d("MessageManager", "<()> on channel switch $idx")
        this.activeChannel = this.joinedChannels[idx.toInt()]
        this.recentMessages.messages.clear()
        Singletons.notifManager.notifyChannelRead(this.activeChannel)
        messagesHaveChanged.onNext(true)
    }

    fun onMessageSend(uiField: TextView) {
        Log.d("Message Manager field", uiField.text.toString())
        this.messageTextField = uiField
        if(TextValidator.textFieldIsValidMessage(this.messageTextField, "message", Constants.MAX_MESSAGE_LENGTH)) {
            Log.d("Message Manager field", "Message is valid")
            val currentMessage = this.getMessageFromForm()
            this.addMessage(currentMessage)
            this.sendMessage(currentMessage)
            this.clearMessageTextField()
        } else if (!TextValidator.textFieldIsVisible(this.messageTextField, "message")) {
            Log.d("Message Manager field", "text field not visible!")
            this.clearMessageTextField()
        }
    }

    fun onMessageReceive(message: JSONObject) {
        this.addMessage(jsonToMessage(message))

    }


    fun askToAddChannel(channelName: String) {
        val gameId = if(Singletons.isPartOfGame) Singletons.gameId.toString() else ""
        val chatChannelToAdd = ChatChannel(gameId, channelName, Singletons.credentialsManager.userInfo.username)
        Log.d("MessageManager", "Asking to add channel: $chatChannelToAdd")
        this.addChannel(chatChannelToAdd)
        Singletons.socket.emit("send-new-channel", Klaxon().toJsonString(chatChannelToAdd))
    }

    private fun onChannelReceived(channelResponse: String) {
        Log.d("MessageManager", "<()> Received channel: $channelResponse")
        val channel = Klaxon().parse<ChatChannel>(channelResponse)
        if (channel != null) {
            this.addChannel(channel)
        }
    }

    private fun addChannel(chatChannel: ChatChannel) {
        val channelAlreadyExists = (this.allChannels.any { it.name == chatChannel!!.name })
        if(channelAlreadyExists) return
        this.allChannels.add(chatChannel)
        val createdByClient = chatChannel.creator == Singletons.credentialsManager.userInfo.username
        Log.d("MessageManager", "<()> createdByClient==$createdByClient")
        //this.saveChannelsToRepository(Singletons.isPartOfGame)
        if(createdByClient) this.joinChannel(chatChannel, true)
    }

    fun joinChannel(chatChannel: ChatChannel, justCreatedByClient: Boolean = false){
        this.joinedChannels.add(chatChannel)
        if(!justCreatedByClient) Singletons.socket.emit("user-joined-channel", Klaxon().toJsonString(ChannelInfo(chatChannel.gameId, chatChannel.name)))
        Log.d("MessageManager", "<()> joinChannel($chatChannel)")
        this.onChannelSwitch(joinedChannels.indexOf(chatChannel).toLong())
        Log.d("MessageManager", "*+* channelsHaveChanged.onNext(true)\nwith joinedChannels==${this.joinedChannels}\nwith this==$this")
        //this.saveChannelsToRepository(Singletons.isPartOfGame)
        channelsHaveChanged.onNext(true)
    }

    fun askToLeaveChannel() {
        val channelToLeave = this.activeChannel
        val channelIsImmortal = Constants.IMMORTAL_CHANNELS.contains(channelToLeave.name)
        Log.d("MessageManager", "<()> Asking to delete ${Klaxon().toJsonString(this.activeChannel)}\nchannelIsImmortal==$channelIsImmortal")
        if(channelIsImmortal) return
        this.leaveChannel(channelToLeave)
    }

    private fun isSetupForGame(): Boolean {
        return this.allChannels.any { c-> c.name == Constants.IN_GAME_GLOBAL_CHANNEL_NAME }
    }

    private fun onChannelDeletion(channelToDeleteJson: String) {
        val channelInfo = Klaxon().parse<ChannelInfo>(channelToDeleteJson)
        Log.d("MessageManager", "<()> onChannelDelete(${channelInfo!!.channel_name})")
        val channelToDeleteExists = this.allChannels.map { it.name }.contains(channelInfo!!.channel_name)
        if(this.allChannels.isNotEmpty() && channelToDeleteExists) {
            this.deleteChannel(this.allChannels.first { channel -> channel.name.compareTo(channelInfo.channel_name) == 0 })
        }
    }

    /*private fun onGetInitChannels(receivedChannelsJSON:String) {
        Log.d("MessageManager", "received init channels as $receivedChannelsJSON")
        val newChannels = Klaxon().parseArray<InitChatChannel>(receivedChannelsJSON)!!
        newChannels.forEach { c-> this.allChannels.add(ChatChannel(Singletons.gameId.toString(),c.name,c.creator)) }
        this.saveChannelsToRepository(Singletons.isPartOfGame)
    }*/

    private fun deleteChannel(channelToDelete: ChatChannel) {
        Log.d("MessageManager", "deleteChannel($channelToDelete)")
        val tryingToDeleteImmortalChannel = Constants.IMMORTAL_CHANNELS.contains(channelToDelete.name)
        if(tryingToDeleteImmortalChannel) return
        leaveChannel(channelToDelete)
        this.allChannels.remove(channelToDelete)
        //this.saveChannelsToRepository(Singletons.isPartOfGame)
    }

    private fun leaveChannel(channelToLeave: ChatChannel) {
        val tryingToLeaveImmortalChannel = Constants.IMMORTAL_CHANNELS.contains(channelToLeave.name)
        if(tryingToLeaveImmortalChannel) return
        Log.d("MessageManager", "leaveChannel($channelToLeave)")
        val leavingActiveChannel = (this.activeChannel == channelToLeave)
        this.joinedChannels.remove(channelToLeave)
        Singletons.socket.emit("user-left-channel", Klaxon().toJsonString(ChannelInfo(channelToLeave.gameId, channelToLeave.name)))
        if(leavingActiveChannel) {
            if(this.joinedChannels.isNotEmpty()) this.activeChannel = this.joinedChannels[0]
        }
        //this.saveChannelsToRepository(Singletons.isPartOfGame)
        channelsHaveChanged.onNext(true)
    }


    private fun addMessage(chatMessage: ChatMessage) {
        Log.d("MessageManager", "-- addMessage($chatMessage)\nactive == ${activeChannel.name}\nrecent messages == ${recentMessages.messages}")
        for(channel in allChannels) {
            val channelIsFit = channel.name == chatMessage.channel_name && channel.gameId == chatMessage.gameId
            if(channelIsFit) {
                val channelIsHidden = channel != this.activeChannel
                val channelHasBeenJoined = this.joinedChannels.contains(channel)
                val messageIsRedundant = if(channel.messages.isEmpty()) false else channel.messages.last()==chatMessage
                safeAddToChannel(channel, chatMessage)
                if(channelIsHidden  && channelHasBeenJoined && !messageIsRedundant) Singletons.notifManager.registerNewMessage(channel)
                Log.d("MessageManager", "-- message added to (${channel.name})")
                if(channel == this.activeChannel) {
                    safeAddToChannel(this.recentMessages, chatMessage)
                }
            }
        }
        //this.activeChannel.messages.add(chatMessage)
        //if(this.activeChannel != this.visibleChannel) this.visibleChannel.messages.add(chatMessage)
        Log.d("MessageManager", "-- messagesHaveChanged.onNext(true)")
        messagesHaveChanged.onNext(true)
    }

    private fun sendMessage(chatMessage: ChatMessage){
        Log.d("Message we send", chatMessage.toString())
        var metaMessage = JSONObject("{\"username\": \"${chatMessage.username}\"," +
                "\"date\": {\"seconds\":${chatMessage.date.seconds},\"nanoseconds\":${chatMessage.date.nanoseconds}}," +
                "\"text\": \"${chatMessage.text}\"," +
                "\"gameId\": \"${activeChannel.gameId}\"," +
                "\"channel_name\": \"${this.activeChannel.name}\"}")
        Singletons.socket.emit("message", metaMessage.toString())
    }

    private fun getMessageFromForm(): ChatMessage {
        return ChatMessage(Singletons.credentialsManager.userInfo.username, Timestamp.now(), this.messageTextField.text.toString().trim(), this.activeChannel.name, this.activeChannel.gameId)//TODO use firebase timestamp instead (like Jaafar mentionned)
    }

    private fun clearMessageTextField() {
        this.messageTextField.text = ""
    }
    fun getJoinableChannels(): List<ChatChannel> {
        val joinableChannels = Vector<ChatChannel>()
        this.allChannels.forEach {
            if(!joinedChannels.contains(it)) joinableChannels.add(it)
        }
        return joinableChannels
    }

    fun getActiveChannelName() = this.activeChannel.name

    fun getAllChannelNames() = this.allChannels.map { it.name }


}