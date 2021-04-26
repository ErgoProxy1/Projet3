package com.example.FaisMoiUnDessin.Model

import com.example.FaisMoiUnDessin.Data.GameSearchSettings
import com.example.FaisMoiUnDessin.Data.UserInfo
import io.reactivex.rxjava3.subjects.BehaviorSubject

class UserSettings {
    var userInfo = UserInfo()
    var gameSearchSearchSettings: BehaviorSubject<GameSearchSettings> = BehaviorSubject.create<GameSearchSettings>().apply { onNext(GameSearchSettings()) }
}