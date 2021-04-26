package com.example.FaisMoiUnDessin.SocialMenu

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.widget.*
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.fragment.app.FragmentActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.beust.klaxon.Klaxon
import com.bumptech.glide.Glide
import com.example.FaisMoiUnDessin.Constants
import com.example.FaisMoiUnDessin.Enums.BotName
import com.example.FaisMoiUnDessin.Enums.NavigationWindow
import com.example.FaisMoiUnDessin.Profile.UserProfileActivity
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import com.google.firebase.firestore.FirebaseFirestore
import java.net.URL


class SocialMenuActivity : FragmentActivity() {
    var friends: MutableList<Friend> = mutableListOf();
    var requests: MutableList<FriendRequest> = mutableListOf();

    private lateinit var friendsAdapter: FriendsListAdapter;
    private lateinit var requestAdapter: RequestListAdapter;
    override fun onCreate(savedInstanceState: Bundle?) {
        Singletons.currentWindow = NavigationWindow.SOCIAL_MENU
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_social_menu)
        this.setupEvents();
        this.initFriendsList();
        this.initRequestList();
        this.getFriendsList();
        this.getRequests();
    }

    override fun onStop() {
        super.onStop()
        Singletons.socket.off("receive-status");
        Singletons.socket.off("receive-update-friends-list");
        Singletons.socket.off("receive-update-friend-requests");
        Singletons.socket.off("receive-is-do-not-disturb");
    }

    fun setupEvents() {
        findViewById<Button>(R.id.social_profile_nav_button).setOnClickListener {
            val intent = Intent(this, UserProfileActivity::class.java)
            startActivity(intent)
            finish()
        }

        findViewById<Button>(R.id.add_friend_button).setOnClickListener {
            this.showSearchPopup()
        }

        Singletons.socket.on("receive-status"){statuses ->
            var parsedStatus = Klaxon().parseArray<FriendStatus>(statuses[0].toString())
            for(status in parsedStatus.orEmpty()){
                var curIndex = this.friends.indexOfFirst{
                    it.username == status.username
                }
                if(curIndex != -1){
                    this.friends[curIndex].status = status.status;
                }
            }
            this.friendsAdapter.updateList(this.friends);
            runOnUiThread {
                this.friendsAdapter.notifyDataSetChanged();
            }
            Handler(Looper.getMainLooper()).postDelayed({
                var friendsToUpdate = this.friends.map { f -> f.username }
                Singletons.socket.emit("request-status", Klaxon().toJsonString(friendsToUpdate));
            }, 2000)
        }

        Singletons.socket.on("receive-update-friends-list"){
            this.getFriendsList();
        }

        Singletons.socket.on("receive-update-friend-requests"){
            this.getRequests();
        }

        Singletons.socket.on("receive-is-do-not-disturb"){ isDoNotDisurb ->
            var dndSwitchState = isDoNotDisurb[0] as Boolean
            runOnUiThread{
                findViewById<Switch>(R.id.do_not_disturb_switch).isChecked = dndSwitchState
            }
        }
        var username = Singletons.credentialsManager.userInfo.username
        findViewById<Switch>(R.id.do_not_disturb_switch).setOnClickListener{
            if(findViewById<Switch>(R.id.do_not_disturb_switch).isChecked){
                Singletons.socket.emit("set-do-not-disturb", username)
            } else{
                Singletons.socket.emit("unset-do-not-disturb", username)
            }
        }
        Singletons.socket.emit("is-do-not-disturb", username)

    }


    fun initFriendsList() {
        findViewById<RecyclerView>(R.id.friends_list).apply {
            layoutManager = LinearLayoutManager(this@SocialMenuActivity)
            friendsAdapter = FriendsListAdapter(this@SocialMenuActivity)
            adapter = friendsAdapter
        }
        var friendsToUpdate = this.friends.map { f -> f.username }
        Singletons.socket.emit("request-status", Klaxon().toJsonString(friendsToUpdate));
    }

    fun initRequestList() {
        findViewById<RecyclerView>(R.id.request_list).apply {
            layoutManager = LinearLayoutManager(this@SocialMenuActivity)
            requestAdapter = RequestListAdapter(this@SocialMenuActivity)
            adapter = requestAdapter
        }
    }

    fun getFriendsList() {
        var username = Singletons.credentialsManager.userInfo.username
        this.friends.clear();
        var db = FirebaseFirestore.getInstance()
        var docRefFriends = db.collection("friends").whereArrayContains("users", username)
        docRefFriends.get().addOnSuccessListener { snap ->
            if(snap.documents.size > 0){
                snap.documents.forEach { doc ->
                    var friendName = (doc["users"] as List<String>).filter { name ->
                        name != username
                    }[0]
                    if (friendName != null) {
                        var docRefUser = db.collection("users").whereEqualTo("username", friendName)
                        docRefUser.get().addOnSuccessListener { userSnap ->
                            if (userSnap.documents.size > 0) {
                                var doc = userSnap.documents[0]
                                this.friends.add(Friend(doc["username"] as String, doc["avatar"] as String, -1))
                                this.friends.sortBy { it.username }
                                friendsAdapter.updateList(this.friends)
                                runOnUiThread {
                                    findViewById<TextView>(R.id.no_friends_text).visibility = View.GONE;
                                }
                            }
                            friendsAdapter.notifyDataSetChanged()
                        }
                    }
                }
            } else {
                this.friends.clear();
                friendsAdapter.updateList(this.friends)
                Log.d("SocialMenu", this.friends.toString())
                friendsAdapter.notifyDataSetChanged();
                runOnUiThread {
                    findViewById<TextView>(R.id.no_friends_text).visibility = View.VISIBLE;
                }
            }
        }
    }

    fun getRequests() {
        var username = Singletons.credentialsManager.userInfo.username
        this.requests.clear();
        var db = FirebaseFirestore.getInstance()
        var docRefFriends = db.collection("friend_requests").whereEqualTo("target", username)
        Log.d("SocialMenu", "got to requests function")
        docRefFriends.get().addOnSuccessListener { snap ->
            Log.d("SocialMenu", "success on request fetch")
            if(snap.documents.size > 0) {
                snap.documents.forEach { doc ->
                    var sender = doc["sender"] as String;
                    Log.d("SocialMenu", sender)
                    if (sender != null) {
                        var docRefUser = db.collection("users").whereEqualTo("username", sender)
                        docRefUser.get().addOnSuccessListener { userSnap ->
                            if (userSnap.documents.size > 0) {
                                var doc = userSnap.documents[0];
                                this.requests.add(FriendRequest(doc["username"] as String, doc["avatar"] as String))
                                this.requests.sortBy { it.sender }
                                requestAdapter.updateList(this.requests)
                                runOnUiThread {
                                    findViewById<TextView>(R.id.no_requests_text).visibility = View.GONE;
                                    findViewById<TextView>(R.id.requests_title).setText("Requêtes (${requests.size})")
                                }
                            } else {
                                this.requests.clear();
                                requestAdapter.updateList(this.requests)
                                runOnUiThread {
                                    findViewById<TextView>(R.id.no_requests_text).visibility = View.VISIBLE;
                                    findViewById<TextView>(R.id.requests_title).setText("Requêtes (${requests.size})")
                                }
                            }
                            Log.d("SocialMenu", this.requests.toString())
                            requestAdapter.notifyDataSetChanged()
                        }
                    }
                }
            } else {
                this.requests.clear();
                requestAdapter.updateList(this.requests)
                Log.d("SocialMenu", this.requests.toString())
                requestAdapter.notifyDataSetChanged();
                runOnUiThread {
                    findViewById<TextView>(R.id.no_requests_text).visibility = View.VISIBLE;
                    findViewById<TextView>(R.id.requests_title).setText("Requêtes (${requests.size})")
                }
            }
        }
    }

    private var searchResultUser: Friend? = null;

    fun showSearchPopup(){
        var inflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        var popupView = inflater.inflate(R.layout.popup_add_friend, null);

        val width = LinearLayout.LayoutParams.WRAP_CONTENT
        val height = LinearLayout.LayoutParams.WRAP_CONTENT
        val focusable = true
        val popupWindow = PopupWindow(popupView, width, height, focusable)

        var searchButton = popupView.findViewById<Button>(R.id.search_user_button)
        searchButton.setOnClickListener{
            this.searchUser(popupView, popupWindow)
        }

        popupWindow.showAtLocation(popupView, Gravity.CENTER, 0, 0);
    }

    fun searchUser(popup: View, window: PopupWindow){
        searchResultUser = null;
        var username = Singletons.credentialsManager.userInfo.username
        var db = FirebaseFirestore.getInstance()
        var searchResult = popup.findViewById<EditText>(R.id.username_search_input).text.toString()
        var botNames: List<String> = BotName.values().map{ botName -> botName.value };
        if(!botNames.contains(searchResult) && username != searchResult){
            db.collection("users").whereEqualTo("username", searchResult).get().addOnSuccessListener {snap->
                if(snap.documents.size > 0){
                    var data = snap.documents[0].data;
                    if(!this.friends.map { f -> f.username }.contains(data!!["username"] as String)){
                        searchResultUser = Friend(data!!["username"] as String, data!!["avatar"] as String, -1)
                        runOnUiThread{
                            popup.findViewById<TextView>(R.id.search_username_text).text = searchResultUser!!.username
                            if(searchResultUser!!.avatar != ""){
                                var url: URL = URL(searchResultUser!!.avatar)
                                Glide.with(popup.context).load(url).into(popup.findViewById(R.id.user_search_image))
                            } else {
                                var url: URL = URL(Constants.DEFAULT_AVATAR_LINK)
                                Glide.with(popup.context).load(url).into(popup.findViewById(R.id.user_search_image))
                            }
                            popup.findViewById<Button>(R.id.search_add_friend_button).setOnClickListener{
                                if(searchResultUser != null) {
                                    sendRequest(window);
                                }
                            }
                            popup.findViewById<ConstraintLayout>(R.id.user_search_result_container).visibility = View.VISIBLE
                        }
                    }
                }
            }
        }
    }

    fun sendRequest(window: PopupWindow){
        var username = Singletons.credentialsManager.userInfo.username
        var db = FirebaseFirestore.getInstance()
        db.collection("friend_requests").whereEqualTo("target", searchResultUser!!.username).whereEqualTo("sender", username).get().addOnSuccessListener { snap ->
            if(snap.documents.size == 0){
                var dataToAdd = hashMapOf("sender" to username, "target" to searchResultUser!!.username)
                db.collection("friend_requests").add(dataToAdd).addOnSuccessListener {
                    Singletons.socket.emit("update-friend-requests", searchResultUser!!.username)
                    window.dismiss()
                }
            }
        }
    }
}