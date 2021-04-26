package com.example.FaisMoiUnDessin.LittleHelpers

import com.example.FaisMoiUnDessin.Singletons
import com.google.android.gms.tasks.Task
import com.google.firebase.firestore.QuerySnapshot

class FirebaseMediator {
    fun queryUser(username: String, password: String): Task<QuerySnapshot> {
        return Singletons.firebaseDB.collection("users").whereEqualTo("username", username).whereEqualTo("password",password).get()// TODO restore password verification
    }
}