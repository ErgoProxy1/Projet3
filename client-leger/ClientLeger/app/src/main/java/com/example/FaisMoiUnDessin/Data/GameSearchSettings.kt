package com.example.FaisMoiUnDessin.Data

import com.example.FaisMoiUnDessin.Enums.Difficulty
import com.example.FaisMoiUnDessin.Enums.GameMode
import com.example.FaisMoiUnDessin.Enums.Privacy

data class GameSearchSettings(
    var gameMode: Int = GameMode.CLASSIC.ordinal,
    var difficulty: Int = Difficulty.EASY.ordinal,
    var privateGame: Int = Privacy.ANY.value,
    val friendsOnly: Boolean = false,
    var onlyHasOpenSpaces: Boolean = false,
    val hostName:String = ""
)