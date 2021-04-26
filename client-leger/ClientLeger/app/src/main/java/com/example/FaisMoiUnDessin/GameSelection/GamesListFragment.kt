package com.example.FaisMoiUnDessin.GameSelection

import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.Observer
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import com.example.FaisMoiUnDessin.ViewModel.GamesListViewModel
import io.reactivex.rxjava3.kotlin.subscribeBy


class GamesListFragment : Fragment() {

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.fragment_games_list, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Singletons.gamesListManager.setupServerListener()
        Singletons.gamesListManager.fetchLobbyListFromServer()
        var recyclerView = requireView().findViewById<RecyclerView>(R.id.games_list_recycler)
        val recyclerAdapter = GamesListAdapter(Singletons.gamesListManager.visibleGamesList)
        recyclerView.apply {
            layoutManager = LinearLayoutManager(activity)
            adapter = recyclerAdapter
        }
        Singletons.gamesListManager.visibleGamesList.subscribeBy (
            onNext = {
                if(!isDetached){
                    requireActivity().runOnUiThread(Thread() {
                        Log.d("GamesListFragment",">> Notifying Fragment")
                        recyclerAdapter.notifyDataSetChanged()
                    })
                } else {
                    Log.d("GamesListFragment",">> No Activity")
                }
            },
            onError = {})

        recyclerAdapter.notifyDataSetChanged()
    }


}