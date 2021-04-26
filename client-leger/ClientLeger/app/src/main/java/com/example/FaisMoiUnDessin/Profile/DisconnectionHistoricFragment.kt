package com.example.FaisMoiUnDessin.Profile

import android.annotation.SuppressLint
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.res.ResourcesCompat
import com.example.FaisMoiUnDessin.R

// TODO: Rename parameter arguments, choose names that match
// the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
private const val ARG_PARAM1 = "param1"
private const val ARG_PARAM2 = "param2"

/**
 * A simple [Fragment] subclass.
 * Use the [DisconnectionHistoricFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class DisconnectionHistoricFragment : Fragment() {

    private var disconnectionList: List<String> = List(0){""}
    private var isLoaded = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {


        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_disconnection_historic, container, false)
    }

    override fun onStart() {
        super.onStart()
        setDisconnections()
        isLoaded = true
        updateVisuals()
    }

    fun setDisconnections(){
        disconnectionList = ProfileHolder.formattedTimeListDisconnect
        if(isLoaded){
            updateVisuals()
        }
    }

    private fun updateVisuals() {
        val layout = requireView().findViewById<LinearLayout>(R.id.disconnectLayout)
        layout.removeAllViews()
        disconnectionList.forEach{
            val textView = getNewTextView()
            textView.text = it
            layout.addView(textView)
        }
    }


    private fun getNewTextView() : TextView {
        var newText = TextView(this.context)
        newText.setBackgroundColor(0x00000000)
        newText.setTextColor(ResourcesCompat.getColor(resources, R.color.base_text_color, null))
        newText.text = "-----"
        newText.textSize = 24F
        newText.textAlignment = TextView.TEXT_ALIGNMENT_CENTER
        return newText
    }

}