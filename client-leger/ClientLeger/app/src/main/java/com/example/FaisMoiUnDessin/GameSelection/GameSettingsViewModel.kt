package com.example.FaisMoiUnDessin.GameSelection

import androidx.lifecycle.ViewModel
import com.example.FaisMoiUnDessin.Data.GameSearchSettings
import com.example.FaisMoiUnDessin.Repository.GameSettingsRepository

class GameSettingsViewModel(
    private val repository: GameSettingsRepository
): ViewModel() {
    fun updateGame(searchSettings: GameSearchSettings) {
    }
}