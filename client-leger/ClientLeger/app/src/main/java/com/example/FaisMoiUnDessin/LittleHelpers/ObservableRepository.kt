package com.example.FaisMoiUnDessin.LittleHelpers

import io.reactivex.rxjava3.subjects.PublishSubject

class ObservableRepository() {
    companion object {
        val messagesHaveChanged = PublishSubject.create<Boolean>()
        //val messageManagerChannelsHaveChanged = PublishSubject.create<Boolean>()
    }
}