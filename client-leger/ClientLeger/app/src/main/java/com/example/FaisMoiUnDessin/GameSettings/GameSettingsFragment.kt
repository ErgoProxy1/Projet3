package com.example.FaisMoiUnDessin.GameSettings

import android.os.Bundle
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.widget.doAfterTextChanged
import androidx.lifecycle.MutableLiveData
import com.example.FaisMoiUnDessin.Data.GameSearchSettings
import com.example.FaisMoiUnDessin.Enums.Difficulty
import com.example.FaisMoiUnDessin.Enums.GameMode
import com.example.FaisMoiUnDessin.Enums.NavigationWindow
import com.example.FaisMoiUnDessin.Enums.Privacy
import com.example.FaisMoiUnDessin.GameSelection.GameSettingsViewModel
import com.example.FaisMoiUnDessin.LittleHelpers.BaseFragment
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Repository.GameSettingsRepository
import com.example.FaisMoiUnDessin.Singletons
import com.example.FaisMoiUnDessin.databinding.FragmentGameSettingsBinding
import com.google.android.material.tabs.TabLayout

class GameSettingsFragment : BaseFragment<GameSettingsViewModel,FragmentGameSettingsBinding, GameSettingsRepository>() {
    //private var _gameSettings = GameSettings()
    val gameSettingsEmitter = MutableLiveData<GameSearchSettings>(if(Singletons.currentWindow==NavigationWindow.GAME_CREATION)GameSearchSettings(GameMode.CLASSIC.value,Difficulty.EASY.ordinal,Privacy.FALSE.value) else GameSearchSettings(-1,-1))
    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        this.setupBindings()
    }

    override fun getViewModel() = GameSettingsViewModel::class.java

    override fun getFragmentBinding(
        inflater: LayoutInflater,
        container: ViewGroup?
    ) = FragmentGameSettingsBinding.inflate(inflater, container, false)

    override fun getFragmentRepository() = GameSettingsRepository(Singletons.userSettings)


    fun setupBindings() {

        binding.apply {
            val gameMode0 = resources.getString(R.string.game_mode_0)
            val gameMode1 = resources.getString(R.string.game_mode_1)
            val gameMode2 = resources.getString(R.string.game_mode_2)

            if(Singletons.currentWindow==NavigationWindow.GAME_SELECTION)
                gameModeTab.setTabsList(arrayOf(gameMode0,gameMode1,gameMode2))
            else
                gameModeTab.setTabsList(arrayOf(gameMode1,gameMode2))

            gameModeTab.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
                override fun onTabSelected(tab: TabLayout.Tab?) {
                    updateGameSettings()
                }
                override fun onTabReselected(tab: TabLayout.Tab?) {}
                override fun onTabUnselected(tab: TabLayout.Tab?) {}
            })

            val gameDiff0 = resources.getString(R.string.game_difficulty_0)
            val gameDiff1 = resources.getString(R.string.game_difficulty_1)
            val gameDiff2 = resources.getString(R.string.game_difficulty_2)
            val gameDiff3 = resources.getString(R.string.game_difficulty_3)

            if(Singletons.currentWindow==NavigationWindow.GAME_SELECTION)
                difficultyTab.setTabsList(arrayOf(gameDiff0,gameDiff1,gameDiff2,gameDiff3))
            else
                difficultyTab.setTabsList(arrayOf(gameDiff1,gameDiff2,gameDiff3))

            difficultyTab.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
                override fun onTabSelected(tab: TabLayout.Tab?) {
                    updateGameSettings()
                }
                override fun onTabReselected(tab: TabLayout.Tab?) {}
                override fun onTabUnselected(tab: TabLayout.Tab?) {}
            })

            privateGameSwitch.setOnCheckedChangeListener{ buttonView, isChecked ->
                updateGameSettings()
            }
            friendsOnlySwitch.setOnCheckedChangeListener{ buttonView, isChecked ->
                updateGameSettings()
            }
            openOnlySwitch.setOnCheckedChangeListener { buttonView, isChecked ->
                updateGameSettings()
            }

            gameSearchHostNameInput.doAfterTextChanged {
                Log.d("GameSettingsFragment","txtChanged")
                updateGameSettings()
            }

            val visibility = if(Singletons.currentWindow==NavigationWindow.GAME_SELECTION) View.VISIBLE else View.GONE
            friendsOnlyGameLayout.visibility = visibility
            openSpacesOnlyGameLayout.visibility = visibility
            hostNameSearchLayout.visibility = visibility
        }
    }

    private fun updateGameSettings() {
        this.gameSettingsEmitter.value = this.getCorrespondingSettings()
        //this.viewModel.
        Log.d("GameSettings",this.gameSettingsEmitter.value.toString())
    }

    fun getCorrespondingSettings(): GameSearchSettings {
        val creatingGame = Singletons.currentWindow == NavigationWindow.GAME_CREATION
        val offset = if(creatingGame) 0 else -1
        val difficulty = binding.difficultyTab.selectedTabPosition + offset
        val mode = binding.gameModeTab.selectedTabPosition + offset
        val privateGame: Boolean =  binding.privateGameSwitch.isChecked
        val friendsOnlyGame: Boolean = binding.friendsOnlySwitch.isChecked
        val openOnly : Boolean = binding.openOnlySwitch.isChecked
        val hostName = binding.gameSearchHostNameInput.text.toString()
        val gameSettings = GameSearchSettings(mode,difficulty, if(privateGame) Privacy.TRUE.value else Privacy.ANY.value,friendsOnlyGame, openOnly, hostName)
        Log.d("GameSettingsFragment","outputGameSettings==$gameSettings")
        return GameSearchSettings(mode,difficulty, if(privateGame) Privacy.TRUE.value else Privacy.ANY.value,friendsOnlyGame, openOnly, hostName)
    }
}