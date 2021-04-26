package com.example.FaisMoiUnDessin.Tutorial

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import com.example.FaisMoiUnDessin.R

class PictureFragment : Fragment {

    var imageId : Int? = null

    constructor()

    constructor(imageId: Int){
        this.imageId = imageId
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_picture, container, false)
    }

    override fun onStart() {
        super.onStart()

        if(imageId != null){

            requireView().findViewById<ImageView>(R.id.teammate_profile_pic).setImageResource(imageId!!)
        }
    }
}