package com.example.FaisMoiUnDessin.Chat


import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.*
import android.view.inputmethod.EditorInfo
import android.widget.*
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

import androidx.fragment.app.Fragment
import com.example.FaisMoiUnDessin.Chat.Notifications.NotificationBellCustomView
import com.example.FaisMoiUnDessin.Chat.Notifications.NotificationChannelGateway
import com.example.FaisMoiUnDessin.Constants.Companion.NOTIFICATION_CHANNEL_ID
import com.example.FaisMoiUnDessin.Consts.OptionStrings
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import io.reactivex.rxjava3.core.Single
import io.reactivex.rxjava3.kotlin.subscribeBy
import org.json.JSONObject
import java.lang.IllegalStateException

class ChatFragment : Fragment(R.layout.fragment_chat) {

    var partOfGame = false
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        partOfGame = Singletons.isPartOfGame
        Log.d("ChatFragment","]] createView, partOfGame==$partOfGame")
        return inflater.inflate(R.layout.fragment_chat, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.d("ChatFragment","]] onViewCreated()")
        Log.d("OnViewCreated","Giving adapter!!!")
        var recyclerView = requireView().findViewById<RecyclerView>(R.id.recyclerView_messages)
        recyclerView.apply {
            val layMan = LinearLayoutManager(activity)
            //layMan.stackFromEnd
            // layMan.stackFromEnd = true
            layMan.stackFromEnd = false //Stacks from start
            layoutManager = layMan
            adapter = Singletons.messageAdapter
        }

        val bell = activity?.findViewById<NotificationBellCustomView>(R.id.chat_notification_bell_view)
        if(bell != null) {
            activity?.runOnUiThread {
                if(Singletons.notifManager.unreadMessages()) bell.show() else bell.hide()
            }

        }

        this.setUpViewEvents()
    }


    override fun onResume() {
        super.onResume()
        Log.d("ChatFragment","inGame==$partOfGame")
        if (partOfGame) setForGameChat() else setForGlobalChat()
        //this.setUpViewEvents()
        //Singletons.notifManager.cleanoutDeadChannels()
        //Singletons.messageManager.setupServerEvents()
    }

    fun setUpViewEvents() {
        val spinner = requireView().findViewById<Spinner>(R.id.channel_spinner)
        var arrayAdapter = this.context?.let { ChannelSpinnerAdapter(it,android.R.layout.simple_spinner_item,Singletons.messageManager.joinedChannelNames) }
        spinner.adapter = arrayAdapter
        arrayAdapter!!.setNotifyOnChange(true)
        Log.d("ChatFragment","]] *+* <()> listening to channelsHaveChanged with Singletons.messageManager ==${Singletons.messageManager} ")
        Singletons.messageManager.channelsHaveChanged.subscribeBy ( onNext={
            Log.d("ChatFragment","*+* <()> messageManager.channelsHaveChanged.subscribeBy()\nthis.activity==${this.activity}\nwith messageManager==${Singletons.messageManager}\nwith name==${Singletons.messageManager.joinedChannelNames}")
            requireActivity().runOnUiThread {
                Log.d("ChatFragment","*+* <()> requireActivity().runOnUiThread{ \nthis.activity==${this.activity}\nwith messageManager==${Singletons.messageManager}")
                Log.d("ChatFragment","<()> channelNamesIs: ${Singletons.messageManager.joinedChannelNames}")
                val adapter = this.context?.let {ChannelSpinnerAdapter(it,android.R.layout.simple_spinner_item, Singletons.messageManager.joinedChannelNames)}
                adapter?.setNotifyOnChange(true)
                if(adapter !== null) {
                    spinner.adapter = adapter
                    (spinner.adapter as ChannelSpinnerAdapter?)?.notifyDataSetChanged()
                    spinner.setSelection(Singletons.messageManager.joinedChannelNames.indexOfFirst { it.compareTo(Singletons.messageManager.getActiveChannelName()) == 0 })
                    Singletons.messageAdapter.notifyDataSetChanged()
                }
                //Log.d("ChatFragment","<()> ActiveChannelIs: ${Singletons.messageManager.activeChannel}")
            }

            }, onError = { Log.d("ChatFragment","<()> -- Error updating view as: $it") })
        Log.d("ChatFragment","]] -- messageManager.messagesHaveChanged.subscribeBy() LISTENING")
        Singletons.messageManager.messagesHaveChanged.subscribeBy( onNext={
                Log.d("ChatFragment","<()> -- messageManager.messagesHaveChanged.subscribeBy()\n activity is $activity")
                activity?.runOnUiThread {
                    Singletons.messageAdapter.notifyDataSetChanged()
                    var recyclerView = requireView().findViewById<RecyclerView>(R.id.recyclerView_messages)
                    Log.d("ChatFragment","recyclerView.scrollToPosition(${Singletons.messageAdapter.itemCount-1})")
                    recyclerView.scrollToPosition(Singletons.messageAdapter.itemCount-1)
                    //Singletons.messageAdapter.notifyItemInserted(Singletons.messageAdapter.itemCount-1)
                } })

        class SpinnerListener: AdapterView.OnItemSelectedListener {
            override fun onNothingSelected(parent: AdapterView<*>?) {}
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                Log.d("ChatFragment","<()> SpinnerListener.onChannelSwitch($id)")
                Singletons.messageManager.onChannelSwitch(id)
            }
        }
        spinner.onItemSelectedListener = SpinnerListener()

