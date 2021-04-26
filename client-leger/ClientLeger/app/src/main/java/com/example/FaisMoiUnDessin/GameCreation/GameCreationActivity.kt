package com.example.FaisMoiUnDessin.GameCreation

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.Observer
import com.beust.klaxon.Klaxon
import com.example.FaisMoiUnDessin.Data.DetailedGameInfo
import com.example.FaisMoiUnDessin.Data.NewGameInfo
import com.example.FaisMoiUnDessin.Data.Team
import com.example.FaisMoiUnDessin.Enums.NavigationWindow
import com.example.FaisMoiUnDessin.Enums.Privacy
import com.example.FaisMoiUnDessin.GameLobby.GameLobbyActivity
import com.example.FaisMoiUnDessin.GameSettings.GameSettingsFragment
import com.example.FaisMoiUnDessin.LittleHelpers.SubscriptionManager
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import io.socket.emitter.Emitter

class GameCreationActivity(private val subsManager: SubscriptionManager = SubscriptionManager()) : FragmentActivity() {
    @Volatile var antiSpam = true
    override fun onCreate(savedInstanceState: Bundle?) {
        Singletons.currentWindow = NavigationWindow.GAME_CREATION
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game_creation)
        this.setupView()
        this.setupEvents()
    }

    override fun onResume() {
        super.onResume()
        Singletons.currentWindow = NavigationWindow.GAME_CREATION
    }

    override fun onRestart() {
        super.onRestart()
        setupServerEvents()
    }

    override fun onPause() {
        super.onPause()
        this.subsManager.unsubscribeFromAllSubscriptions()
    }



    private fun createGame(){
        var gameSettingsFragment = supportFragmentManager.findFragmentById(R.id.creation_game_settings) as GameSettingsFragment
        val gs = gameSettingsFragment.gameSettingsEmitter.value
        Log.d("GameCreationActivity","Password Input: ${findViewById<EditText>(R.id.game_creation_password_input).text}")
        val password = if(gs!!.privateGame == Privacy.TRUE.value) findViewById<EditText>(R.id.game_creation_password_input).text.toString() else ""
        Log.d("GameCreationActivity","Game password: $password")
        val gameToCreate = NewGameInfo(Singletons.credentialsManager.userInfo.username, gs.gameMode,false,gs.difficulty,password)
        val gameAsJsonString = Klaxon().toJsonString(gameToCreate)
        Singletons.socket.emit("createGame",gameAsJsonString)
    }

    private fun setupEvents() {
        this.setupServerEvents()
        findViewById<Button>(R.id.btn_confirm_game_creation).setOnClickListener {
            if(antiSpam){
                antiSpam = false
                this.createGame()
            }
        }
        val gameSettingsFragment = supportFragmentManager.findFragmentById(R.id.creation_game_settings) as GameSettingsFragment
        gameSettingsFragment.gameSettingsEmitter.observe(this, Observer {it-> //Toggle password input visibility
            val passwordEnabled = it.privateGame == Privacy.TRUE.value
            Log.d("GameCreationActivity","password enabled is $passwordEnabled")
            findViewById<LinearLayout>(R.id.game_creation_password_input_layout).visibility = if(passwordEnabled) View.VISIBLE else View.INVISIBLE
        })
    }

    private fun setupView(){
        findViewById<LinearLayout>(R.id.game_creation_password_input_layout).visibility = View.INVISIBLE
    }

    private fun setupServerEvents() {
        var listener = Emitter.Listener { it -> // Getting server confirmation
            Log.d("GameCreationActivity","lobbyAcces id is: ${it[0]} \n therefore asking game data")
            val newGameId = it[0] as Int
            val gs = (supportFragmentManager.findFragmentById(R.id.creation_game_settings) as GameSettingsFragment).gameSettingsEmitter.value //Fetching game settings
            val hostUsername = Singletons.credentialsManager.userInfo.username
            val password = if(gs!!.privateGame == Privacy.TRUE.value) findViewById<EditText>(R.id.game_creation_password_input).text.toString() else ""
            val detailedGameInfo = DetailedGameInfo(listOf(false,false), newGameId,gs!!.gameMode,false , false, gs.difficulty,hostUsername, "",listOf(hostUsername),password)
                    .apply { teams = listOf(Team(listOf(hostUsername)), Team()) }
            Singletons.gameManager.detailedGameInfo.onNext(detailedGameInfo)
            Intent(this, GameLobbyActivity::class.java).also {startActivity(it)}
            finish()
        }
        Singletons.socket.on("hostJoinLobby",listener)
        this.subsManager.recordSocketSubscription("hostJoinLobby",listener)
    }

}