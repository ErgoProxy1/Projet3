package com.example.FaisMoiUnDessin.GameSelection

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.Observer
import com.example.FaisMoiUnDessin.Chat.MessageManager
import com.example.FaisMoiUnDessin.Enums.NavigationWindow
import com.example.FaisMoiUnDessin.GameLobby.GameLobbyActivity
import com.example.FaisMoiUnDessin.GameSettings.GameSettingsFragment
import com.example.FaisMoiUnDessin.LittleHelpers.SubscriptionManager
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import io.reactivex.rxjava3.kotlin.subscribeBy

class GameSelectionActivity(private val subsManager: SubscriptionManager = SubscriptionManager()) : FragmentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        Singletons.isPartOfGame=false
        Singletons.isInGame=false
        Singletons.currentWindow = NavigationWindow.GAME_SELECTION
        Singletons.friendsRepository.fillFriendsList()
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game_selection)
    }

    override fun onResume() {
        super.onResume()
        Singletons.isPartOfGame=false
        Singletons.isInGame=false
        Singletons.messageManager = MessageManager(false)
        Singletons.currentWindow = NavigationWindow.GAME_SELECTION
    }

    override fun onStart() {
        super.onStart()
        Log.d("GameSelectionActivity", "<**>L onStart()")
        this.setupEvents()
    }

    override fun onStop() {
        super.onStop()
        Log.d("GameSelectionActivity", "<**>L onStop()")
        this.unsubscribeFromEvents()
    }

    private fun unsubscribeFromEvents(){
        this.subsManager.unsubscribeFromAllSubscriptions()
        Singletons.gamesSwitchingManager.disableListeners()
    }

    fun setupEvents() {
        Singletons.gamesSwitchingManager.setUpServerEvents()
        Singletons.gamesListManager.setupServerListener()
        val gameListFragment: GameSettingsFragment = supportFragmentManager.findFragmentById(R.id.game_settings) as GameSettingsFragment
        gameListFragment.gameSettingsEmitter.observe(this, Observer {newGameSearchSettings ->
            Log.d("GameSelectionActivity",newGameSearchSettings.toString())
            Log.d("GameSelectionActivity","gameSearchSettings.next()")
            Singletons.userSettings.gameSearchSearchSettings.onNext(newGameSearchSettings) })
        Log.d("GameSelectionActivity","<**> Singletons.gamesSwitchingManager.joiningStatusEmitter.subscribeBy(...")
        val subscription = Singletons.gamesSwitchingManager.joiningStatusEmitter.subscribeBy(
                 onNext={ it->
                    Log.d("GameSelectionActivity","=> gamesSwitchingManager.joiningStatusEmitter.next($it) {Starts GameLobbyActivity if $it==true}")

                    if(it) {
                        Intent(this, GameLobbyActivity::class.java).also {startActivity(it)}
                        Log.d("GameSelectionActivity","<**> Starting GameLobbyActivity")
                    }
                else {
                    //TODO display message about not being accepted into the lobby
                }},
                onError = {})
        Log.d("GameSelectionActivity","<**> }{ subscription is $subscription")
        subsManager.recordSubscription(subscription)
    }

    fun leave(view: View) {
        this.finish()
    }
}