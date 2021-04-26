package com.example.FaisMoiUnDessin

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser

class Constants {
    companion object{
        val MAX_USERNAME_LENGTH = 16
        val MAX_MESSAGE_LENGTH = 200
        val DRAWING_PIXEL_WIDTH = 800
        val DRAWING_PIXEL_HEIGHT = 600
        const val DEFAULT_AVATAR_LINK: String = "https://firebasestorage.googleapis.com/v0/b/projet3-111.appspot.com/o/avatars%2Fdefaults%2Fbase_avatar.png?alt=media&token=999dac5c-d6ce-4119-8e83-66ed30538354"
        val MAX_TEAM_SIZE_CLASSIC = 2
        val MAX_TEAM_SIZE_FFA = 8

        val IN_GAME_GLOBAL_CHANNEL_NAME = "Tous"
        val GLOBAL_CHANNEL_NAME = "Global"
        val IMMORTAL_CHANNELS = listOf(IN_GAME_GLOBAL_CHANNEL_NAME,GLOBAL_CHANNEL_NAME)

        val NOTIFICATION_CHANNEL_ID = "un truc au pif"
    }
}
