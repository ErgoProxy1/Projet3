package com.example.FaisMoiUnDessin.GameSelection

import android.util.Log
import com.example.FaisMoiUnDessin.Singletons
import com.google.firebase.firestore.FirebaseFirestore
class FriendsRepository() {
    var friends: MutableList<String> = mutableListOf();
    fun fillFriendsList() {
        Log.d("FriendsRepository","fillFriendsList()")
        var db = FirebaseFirestore.getInstance()
        var docRefFriends = db.collection("friends").whereArrayContains("users", Singletons.username)
        docRefFriends.get().addOnSuccessListener {snap->
            if(snap.documents.size>0){
                this.friends.clear()
                snap.documents.forEach { doc->
                    var friendName = (doc["users"] as List<String>).filter { name -> name != Singletons.username }[0]
                    this.friends.add(friendName)
                }
                Log.d("FriendsRepository","friends are $friends")
            }
        }
    }

}