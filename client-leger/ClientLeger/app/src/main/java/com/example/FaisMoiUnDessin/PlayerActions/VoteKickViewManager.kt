package com.example.FaisMoiUnDessin.PlayerActions

import android.app.Activity
import android.content.Context
import android.util.Log
import android.view.View
import com.beust.klaxon.Klaxon
import com.example.FaisMoiUnDessin.Data.VoteKickServerInfo
import com.example.FaisMoiUnDessin.LittleHelpers.SubscriptionManager
import com.example.FaisMoiUnDessin.Singletons
import io.socket.emitter.Emitter

class VoteKickViewManager(val ctx: Activity, val voteKickView: VoteKickCompoundView) {
    val subsManager = SubscriptionManager()

    init {
        ctx.runOnUiThread { voteKickView.visibility = View.GONE }
        this.setupServerEvents()
    }


    private fun setupServerEvents() {
        Log.d("VoteKickManager","setupServerEvents()")
        val getVoteKickListener = Emitter.Listener {
            val kickInfo = Klaxon().parse<VoteKickServerInfo>(it[0].toString())
            Log.d("VoteKickManager","getVoteKickListener\nKickInfo is: $kickInfo")
            ctx.runOnUiThread {
                voteKickView.updateViewForPlayer(kickInfo?.votes?:1,kickInfo?.rejections?:0,kickInfo!!.user)
                voteKickView.visibility = View.VISIBLE
            }
        }
        val endVoteKickListener = Emitter.Listener {
            Log.d("VoteKickManager","endVoteKickListener")
            ctx.runOnUiThread { voteKickView.visibility = View.GONE }
            Singletons.gameManager.hasVotedToKick = false
            Singletons.gameManager.voteKickIsActive = false
        }

        Singletons.socket.on("get-vote-kick", getVoteKickListener)
        Singletons.socket.on("end-vote-kick", endVoteKickListener)

        this.subsManager.recordSocketSubscription("get-vote-kick",getVoteKickListener)
        this.subsManager.recordSocketSubscription("end-vote-kick",endVoteKickListener)
    }
}