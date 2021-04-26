package com.example.FaisMoiUnDessin.Profile

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import com.example.FaisMoiUnDessin.R

// TODO: Rename parameter arguments, choose names that match
// the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
private const val ARG_PARAM1 = "param1"
private const val ARG_PARAM2 = "param2"

/**
 * A simple [Fragment] subclass.
 * Use the [GamesListFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class GamesListFragment : Fragment() {


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_games_historic_list, container, false)
    }

    override fun onStart() {
        super.onStart()

        setupGames()
    }

    private fun setupGames(){
        val list = requireView().findViewById<LinearLayout>(R.id.gamesListLayout)
        var index: Int = 1
        ProfileHolder.gameResults.forEach { result ->
            val presenter = GamePresenter(this.requireContext())
            list.addView(presenter)

            presenter.setGameNumber(index)
            presenter.setGameResult(result)
            ++index


        }
    }

}