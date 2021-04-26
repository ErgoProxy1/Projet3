package com.example.FaisMoiUnDessin

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.annotation.RequiresApi
import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.MutableLiveData
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.beust.klaxon.Klaxon
import com.example.FaisMoiUnDessin.Chat.MessageManager
import com.example.FaisMoiUnDessin.Data.DetailedGameInfo
import com.example.FaisMoiUnDessin.Data.Team
import com.example.FaisMoiUnDessin.Drawing.CanvasFragment
import com.example.FaisMoiUnDessin.GameLobby.TeamMembersAdapter
import com.example.FaisMoiUnDessin.LittleHelpers.SubscriptionManager
import com.example.FaisMoiUnDessin.MainMenu.MainMenuActivity
import com.example.FaisMoiUnDessin.PlayerActions.VoteKickViewManager
import com.example.FaisMoiUnDessin.Profile.UserProfileActivity
import io.socket.emitter.Emitter
import org.json.JSONObject

class MainActivity : FragmentActivity() {
    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    private lateinit var voteKickViewManager: VoteKickViewManager
    private lateinit var fragmentCanvas: CanvasFragment
    private var subscriptionManager: SubscriptionManager = SubscriptionManager()
    private lateinit var givenAdapter: TeamMembersAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        Singletons.isInGame = true
        Singletons.isPartOfGame = true
        super.onCreate(savedInstanceState)
        Singletons.messageManager = MessageManager(inGame = true)
        setContentView(R.layout.activity_main)
        setupTeamMembersList()
        setupSocket()
    }

    override fun onResume() {
        super.onResume()
        this.voteKickViewManager = VoteKickViewManager(this, findViewById(R.id.game_vote_kick_view))
        //Singletons.messageManager = MessageManager(inGame = true)
    }

    private fun setupSocket() {
        val newGameDataListener = Emitter.Listener {
            Log.d("GameLobbyActivity","=><> Socket.on(\"receiveNewLobbyTeams\") Recieved new lobby teams")
            val newDetailedGameInfo = Klaxon().parse<DetailedGameInfo>(it[0].toString())
            Singletons.gameManager.detailedGameInfo.onNext(newDetailedGameInfo)
            runOnUiThread {
                givenAdapter.notifyDataSetChanged()
            }
        }
        subscriptionManager.recordSocketSubscription("getTheGameData",newGameDataListener)
        Singletons.socket.on("getTheGameData",newGameDataListener)
        Singletons.socket.emit("ask-active-game-data","${Singletons.gameId}")
    }

    private fun setupTeamMembersList() {
        givenAdapter = TeamMembersAdapter(MutableLiveData(Team()), true)
        val ctx = this
        findViewById<RecyclerView>(R.id.game_team_members_list).apply {
            layoutManager = LinearLayoutManager(ctx)
            adapter = givenAdapter
        }
        Log.d("MainActivity","setupTeamMembersList\ngivenAdapter == $givenAdapter")
        val sub = Singletons.gameManager.detailedGameInfo.subscribe {
            Log.d("MainActivity","gameManager.detailedGameInfo.subscribe it.users==${it.users}")
            runOnUiThread {
                givenAdapter.setHost(it.host)
                it.users.forEach {username: String -> givenAdapter.setPointsIfAbsent(username, 0) }
                givenAdapter.users.postValue(Team(it.users))
                Log.d("MainActivity","givenAdapter.users==${it.users}")
                givenAdapter.notifyDataSetChanged()
            }
        } //TODO reimplement
        subscriptionManager.recordSubscription(sub)

        givenAdapter.notifyDataSetChanged()

        Singletons.socket.on("receivePoints") {
            val json = it[0] as String
            val obj = JSONObject(json)
            val points = obj.getInt("points")
            val userArray = obj.getJSONArray("users")
            for (i in 0 until userArray.length()) {
                givenAdapter.setPoints(userArray.getString(i), points)
            }

            runOnUiThread{
                givenAdapter.notifyDataSetChanged()
            }
        }

        Singletons.socket.on("receive-reaction") {
            val json = it[0] as String
            val obj = JSONObject(json)
            val user = obj.getString("username")
            val reaction = obj.getString("reaction")
            givenAdapter.setReaction(user,reaction)
            runOnUiThread{
                givenAdapter.notifyDataSetChanged()
            }
        }

        Log.d("MainActivity","Singletons.gameManager.detailedGameInfo.subscribe()")
    }

    override fun onPostCreate(savedInstanceState: Bundle?) {
        super.onPostCreate(savedInstanceState)
        fragmentCanvas = supportFragmentManager.findFragmentById(R.id.fragmentCanvas) as CanvasFragment
        Singletons.isInGame = true
    }

    fun viewProfil(view: View) {
        val intent = Intent(this, UserProfileActivity::class.java).apply {}
        startActivity(intent)
    }

    private fun backToMain(){
        Singletons.isInGame = false
        Singletons.socket.off("receivePoints")
        val fragmentCanvas = supportFragmentManager.findFragmentById(R.id.fragmentCanvas) as CanvasFragment
        fragmentCanvas.endGame()
        Intent(this, MainMenuActivity::class.java).also {
            it.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(it)
        }
        finish()
    }

    fun leave(view: View) {
        Singletons.isInGame = false
        backToMain()
    }

    override fun onBackPressed() {
        super.onBackPressed()
        subscriptionManager.unsubscribeFromAllSubscriptions()
        backToMain()
    }

    override fun onDestroy() {
        Singletons.isInGame = false
        subscriptionManager.unsubscribeFromAllSubscriptions()
        super.onDestroy()
    }

}