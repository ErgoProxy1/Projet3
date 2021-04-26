package com.example.FaisMoiUnDessin.Data

data class NewGameInfo(val host: String,
                       val gameMode: Int,
                       val gotPower: Boolean,
                       val difficulty: Int,
                       val password: String)