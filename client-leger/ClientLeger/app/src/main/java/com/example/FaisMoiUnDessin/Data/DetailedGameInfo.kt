package com.example.FaisMoiUnDessin.Data

import com.beust.klaxon.Json
import com.example.FaisMoiUnDessin.Enums.Difficulty
import com.example.FaisMoiUnDessin.Enums.GameMode
import com.google.firebase.Timestamp

data class DetailedGameInfo(var teamHasBots: List<Boolean> = listOf(),
                            val gameId: Int = -1,
                            val gameMode: Int = GameMode.CLASSIC.ordinal,
                            val hasPowerUps: Boolean = false,
                            var isStarted: Boolean = false,
                            val difficulty: Int = Difficulty.EASY.ordinal,
                            val host: String = "",
                            var userPlaying: String = "",
                            var users: List<String> = listOf(),
                            val password: String = "",
                            var roundCounter: Int = 1,
                            var teamsWaiting: List<Team> = listOf(),
                            var wordsAlreadyUsed: List<String> = listOf(),
                            var currentWord: String = "",
                            var teams: List<Team> = listOf(),
                            var correctGuesses: Int = 0,
                            var winners: List<String> = listOf(),
                            var hintList: Array<String> = Array(0){""},
                            @Json(ignored = true)
                            var start: Timestamp = Timestamp.now()
)