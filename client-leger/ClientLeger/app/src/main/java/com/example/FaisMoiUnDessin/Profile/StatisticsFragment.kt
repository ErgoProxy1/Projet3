package com.example.FaisMoiUnDessin.Profile

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.TextureView
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import com.example.FaisMoiUnDessin.R
import kotlin.math.max


/**
 * A simple [Fragment] subclass.
 * Use the [StatisticsFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class StatisticsFragment : Fragment() {

    var timePlayed: Long = 0
    var nbGames: Long = 0
    var winRatio: Float = 0f
    private var isLoaded = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_statistics, container, false)
    }

    override fun onStart() {
        super.onStart()
        setStats()
        isLoaded = true
        updateVisuals()
    }

    fun setStats(){
        
        this.winRatio = ProfileHolder.winRatio
        this.timePlayed = ProfileHolder.playTime
        this.nbGames = ProfileHolder.nbGames
        if(isLoaded){
            updateVisuals()
        }
    }

    fun updateVisuals(){
        requireView().findViewById<TextView>(R.id.textViewNbGames).text = "Nombre de parties jouées : ${nbGames}"
        requireView().findViewById<TextView>(R.id.textViewStatsVictory).text = "Pourcentage de victoire : ${winRatio*100}%"
        requireView().findViewById<TextView>(R.id.textViewAvgTime).text = "Temps de jeu moyen par partie : ${timePlayed/(60000*max(nbGames,1))}m ${(timePlayed%(60000*max(nbGames,1)))/(1000* max(nbGames,1))}s"
        requireView().findViewById<TextView>(R.id.textViewStatsTime).text = "Temps de jeu total : ${(timePlayed/3600000)}h ${((timePlayed%3600000)/60000)}m"
    }
}