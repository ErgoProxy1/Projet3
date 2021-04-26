package com.example.FaisMoiUnDessin.Chat

import android.annotation.SuppressLint
import android.content.Context
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView
import com.example.FaisMoiUnDessin.Singletons

class ChannelSpinnerAdapter(ctx: Context, layoutResource: Int, val channelNames: MutableList<String>): ArrayAdapter<String>(ctx, layoutResource,channelNames) {
    @SuppressLint("SetTextI18n")
    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        val originalView = super.getView(position, convertView, parent)
        /*val hasUnreadMessages = Singletons.notifManager.channelHasUnreadMessages(channelNames[position])
        Log.d("ChannelSpinnerAdapter", "notified==$hasUnreadMessages")
        if(hasUnreadMessages) {
            if(originalView is TextView) {
                originalView.text = "* ${originalView.text} *"
            }
        }*/

        return originalView
    }

}