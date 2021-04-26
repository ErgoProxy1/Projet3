package com.example.FaisMoiUnDessin.SocialMenu

import android.app.AlertDialog
import android.content.Context
import android.graphics.Color
import android.util.TypedValue
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.FaisMoiUnDessin.Constants
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import com.google.firebase.firestore.FirebaseFirestore
import org.w3c.dom.Text
import java.net.URL


class FriendsListAdapter(socialMenuContext: Context): RecyclerView.Adapter<RecyclerView.ViewHolder>() {
    private var friends: List<Friend> = listOf();
    private var socialMenuContext: Context = socialMenuContext;

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return FriendViewHolder(
            LayoutInflater.from(parent.context).inflate(R.layout.layout_social_menu_friends, parent, false)
        )
    }

    override fun getItemCount(): Int {
        return friends.size;
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when(holder){
            is FriendViewHolder -> {
                holder.bind(friends.get(position))
            }
        }
    }

    fun updateList(friendsList: List<Friend>){
        this.friends = friendsList
    }

    inner class FriendViewHolder constructor(itemView: View): RecyclerView.ViewHolder(itemView){
        val player_name = itemView.findViewById<TextView>(R.id.friend_name)
        val friends_list_avatar = itemView.findViewById<ImageView>(R.id.friends_list_avatar)
        val status_text = itemView.findViewById<TextView>(R.id.status_friend)
        val remove_button = itemView.findViewById<TextView>(R.id.remove_friend_button)
        fun bind(friend: Friend){
            (socialMenuContext as SocialMenuActivity).runOnUiThread {
                player_name.setText(friend.username);
                if (friend.avatar != "") {
                    var url: URL = URL(friend.avatar)
                    Glide.with(itemView.context).load(url).into(friends_list_avatar)
                } else {
                    var url: URL = URL(Constants.DEFAULT_AVATAR_LINK);
                    Glide.with(itemView.context).load(url).into(friends_list_avatar)
                }
                when (friend.status) {
                    -1 -> {
                        status_text.setText("Statut:...")
                    }
                    0 -> {
                        status_text.setText("Statut: En ligne")
                    }
                    1 -> {
                        status_text.setText("Statut: Ne pas déranger")
                    }
                    2 -> {
                        status_text.setText("Statut: Inactif")
                    }
                    3 -> {
                        status_text.setText("Statut: En partie")
                    }
                    4 -> {
                        status_text.setText("Statut: En attente")
                    }
                    5 -> {
                        status_text.setText("Statut: Hors Ligne")
                    }
                }

                remove_button.setOnClickListener{
                    removeFriend(friend)
                }
            }
        }

        fun removeFriend(friend: Friend){
            var builder = AlertDialog.Builder(socialMenuContext, android.R.style.Theme_Material_Dialog_Alert);
            builder.setCancelable(true);
            var title = TextView(socialMenuContext)
            title.setText("Confirmation")
            title.setTextColor(Color.parseColor("#FFFFFF"))
            title.setPadding(20, 10, 0, 5)
            title.setTextSize(TypedValue.COMPLEX_UNIT_SP, 28.0f)
            builder.setCustomTitle(title);

            builder.setMessage("Cette action retirere ${friend.username} de votre liste d'amis.\n\nÊtes-vous certain de vouloir continuer?")
            builder.setPositiveButton("Confirmer"){ dialog, which ->
                var username = Singletons.credentialsManager.userInfo.username
                var db = FirebaseFirestore.getInstance()
                db.collection("friends").whereArrayContains("users", username).get().addOnSuccessListener { snap ->
                    if(snap.documents.size > 0){
                        snap.documents.forEach{ doc ->
                            var users = doc.data!!["users"] as List<String>
                            if(users.contains(friend.username)){
                                db.collection("friends").document(doc.id).get().addOnSuccessListener { relationToRemove ->
                                    db.collection("friends").document(relationToRemove.id).delete().addOnSuccessListener {
                                        Singletons.socket.emit("update-friends-list", friend.username)
                                        (socialMenuContext as SocialMenuActivity).getFriendsList();
                                    }
                                }
                            }
                        }
                    }
                }
            }
            builder.setNegativeButton("Annuler"){ dialog, which -> }
            val alert = builder.create();
            alert.show();
        }
    }

}