package com.example.FaisMoiUnDessin.GameLobby

import android.content.Context
import android.os.Build
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.annotation.RequiresApi
import androidx.appcompat.widget.PopupMenu
import androidx.compose.ui.res.colorResource
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.view.iterator
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.Observer
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.FaisMoiUnDessin.Data.Team
import com.example.FaisMoiUnDessin.Enums.BotName
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import io.reactivex.rxjava3.subjects.PublishSubject
import org.json.JSONObject

@RequiresApi(Build.VERSION_CODES.M)
class TeamPresenterView(context: Context, val team: MutableLiveData<Team>, teamName:String, canAddPlayers:Boolean, titleColor: Int? = null) : ConstraintLayout(context)  {
    val view: View
    val virtualPlayerRequested: PublishSubject<String> = PublishSubject.create()
    lateinit var givenAdapter: TeamMembersAdapter
    init {
        Log.d("TeamPresenterView","<>1 creating it")
        val inflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        this.view = inflater.inflate(R.layout.team_presenter_view,this,true)
        val color = titleColor ?: resources.getColor(R.color.base_text_color, null)
        val title = this.view.findViewById<TextView>(R.id.team_name)
        title.text = teamName
        title.setTextColor(color)
        this.setupView(canAddPlayers)
        givenAdapter.notifyDataSetChanged()
    }

    fun setAddPlayerButtonVisibility(buttonIsVisible: Boolean) {
        findViewById<Button>(R.id.team_presenter_add_bot_btn).visibility = if(buttonIsVisible) View.VISIBLE else  View.GONE
    }

    fun notifyDataChange() {
        givenAdapter.notifyDataSetChanged()
    }

    private fun setupView(canAddPlayers:Boolean) {
        this.setupRecyclerViewObservation(team)
        this.bindEvents()
        if (!canAddPlayers)this.hideUnavailableOptions()
    }

    private fun hideUnavailableOptions() {
        setAddPlayerButtonVisibility(false)
    }

    private fun bindEvents() {
        findViewById<Button>(R.id.team_presenter_add_bot_btn).setOnClickListener {
            Log.d("TeamPresenterView","virtualPlayerRequest button CLICKED!")
            val popupMenu = PopupMenu(view.context,it)
            popupMenu.inflate(R.menu.bot_selection_menu)
            popupMenu.setOnMenuItemClickListener {menuItem ->
                this.virtualPlayerRequested.onNext(menuItem.title.toString())
                return@setOnMenuItemClickListener true
            }
            this.setMenuOptions(popupMenu)
            popupMenu.show()
        }
    }

    private fun setMenuOptions(popupMenu: PopupMenu) {
        popupMenu.menu.clear()
        val availableBots = Singletons.optionManager.availableBots()
        for (availableBot in availableBots) {
            popupMenu.menu.add(availableBot)
        }
    }

    private fun setupRecyclerViewObservation(team: MutableLiveData<Team>) {
        val recyclerView = this.view.findViewById<RecyclerView>(R.id.recyclerView_team_members)
        givenAdapter = TeamMembersAdapter(team)
        recyclerView.apply{
            layoutManager = LinearLayoutManager(context)
            adapter = givenAdapter
        }
        team.observe(context as LifecycleOwner, Observer {
            givenAdapter.notifyDataSetChanged()
        })
        givenAdapter.setHost(Singletons.gameManager.detailedGameInfo.value.host)

        Log.d("TeamPresenterView",">> Created recycler view")
        givenAdapter.notifyDataSetChanged() // Adapter la vue a la liste
    }
}