        //Channel deletion
        var deleteButton = requireView().findViewById<ImageView>(R.id.button_delete_channel)
        deleteButton.setOnClickListener {_ ->
            Singletons.messageManager.askToLeaveChannel()
        }

        var addButton = requireView().findViewById<ImageView>(R.id.button_add_channel)
        addButton.setOnClickListener {it ->
            val popupMenu = PopupMenu(requireContext(),it).apply { inflate(R.menu.base_empty_menu) }
            listOf(OptionStrings.ADD_CHANNEL, OptionStrings.JOIN_CHANNEL).forEach { popupMenu.menu.add(it) }
            popupMenu.setOnMenuItemClickListener {
                Log.d("ChatFragment","channel opt: $it")
                if(context != null) Singletons.optionManager.actUponChannelCreationMenu(requireContext(),it.toString())
                return@setOnMenuItemClickListener true
            }
            popupMenu.show()
        }

        var likeButton = requireView().findViewById<ImageView>(R.id.likeButton)
        likeButton.visibility = if(Singletons.isInGame) View.VISIBLE else View.GONE
        likeButton.setOnClickListener {
            Singletons.socket.emit("send-reaction","{\"gameId\": ${Singletons.gameId}, \"username\": \"${Singletons.username}\", \"reaction\": \"like\"}")
        }

        var dislikeButton = requireView().findViewById<ImageView>(R.id.dislikeButton)
        dislikeButton.visibility = if(Singletons.isInGame) View.VISIBLE else View.GONE
        dislikeButton.setOnClickListener {
            Singletons.socket.emit("send-reaction","{\"gameId\": ${Singletons.gameId}, \"username\": \"${Singletons.username}\", \"reaction\": \"dislike\"}")
        }
    }

    private fun setForGameChat() {

    }
    private fun setForGlobalChat() {
        //requireView().findViewById<ConstraintLayout>(R.id.chat_channel_modification_layout).visibility = View.GONE//Hiding multiple channels
    }

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        init()
    }

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    private fun init() {
        //var textViewUsername = requireView().findViewById<TextView>(R.id.textViewUsername) //Was for the name atop the fragment
        //textViewUsername.text = Singletons.credentialsManager.userInfo.username

        setupServerEvents()
        setupEvents()
    }

    private fun setupServerEvents() {
        Singletons.socket.on("message-broadcast"){ parameters ->
            Log.d("ChatFragment","socket.on(message-broadcast) ACT")
            var messageJSON = JSONObject(parameters[0].toString())
            triggerRingtone()
            activity?.runOnUiThread(Thread(){
                Singletons.messageManager.onMessageReceive(messageJSON)
            })
        }
    }

    private fun triggerRingtone() {
        val defaultRingtoneUri: Uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val mediaPlayer = MediaPlayer()
        context?.apply {
            mediaPlayer.setDataSource(this,defaultRingtoneUri)
            mediaPlayer.prepare()
            mediaPlayer.start()
        }
    }

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    private fun setupEvents(){
        var button = requireView().findViewById<Button>(R.id.button_send)
        button.setOnClickListener {
            Singletons.messageManager.onMessageSend(requireActivity().findViewById(R.id.text_field))
        }
        var textInput = requireView().findViewById<EditText>(R.id.text_field)
        textInput.setOnEditorActionListener() { _, actionId, event ->
            if (actionId == EditorInfo.IME_ACTION_DONE || (event.keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_DOWN)) {
                button.performClick();
                true
            } else {
                false
            }
        }
        requireView().findViewById<Switch>(R.id.chat_history_switch).setOnCheckedChangeListener { _, isChecked -> Singletons.messageManager.setHistory(isChecked)
        }
        Singletons.notifManager.newUnreadMessageNotifier.subscribeBy( onNext={channel->
            activity?.let {
                if (!Singletons.notifManager.channelAlreadyNotified(channel)){
                    val builder = NotificationCompat.Builder(it,NOTIFICATION_CHANNEL_ID)
                            .setSmallIcon(R.drawable.ic_confirm_check_mark)
                            .setContentTitle("Message dans ${channel.name}")
                            .setContentText("${channel.messages.last().username} a dit\n${channel.messages.last().text}")
                            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    with(NotificationManagerCompat.from(requireActivity())) {
                        notify(NotificationChannelGateway.getNewNotificationId(),builder.build())
                    }
                    Singletons.notifManager.registerMessageAsNotified(channel.messages.last())
                    Log.d("ChatFragment","Sent notif")
                }

            }}, onError = {
            Log.d("ChatFragment","error un subscribe unreadMessage as:\n$it")
        })
        val notifBell = activity?.findViewById<NotificationBellCustomView>(R.id.chat_notification_bell_view)
        Singletons.notifManager.noNewMessagesNotifier.subscribe {
            activity?.runOnUiThread {
                notifBell?.hide()
            }
        }


        Singletons.notifManager.newUnreadMessageNotifier.subscribe {
            activity?.runOnUiThread {
                notifBell?.setMessageCount(Singletons.notifManager.nbUnreadMessages())
                notifBell?.show()
            }
        }
        Singletons.notifManager.someMessagesReadNotifier.subscribe {
            activity?.runOnUiThread {
                notifBell?.setMessageCount(Singletons.notifManager.nbUnreadMessages())
                notifBell?.show()
            }
        }
    }
}