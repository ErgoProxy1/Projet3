package com.example.FaisMoiUnDessin.Profile

import android.content.Context
import android.graphics.Canvas
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import com.google.firebase.Timestamp


class GamePresenter : ConstraintLayout {


    constructor(context: Context) : super(context) {
        init(null, 0)
    }

    constructor(context: Context, attrs: AttributeSet) : super(context, attrs) {
        init(attrs, 0)
    }

    constructor(context: Context, attrs: AttributeSet, defStyle: Int) : super(
        context,
        attrs,
        defStyle
    ) {
        init(attrs, defStyle)
    }

    private fun init(attrs: AttributeSet?, defStyle: Int) {
        // Load attributes
        val a = context.obtainStyledAttributes(
            attrs, R.styleable.GamePresenter, defStyle, 0
        )

        val inflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        inflater.inflate(R.layout.game_presenter_layout, this)

    }

    fun setGameResult(gameResults: ProfileHolder.GameResults){
        val textView = findViewById<TextView>(R.id.allInfoTextView)
        var text: String = ""

        val userName : String = Singletons.credentialsManager.userInfo.username
        val index = gameResults.players.indexOf(userName)
        val score : String = if(index >= 0) "${gameResults.points[index]}" else "N/A"
        val isVictory = gameResults.winners.contains(userName)
        val result: String = if(isVictory) "Victoire" else "Défaite"


        text += "Difficulté : ${gameResults.difficultyToString()}\n"
        text += "Mode de jeu : ${gameResults.gameModeToString()}\n"
        text += "Score final : ${score}\n"
        text += "Résultat : ${result}\n"
        text += "Hôte : ${gameResults.host}\n"
        text += "Joueurs : ${getPlayerList(gameResults.players)}\n"
        text += "Début : ${gameResults.timeStart.toDate().toString()}\n"
        text += "Fin : ${gameResults.timeEnd.toDate().toString()}\n"

        textView.text = text
    }

    fun getPlayerList(players: List<String>) : String {
        var s: String = ""
        players.forEach { username ->
            s += username + ", " //"\n"
        }
        if(s.isNotEmpty()) {
            s = s.dropLast(2)
        }

        return s
    }

    fun setGameNumber(game: Int){
        findViewById<TextView>(R.id.gameTitle).text = "Partie ${game}"
    }

}