package com.example.FaisMoiUnDessin.Chat

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import io.reactivex.rxjava3.core.Observable
import io.reactivex.rxjava3.subjects.Subject

class ChatChannelAdapter(val chatChannels: List<ChatChannel>, val selectionDone: Subject<Boolean>): RecyclerView.Adapter<ChatChannelAdapter.ChatChannelAdapterViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ChatChannelAdapterViewHolder {
        val layoutInflater = LayoutInflater.from(parent.context)
        val cellForRow = layoutInflater.inflate(R.layout.chat_channel_row, parent, false)
        return ChatChannelAdapterViewHolder(cellForRow)
    }

    override fun getItemCount(): Int {
        return chatChannels.size
    }

    override fun onBindViewHolder(holder: ChatChannelAdapterViewHolder, position: Int) {
        holder.view.apply {
            findViewById<TextView>(R.id.chat_channel_row_name).text = chatChannels[position].name
        }
    }
    inner class ChatChannelAdapterViewHolder(val view: View): RecyclerView.ViewHolder(view) {
        init {
            view.setOnClickListener {
                Log.d("ChatChannelAdapter","onCreateViewHolder")
                val chatChannel = chatChannels[adapterPosition]
                Singletons.messageManager.joinChannel(chatChannel)
                selectionDone.onNext(true)
            }
        }
    }
}