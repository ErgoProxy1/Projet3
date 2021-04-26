package com.example.FaisMoiUnDessin.SocialMenu

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import com.google.firebase.firestore.FirebaseFirestore
import java.lang.ClassCastException
import java.net.URL


class RequestListAdapter(socialMenuContext: Context): RecyclerView.Adapter<RecyclerView.ViewHolder>() {
    private var requests: List<FriendRequest> = listOf();
    private var socialMenuContext: Context = socialMenuContext;

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return requestViewHolder(
            LayoutInflater.from(parent.context).inflate(R.layout.layout_social_menu_requests, parent, false)
        )
    }

    override fun getItemCount(): Int {
        return requests.size;
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when(holder){
            is requestViewHolder -> {
                holder.bind(requests.get(position))
            }
        }
    }

    fun updateList(requestsList: List<FriendRequest>){
        this.requests = requestsList;
    }

    inner class requestViewHolder constructor(itemView: View): RecyclerView.ViewHolder(itemView){
        val requester_name = itemView.findViewById<TextView>(R.id.requester_name)
        val requests_list_avatar = itemView.findViewById<ImageView>(R.id.request_list_avatar)
        val accept_button = itemView.findViewById<Button>(R.id.request_accept_button)
        val reject_button = itemView.findViewById<Button>(R.id.request_refuse_button)
        fun bind(request: FriendRequest){
            requester_name.setText(request.sender);
            if (request.avatar != "") {
                var url: URL = URL(request.avatar)
                Glide.with(itemView.context).load(url).into(requests_list_avatar)
            } else {
                var url: URL = URL("https://firebasestorage.googleapis.com/v0/b/projet3-111.appspot.com/o/avatars%2Fdefaults%2Fbase_avatar.png?alt=media&token=999dac5c-d6ce-4119-8e83-66ed30538354")
                Glide.with(itemView.context).load(url).into(requests_list_avatar)
            }
            accept_button.setOnClickListener{
                acceptRequest(request)
            }
            reject_button.setOnClickListener{
                rejectRequest(request)
            }
        }

        fun acceptRequest(request: FriendRequest){
            var username = Singletons.credentialsManager.userInfo.username
            var db = FirebaseFirestore.getInstance()
            var docRefRequest = db.collection("friend_requests").whereEqualTo("target", username).whereEqualTo("sender", request.sender)
            docRefRequest.get().addOnSuccessListener { snap ->
                if(snap.documents.size > 0){
                    db.collection("friend_requests").document(snap.documents[0].id).delete().addOnSuccessListener {
                        val dataToAdd = hashMapOf("users" to listOf<String>(username, request.sender))
                        db.collection("friends").add(dataToAdd).addOnSuccessListener {
                            Singletons.socket.emit("update-friends-list", request.sender)
                            (socialMenuContext as SocialMenuActivity).getFriendsList();
                            (socialMenuContext as SocialMenuActivity).getRequests();
                        }
                    }
                }
            }
        }

        fun rejectRequest(request: FriendRequest){
            var username = Singletons.credentialsManager.userInfo.username
            var db = FirebaseFirestore.getInstance()
            var docRefRequest = db.collection("friend_requests").whereEqualTo("target", username).whereEqualTo("sender", request.sender)
            docRefRequest.get().addOnSuccessListener { snap ->
                if(snap.documents.size > 0){
                    db.collection("friend_requests").document(snap.documents[0].id).delete().addOnSuccessListener {
                        (socialMenuContext as SocialMenuActivity).getRequests();
                    }
                }
            }
        }
    }
}