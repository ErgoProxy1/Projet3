package com.example.FaisMoiUnDessin.Data

import com.example.FaisMoiUnDessin.Enums.Difficulty
import com.example.FaisMoiUnDessin.Enums.GameMode

data class GameInfo(val gameId: Int = 777,
                    var gameMode:Int = GameMode.CLASSIC.ordinal,
                    var difficulty: Int = Difficulty.NORMAL.ordinal,
                    var powersEnabled: Boolean = false,
                    var host: String = "",
                    var users: List<String> = listOf(),
                    var password: String = "", )