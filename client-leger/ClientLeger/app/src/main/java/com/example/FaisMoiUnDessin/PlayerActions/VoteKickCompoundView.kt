package com.example.FaisMoiUnDessin.PlayerActions

import android.content.Context
import android.util.AttributeSet
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import com.example.FaisMoiUnDessin.Enums.VoteKickActions
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import io.reactivex.rxjava3.core.SingleEmitter

class VoteKickCompoundView:  ConstraintLayout  {
    val view: View

    var playerToKick:String = ""

    init {
        Log.d("VoteKickCompoundView","init")
        val inflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        this.view = inflater.inflate(R.layout.vote_kick_compound_view,this,true)
        this.updateViewForPlayer(0,0,"joe")
        this.setupClickEvents()
        Log.d("VoteKickCompoundView","origina color filter is ${findViewById<ImageView>(R.id.confirm_kick_vote_btn).colorFilter}")
    }

    constructor(ctx: Context) : super(ctx) {
        Log.d("VoteKickCompoundView","constructor(ctx: Context)")
    }

    constructor(ctx: Context, attributeSet: AttributeSet) : super(ctx, attributeSet) {
        Log.d("VoteKickCompoundView","constructor(ctx: Context, attributeSet: AttributeSet)")
    }

    private fun setupClickEvents() {
        findViewById<ImageView>(R.id.confirm_kick_vote_btn).setOnClickListener{
            Singletons.gameManager.voteKickPlayer(playerToKick,VoteKickActions.KICK.value)
            this.disableVote()
        }
        findViewById<ImageView>(R.id.discard_kick_vote_btn).setOnClickListener{
            Singletons.gameManager.voteKickPlayer(playerToKick,VoteKickActions.NO_KICK.value)
            this.disableVote()
        }
    }

    private fun disableVote() {
        val grey = 0x9F9F9F
        findViewById<ImageView>(R.id.confirm_kick_vote_btn).apply {
            setOnClickListener(null)
            setColorFilter(grey)
        }
        findViewById<ImageView>(R.id.discard_kick_vote_btn).apply {
            setOnClickListener(null)
            setColorFilter(grey)
        }
    }

    private fun enableVote() {
        this.setupClickEvents()
        findViewById<ImageView>(R.id.confirm_kick_vote_btn).apply {
            colorFilter = null
        }
        findViewById<ImageView>(R.id.discard_kick_vote_btn).apply {
            colorFilter = null
        }
    }

    fun updateViewForPlayer(confirm: Int, reject: Int, playerName: String) {
        this.playerToKick = playerName;
        val clientIsBeingKicked = playerName == Singletons.username
        if(Singletons.gameManager.hasVotedToKick || clientIsBeingKicked) disableVote() else enableVote()
        findViewById<TextView>(R.id.vote_kick_header_text ).text = "Expulsion de $playerName"
        findViewById<TextView>(R.id.kick_widget_confirmation_text).text = "$confirm Votes pour"
        findViewById<TextView>(R.id.kick_widget_discard_text).text = "$reject Votes contre"
    }

}