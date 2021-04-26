package com.example.FaisMoiUnDessin.GameLobby

import android.os.CountDownTimer
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.widget.PopupMenu
import androidx.core.view.isGone
import androidx.lifecycle.MutableLiveData
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.FaisMoiUnDessin.Constants
import com.example.FaisMoiUnDessin.Data.Team
import com.example.FaisMoiUnDessin.Enums.GameMode
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import com.google.firebase.firestore.FirebaseFirestore
import java.lang.Exception
import java.net.URL

class TeamMembersAdapter(val users: MutableLiveData<Team>, val hasPoints: Boolean = false): RecyclerView.Adapter<TeamMembersAdapter.TeamMemberViewHolder>() {
    private var points: HashMap<String,Int>
    private var reactions: HashMap<String,String>
    private var timersReactions: HashMap<String,CountDownTimer>
    private var host: String
    private val REACTION_LIFE: Long = 3000

    init {
        Log.d("TeamMembersAdapter","Just created")
        points = HashMap()
        reactions = HashMap()
        timersReactions = HashMap()
        host = ""
        users.value?.users?.forEach {
            points[it] = 0
            reactions[it] = ""
        }
    }
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TeamMemberViewHolder {
        Log.d("TeamMembersAdapter", "users are: ${users.value!!.users}")
        val layoutInflater = LayoutInflater.from(parent.context)
        val cellForRow = layoutInflater.inflate(R.layout.team_member_row, parent, false)
        return TeamMemberViewHolder(cellForRow)
    }

    override fun getItemCount(): Int {
        Log.d("TeamMembersAdapter","users count is ${users.value?.users?.size}")
        return users.value?.users?.size ?: 0
    }

    override fun onBindViewHolder(holder: TeamMemberViewHolder, position: Int) {
        holder.view.apply{
            val currentUserName = users.value!!.users[position]
            findViewById<TextView>(R.id.team_member_username).text = currentUserName
            findViewById<TextView>(R.id.team_member_points).text = "${points[currentUserName]} points"
            findViewById<TextView>(R.id.team_member_points).isGone = !hasPoints
            var reactionImageView = findViewById<ImageView>(R.id.reactionImageView)
            if(currentUserName!=null) holder.addImageToProfile(currentUserName)

            findViewById<TextView>(R.id.host_crown_image_view).isGone = currentUserName.compareTo(host) != 0

            val teamIndicator = findViewById<ImageView>(R.id.team_indicator)
            teamIndicator.visibility = View.GONE
            if (Singletons.isInGame && Singletons.gameMode == GameMode.CLASSIC.value) {
                teamIndicator.visibility = View.VISIBLE
                val teams = Singletons.gameManager.detailedGameInfo.value.teams
                if(teams[0].users.contains(currentUserName)){
                    teamIndicator.setImageResource(R.color.red)
                } else {
                    teamIndicator.setImageResource(R.color.blue)
                }
            }


            val reaction = reactions[currentUserName]
            var isReaction = true
            when(reaction){
                "like" -> {
                    reactionImageView.setImageResource(R.drawable.green_thumbs_up)
                    reactionImageView.visibility = View.VISIBLE
                }
                "dislike" -> {
                    reactionImageView.setImageResource(R.drawable.red_thumbs_down)
                    reactionImageView.visibility = View.VISIBLE
                }
                else -> {
                    reactionImageView.visibility = View.INVISIBLE
                    isReaction = false
                }
            }

            if(isReaction) {
                reactions[currentUserName] = ""
                timersReactions[currentUserName]?.cancel()
                timersReactions[currentUserName] = object: CountDownTimer(REACTION_LIFE,REACTION_LIFE) {
                    override fun onTick(millisUntilFinished: Long) {}
                    override fun onFinish() {
                        reactionImageView.visibility = View.INVISIBLE
                    }
                }.start()
            }
        }
    }

    fun setPoints(username: String, points: Int){
        this.points[username] = points
    }

    fun setReaction(username: String, reaction: String){
        this.reactions[username] = reaction
    }

    fun setPointsIfAbsent(username: String, points: Int){
        this.points.putIfAbsent(username, points)
    }

    fun setHost(hostName: String) {
        host = hostName
    }

    inner class TeamMemberViewHolder(val view: View): RecyclerView.ViewHolder(view)/*, View.OnCreateContextMenuListener*/ {
        init {
            val rowMenuButton = view.findViewById<ImageButton>(R.id.team_member_row_menu_btn)
            rowMenuButton.setOnClickListener{ _->
                Log.d("TeamMembersAdapter","Menu pressed at position: $adapterPosition")
                val popupMenu = PopupMenu(view.context,view).apply {
                    inflate(R.menu.player_actions_menu)
                    menu.clear()
                }

                val availableOptions = Singletons.optionManager.playerActionsAvailableOptions(users.value!!.users[adapterPosition])
                for (availableOption in availableOptions) popupMenu.menu.add(availableOption)

                popupMenu.setOnMenuItemClickListener {item ->
                    val targetedUser = users.value!!.users[adapterPosition]
                    Singletons.optionManager.actUponPlayerMenu(view.context,item.toString(),targetedUser)
                    return@setOnMenuItemClickListener true
                }

                if(view.context !=null) popupMenu.show()
            }

            rowMenuButton.visibility = View.VISIBLE
        }

        fun addImageToProfile(username:String) {
            val imageView = view.findViewById<ImageView>(R.id.teammate_profile_pic)
            Log.d("TeamMembersAdapter","addImageToProfile($username, $imageView)")
            FirebaseFirestore.getInstance().collection("users").whereEqualTo("username", username).get().addOnSuccessListener { snap->
                Log.d("TeamMembersAdapter","Firebase response as ${snap.documents}\nusername==$username")
                if(snap.documents.size>0) {
                    var data = snap.documents[0]
                    val avatarURLStr = data!!["avatar"] as String
                    val avatarURL = if(avatarURLStr=="") URL(Constants.DEFAULT_AVATAR_LINK) else URL(avatarURLStr)
                    try {
                        Glide.with(imageView.context).load(avatarURL).into(imageView)
                    } catch (err: Exception){Log.d("TeamMembersAdapter","error loading profile pic with Glide $err")}

                }
            }.addOnFailureListener {
                Log.d("TeamMembersAdapter","Firebase exception thrown: $it")
            }
        }
    }




}