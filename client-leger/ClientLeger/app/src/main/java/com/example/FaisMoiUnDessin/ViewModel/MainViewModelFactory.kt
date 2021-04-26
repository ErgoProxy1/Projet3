package com.example.FaisMoiUnDessin.ViewModel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.FaisMoiUnDessin.GameSelection.GameSettingsViewModel
import com.example.FaisMoiUnDessin.Repository.BaseRepository
import com.example.FaisMoiUnDessin.Repository.ChatRepository
import com.example.FaisMoiUnDessin.Repository.GameSettingsRepository

class ViewModelFactory(
        private val repository: BaseRepository
) : ViewModelProvider.NewInstanceFactory() {
    override fun <T : ViewModel?> create(modelClass: Class<T>): T {
        return when{
            modelClass.isAssignableFrom(ChatViewModel::class.java) -> ChatViewModel(repository as ChatRepository) as T
            modelClass.isAssignableFrom(GameSettingsViewModel::class.java) -> GameSettingsViewModel(repository as GameSettingsRepository) as T
            else -> throw IllegalAccessException("ViewModelClass Not Found")
        }
    }
}