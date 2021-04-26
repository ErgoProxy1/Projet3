package com.example.FaisMoiUnDessin.Chat.Notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Context.NOTIFICATION_SERVICE
import android.os.Build
import androidx.core.content.ContextCompat.getSystemService
import com.example.FaisMoiUnDessin.Chat.ChatChannel
import com.example.FaisMoiUnDessin.Chat.ChatMessage
import com.example.FaisMoiUnDessin.Constants

class NotificationChannelGateway() {
    companion object {
        private var notifId = 0
        fun createNotificationChannel(ctx: Context) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val importance = NotificationManager.IMPORTANCE_DEFAULT
                val channel = NotificationChannel(Constants.NOTIFICATION_CHANNEL_ID, "notification channel", importance).apply {
                    description = "Notification channel for Fais moi un dessin"
                }
                // Register the channel with the system
                val notificationManager: NotificationManager = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.createNotificationChannel(channel)
            }
        }
        fun getNewNotificationId():Int {
            notifId++
            return NotificationChannelGateway.notifId
        }


    }


}