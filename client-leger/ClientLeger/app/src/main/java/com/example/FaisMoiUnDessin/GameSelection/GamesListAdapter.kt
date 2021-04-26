package com.example.FaisMoiUnDessin.GameSelection

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.FaisMoiUnDessin.CustomViews.AttributeRowView
import com.example.FaisMoiUnDessin.Data.GameInfo
import com.example.FaisMoiUnDessin.Enums.Difficulty
import com.example.FaisMoiUnDessin.Enums.GameMode
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import io.reactivex.rxjava3.subjects.BehaviorSubject

class GamesListAdapter(val lobbies: BehaviorSubject<MutableList<GameInfo>>): RecyclerView.Adapter<GamesListAdapter.GamesListViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GamesListAdapter.GamesListViewHolder {
        Log.d("GamesListAdapter","onCreateViewHolder")
        val layoutInflater = LayoutInflater.from(parent.context)
        val cellForRow = layoutInflater.inflate(R.layout.game_row, parent, false)
        return GamesListViewHolder(cellForRow)
    }

    override fun getItemCount(): Int {
        Log.d("GamesListAdapter","getItemCount")
        return lobbies.value.size
    }

    override fun onBindViewHolder(holder: GamesListAdapter.GamesListViewHolder, position: Int) {
        Log.d("onBindViewHolder","At position: $position")
        holder.view.apply {
            val currentGameInfo = lobbies.value[position]
            findViewById<AttributeRowView>(R.id.game_name).setAttrValue(currentGameInfo.host)
            var maxNbPlayers: Int
            var gameModeName: String
            if (currentGameInfo.gameMode == GameMode.CLASSIC.ordinal){
                maxNbPlayers = 4
                gameModeName = "Classique"
            } else {
                maxNbPlayers = 8
                gameModeName = "Chacun pour soi"
            }

            val difficultyToName = hashMapOf(Difficulty.EASY.ordinal  to "Facile", Difficulty.NORMAL.ordinal to "Normale", Difficulty.HARD.ordinal to "Difficile")
            var difficultyToDisplay = difficultyToName[currentGameInfo.difficulty]
            if (difficultyToDisplay == null) difficultyToDisplay = "Inconnue"
            val hasPassword = currentGameInfo.password != ""
            findViewById<ImageView>(R.id.game_password_lock_ic).visibility = if(hasPassword) View.VISIBLE else View.GONE
            findViewById<AttributeRowView>(R.id.game_population).setAttrNameValue("Nombre de joueurs: ","${currentGameInfo.users.size} / $maxNbPlayers")
            findViewById<AttributeRowView>(R.id.game_mode).setAttrNameValue("Mode de jeu: ",gameModeName)
            findViewById<AttributeRowView>(R.id.game_diff).setAttrNameValue("Difficulté: ", difficultyToDisplay)
        }
    }

    inner class GamesListViewHolder(val view: View): RecyclerView.ViewHolder(view),
    View.OnClickListener{
        init {
            view.setOnClickListener(this)
        }

        override fun onClick(v: View?) {
            if(adapterPosition>=0) {
                val gameInfo = lobbies.value[adapterPosition]
                if (v != null) {
                    Singletons.optionManager.reactToGameClick(v.context,gameInfo)
                }
            }
            Log.d("GamesListAdapterClick","Item clicked at position: $adapterPosition")
        }
    }


}