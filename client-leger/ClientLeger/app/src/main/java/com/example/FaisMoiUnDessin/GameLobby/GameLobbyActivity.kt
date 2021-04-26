    package com.example.FaisMoiUnDessin.GameLobby

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import androidx.annotation.RequiresApi
import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.MutableLiveData
import com.beust.klaxon.Klaxon
import com.example.FaisMoiUnDessin.Chat.MessageManager
import com.example.FaisMoiUnDessin.Data.DetailedGameInfo
import com.example.FaisMoiUnDessin.Data.LeaveGameInfo
import com.example.FaisMoiUnDessin.Data.Team
import com.example.FaisMoiUnDessin.Enums.GameMode
import com.example.FaisMoiUnDessin.Enums.NavigationWindow
import com.example.FaisMoiUnDessin.LittleHelpers.SubscriptionManager
import com.example.FaisMoiUnDessin.MainActivity
import com.example.FaisMoiUnDessin.MainMenu.MainMenuActivity
import com.example.FaisMoiUnDessin.PlayerActions.VoteKickViewManager
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import io.socket.emitter.Emitter

class GameLobbyActivity(val subsManager: SubscriptionManager = SubscriptionManager()) : FragmentActivity() {
    private var teams:List<MutableLiveData<Team>> = listOf(MutableLiveData<Team>(Team()),MutableLiveData(Team()))
    private val teamPresenters: MutableList<TeamPresenterView> = mutableListOf()
    private lateinit var voteKickViewManager: VoteKickViewManager
    @RequiresApi(Build.VERSION_CODES.M)
    override fun onCreate(savedInstanceState: Bundle?) {
        Singletons.isPartOfGame = true
        Singletons.isInLobby = true
        Singletons.currentWindow = NavigationWindow.GAME_LOBBY
        Singletons.messageManager = MessageManager(inGame = true)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game_lobby)
        Log.d("GameLobbyActivity","<**> Activity Created")
        this.setupView()
    }


    override fun onPause() {
        super.onPause()
        Singletons.isInLobby = false
    }
    override fun onStop() {
        super.onStop()
        Log.d("GameLobbyActivity","<**>L onStop()")
        subsManager.unsubscribeFromAllSubscriptions()
    }

    @RequiresApi(Build.VERSION_CODES.M)
    override fun onStart() {
        super.onStart()
        Log.d("GameLobbyActivity","<**>L onStart()")
        this.setUpServerEvents()
        this.setUpClickListeners()
        Singletons.socket.emit("askTheGameData",Singletons.gameManager.detailedGameInfo.value.gameId.toString())
    }

    @RequiresApi(Build.VERSION_CODES.M)
    private fun setupView() {
        this.appendTeamPresentersToView()
        this.refreshBeginBtnVisibility()
        Log.d("GameLobbyActivity","++ setupView()")
        this.voteKickViewManager = VoteKickViewManager(this,findViewById(R.id.lobby_vote_kick_view))
    }

    private fun refreshBeginBtnVisibility() {
        val btnVisibility = if(Singletons.optionManager.canBeginGame()) View.VISIBLE else View.GONE
        runOnUiThread{
            findViewById<Button>(R.id.lobby_btn_debuter).visibility = btnVisibility
        }
    }

    private fun setUpClickListeners() {
        findViewById<Button>(R.id.lobby_btn_debuter).setOnClickListener {_->
            val jsonString = "{\"gameId\": \"${Singletons.gameManager.detailedGameInfo.value.gameId}\", \"teams\": \"[][]\"}"
            Log.d("GameLobbyActivity","=><> Socket.emit(\"loadGame\") on join click with $jsonString")
            Singletons.socket.emit("loadGame",jsonString)
        }
        findViewById<Button>(R.id.lobby_btn_leave).setOnClickListener{
            val leaveInfo = LeaveGameInfo(Singletons.gameManager.detailedGameInfo.value.gameId.toString(),Singletons.credentialsManager.userInfo.username)
            Singletons.socket.emit("leaveTheLobby",Klaxon().toJsonString(leaveInfo))
            finish()
        }
    }

    @RequiresApi(Build.VERSION_CODES.M)
    private fun setUpServerEvents() {
        val newGameDataListener = Emitter.Listener {
            Log.d("GameLobbyActivity","=><> Socket.on(\"receiveNewLobbyTeams\") Recieved new lobby teams")
            val newDetailedGameInfo = Klaxon().parse<DetailedGameInfo>(it[0].toString())
            Singletons.gameManager.detailedGameInfo.onNext(newDetailedGameInfo)
            this.refreshView()
        }
        val gameStartListener = Emitter.Listener {
            Log.d("GameLobbyActivity","=><> Socket.on(\"gameStart\") Starting game!")
            this.subsManager.unsubscribeFromAllSubscriptions()
            Intent(this, MainActivity::class.java).also {startActivity(it)}
        }
        val lobbyDisbandedListener = Emitter.Listener {//Doesn't work ????????? WHY ?
            Log.d("GameLobbyActivity","=><> Socket.on(\"removeAllPlayers\") Lobby disbanded!")
            this.subsManager.unsubscribeFromAllSubscriptions()
            runOnUiThread {
                Intent(this, MainMenuActivity::class.java).also {
                    it.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    startActivity(it)
                }
                this.finish()
            }
        }

        Singletons.socket.on("gameStart",gameStartListener)
        Singletons.socket.on("getTheGameData",newGameDataListener)
        Singletons.socket.on("removeAllPlayers",lobbyDisbandedListener)
        //Singletons.socket.on("get-vote-kick",kickPlayerListener)
        Log.d("GameLobbyActivity","listening to get-vote-kick")

        this.subsManager.recordSocketSubscription("getTheGameData",newGameDataListener)
        this.subsManager.recordSocketSubscription("gameStart",gameStartListener)
        this.subsManager.recordSocketSubscription("removeAllPlayers",lobbyDisbandedListener)
        //this.subsManager.recordSocketSubscription("get-vote-kick",kickPlayerListener)
    }

    @RequiresApi(Build.VERSION_CODES.M)
    private fun refreshView() {
        runOnUiThread {
            this.refreshTeamsList()
            this.refreshAddPlayerButtonVisibility()
            this.refreshBeginBtnVisibility()
        }
    }



    private fun refreshTeamsList() {
        when(Singletons.gameManager.detailedGameInfo.value.gameMode) {
            GameMode.CLASSIC.value -> {
                val newTeams = Singletons.gameManager.detailedGameInfo.value.teams
                this.teams[0].postValue(newTeams[0])
                this.teams[1].postValue(newTeams[1])
            }
            GameMode.FREE_FOR_ALL.value -> {
                val newUser = Singletons.gameManager.detailedGameInfo.value.users
                val newTeam = Team(newUser)
                this.teams[0].postValue(newTeam)
            }
        }

    }

    @RequiresApi(Build.VERSION_CODES.M)
    private fun refreshAddPlayerButtonVisibility() {
        if(Singletons.gameManager.detailedGameInfo.value.gameMode == GameMode.CLASSIC.value){
            runOnUiThread {
				teamPresenters.forEachIndexed { index, teamPresenterView -> teamPresenterView.setAddPlayerButtonVisibility(Singletons.optionManager.canAddBotToTeam(index)) }
            }

        }
    }

    @RequiresApi(Build.VERSION_CODES.M)
    private fun appendTeamPresentersToView() {
        val currentGameInfo = Singletons.gameManager.detailedGameInfo.value
        //this.teams = listOf(MutableLiveData(currentGameInfo.teams[0]),MutableLiveData(currentGameInfo.teams[1]))

        when(currentGameInfo.gameMode) {
            GameMode.FREE_FOR_ALL.ordinal -> {
                val teamPresenter = TeamPresenterView(this, teams[0],"Liste des joueurs",false)
                teamPresenters.add(teamPresenter)
            }
            GameMode.CLASSIC.ordinal -> {
                val canAddPlayers = Singletons.gameManager.clientIsHost()
                val team1View = TeamPresenterView(this, teams[0],"Équipe 1",canAddPlayers, resources.getColor(R.color.red, null))
                val team2View = TeamPresenterView(this, teams[1],"Équipe 2",canAddPlayers, resources.getColor(R.color.blue, null))
                teamPresenters.add(team1View)
                teamPresenters.add(team2View)
            }
        }
        val teamListDisplayer = findViewById<LinearLayout>(R.id.lobby_team_layout)
        for(teamPresenter in teamPresenters) {
            teamListDisplayer.addView(teamPresenter)
            val sub = teamPresenter.virtualPlayerRequested.subscribe { botName ->
                Log.d("GameLobbyActivity","virtualPlayerRequested()!!!")
                Singletons.gameManager.addBot(teamPresenter.team.value!!, botName)
            }
            this.subsManager.recordSubscription(sub)
        }
        this.refreshAddPlayerButtonVisibility()
    }

    override fun onBackPressed() {

        val json: String = "{ \"gameId\": \"${Singletons.gameId}\", \"user\": \"${Singletons.username}\" }"
        Singletons.socket.emit("leaveTheLobby", json)

        Intent(this, MainMenuActivity::class.java).also {
            it.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(it)
        }
        finish()
        super.onBackPressed()
    }
}