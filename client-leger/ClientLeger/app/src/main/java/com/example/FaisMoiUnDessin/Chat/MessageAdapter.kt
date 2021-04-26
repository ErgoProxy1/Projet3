package com.example.FaisMoiUnDessin.Chat

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.FaisMoiUnDessin.LittleHelpers.CustomViewHolder
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import java.text.SimpleDateFormat
import java.util.*
import kotlin.coroutines.coroutineContext

class MessageAdapter: RecyclerView.Adapter<CustomViewHolder>() {
    override fun getItemCount(): Int {
        return Singletons.messageManager.getNbMessages()
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CustomViewHolder {
        val layoutInflater = LayoutInflater.from(parent.context)
        val cellForRow = layoutInflater.inflate(R.layout.message_row, parent, false)
        return CustomViewHolder(cellForRow)
    }

    override fun onBindViewHolder(holder: CustomViewHolder, position: Int) {
        val message = Singletons.messageManager.getMessageAt(position)
        holder.view.findViewById<TextView>(R.id.message_username).text = message.username
        holder.view.findViewById<TextView>(R.id.message_datetime).text = this.formatTime(message.date.toDate())
        holder.view.findViewById<TextView>(R.id.message_content).text = message.text
        val messageSentByUser = Singletons.messageManager.getMessageAt(position).username == Singletons.username
        Log.d("MessageAdapter","messageSentByUser($messageSentByUser)")
        if(messageSentByUser) holder.view.setBackgroundColor(0x90C6CB)
    }

    private fun formatTime(timeToFormat: Date): String {
        val timeFormat = SimpleDateFormat("HH:mm:ss")
        return timeFormat.format(timeToFormat)
    }

}
