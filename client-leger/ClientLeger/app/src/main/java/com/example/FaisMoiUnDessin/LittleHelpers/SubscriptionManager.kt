package com.example.FaisMoiUnDessin.LittleHelpers

import android.util.Log
import com.example.FaisMoiUnDessin.Singletons
import io.reactivex.rxjava3.disposables.Disposable
import io.socket.emitter.Emitter
import java.util.*

class SubscriptionManager() {
    private var subscriptions = Vector<Disposable>()
    private var socketSubs = Vector<(Pair<String,Emitter.Listener>)>()
    fun recordSubscription(disposable: Disposable) {
        this.subscriptions.add(disposable)
    }
    fun recordSocketSubscription(eventName:String,listener:Emitter.Listener) {
        this.socketSubs.add(Pair(eventName,listener))
    }

    fun unsubscribeFromAllSubscriptions() {
        for(sub in this.subscriptions) {
            Log.d("SubscriptionManager","<**> }{ subscription is $sub")
            sub.dispose()
            Log.d("SubscriptionManager","<**> }{ subscription is now $sub")
        }
        this.subscriptions.clear()
        for(subPair in this.socketSubs) {
            Singletons.socket.off(subPair.first,subPair.second)
        }
        this.socketSubs.clear()
    }
}