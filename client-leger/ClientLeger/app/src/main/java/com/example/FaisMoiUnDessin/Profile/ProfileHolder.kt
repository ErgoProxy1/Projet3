package com.example.FaisMoiUnDessin.Profile

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.widget.Toast
import com.blankj.utilcode.util.ToastUtils
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import java.net.URL
import java.text.DateFormat
import kotlin.math.max

class ProfileHolder {
    class GameResults{
        var players: List<String> = List(0){""}
        var winners: List<String> = List(0){""}
        var timeStart: Timestamp = Timestamp(0,0)
        var timeEnd: Timestamp = Timestamp(0,0)
        var points: List<Int> = List(0){0}
        var difficulty: Long = 0
        var gameMode: Long = 0
        var host: String = ""

        constructor(players: List<String>,
                    winners: List<String>,
                    timeStart: Timestamp,
                    timeEnd: Timestamp,
                    points: List<Int>,
                    difficulty: Long,
                    gameMode: Long,
                    host: String
        ){
            this.players = players
            this.winners = winners
            this.timeStart = timeStart
            this.timeEnd = timeEnd
            this.points = points
            this.difficulty = difficulty
            this.gameMode = gameMode
            this.host = host
        }

        fun difficultyToString() : String{
            return when(this.difficulty){
                0L -> "Facile"
                1L -> "Moyenne"
                2L -> "Difficile"
                else -> "N/A"
            }
        }

        fun gameModeToString() : String{
            return when(this.gameMode){
                0L -> "Classique"
                1L -> "Chacun pour soi"
                else -> "N/A"
            }
        }

        companion object{
            fun timeSortSelector(g: GameResults): Timestamp = g.timeStart

        }
    }

    private constructor(){}

    companion object{
        @Volatile var isDataRetrieved : Boolean = false

        @Volatile var nbGames : Long = 0
        @Volatile var nbWonGames : Long = 0
        @Volatile var winRatio : Float = 0f
        @Volatile var playTime : Long = 0

        @Volatile var gameResults: ArrayList<GameResults> = ArrayList()

        @Volatile var formattedTimeListConnect : List<String> = List(0){""}
        @Volatile var formattedTimeListDisconnect : List<String> = List(0){""}

        var profilePic : Bitmap = Bitmap.createBitmap(1,1,Bitmap.Config.ARGB_8888)

        fun retrieveUserData(){
            var username = Singletons.credentialsManager.userInfo.username

            var db = FirebaseFirestore.getInstance()
            var docRefUser = db.collection("users").whereEqualTo("username", username)

            docRefUser.get().addOnSuccessListener {
                if(it.documents.size > 0) {
                    val timeListConnect = it.documents[0]["connections"] as List<Timestamp>
                    formattedTimeListConnect = List<String>(timeListConnect.size) { index -> timeListConnect[index].toDate().toString() }

                    val timeListDisconnect = it.documents[0]["disconnections"] as List<Timestamp>
                    formattedTimeListDisconnect = List<String>(timeListDisconnect.size) { index -> timeListDisconnect[index].toDate().toString() }

                    nbGames = it.documents[0]["gamesPlayed"] as Long
                    nbWonGames = it.documents[0]["gamesWon"] as Long
                    winRatio = nbWonGames.toFloat()/(max(nbGames, 1))

                    playTime = it.documents[0]["totalPlayTime"] as Long

                    Thread{
                        var textUrl = it.documents[0]["avatar"] as String

                        if(textUrl != ""){
                            var url: URL = URL(it.documents[0]["avatar"] as String)
                            try{
                                profilePic = BitmapFactory.decodeStream(url.openConnection().getInputStream())
                            } catch (e: Exception) {
                                ToastUtils.showShort("Probleme a la creation d'une photo de profil")
                            }


                        }

                    }.start()
                }

                isDataRetrieved = true
            }

            retrieveGameData()
        }

        private fun retrieveGameData() {
            val username = Singletons.credentialsManager.userInfo.username

            val db = FirebaseFirestore.getInstance()
            val docRefGames = db.collection("games").whereArrayContains("players", username)
            gameResults.clear()

            docRefGames.get().addOnSuccessListener {snap ->
                snap.documents.forEach { doc ->
                    val result = GameResults(
                            doc["players"] as List<String>,
                            doc["winners"] as List<String>,
                            doc["timeStart"] as Timestamp,
                            doc["timeEnd"] as Timestamp,
                            doc["points"] as List<Int>,
                            doc["difficulty"] as Long,
                            doc["gameMode"] as Long,
                            doc["host"] as String
                            )
                    gameResults.add(result)
                }
                gameResults.sortBy { GameResults.timeSortSelector(it) }
            }
        }
    }

}