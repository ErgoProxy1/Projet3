package com.example.FaisMoiUnDessin.Chat

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.fragment.app.DialogFragment
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import io.reactivex.rxjava3.subjects.PublishSubject

class CreateChannelDialogFragment(val ctx: Context) : DialogFragment() {

    private val closeObservable: PublishSubject<Boolean> = PublishSubject.create<Boolean>()

    companion object {
        fun newInstance(ctx: Context): CreateChannelDialogFragment {
            val fragment = CreateChannelDialogFragment(ctx)
            val args = Bundle()

            fragment.isCancelable = true
            fragment.arguments = args
            return fragment
        }
    }

    override fun onCreateView(
            inflater: LayoutInflater, container: ViewGroup?,
            savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_channel_create, container, false)
    }

    override fun onStart() {
        super.onStart()
        this.setupListeners()
    }

    private fun setupListeners() {
        closeObservable.subscribe {
            dismiss()
        }

        requireView().findViewById<Button>(R.id.channel_creation_view_confirmation_btn).setOnClickListener {
            val channelName = getChannelName()
            if (channelName.trim() == "") {
                requireView().findViewById<TextView>(R.id.channel_creation_name_input).error = "Veuillez inserer un nom visible s'il vous plait"
            } else {
                Singletons.messageManager.askToAddChannel(channelName)
                closeObservable.onNext(true)
            }
        }

        requireView().findViewById<EditText>(R.id.channel_creation_name_input).setOnClickListener {
            (it as EditText).error = null
        }
        requireView().findViewById<EditText>(R.id.channel_creation_name_input).setOnEditorActionListener { v, actionId, event ->
            (v as EditText).error = null
            return@setOnEditorActionListener false
        }
    }

    private fun getChannelName(): String {
        return requireView().findViewById<TextView>(R.id.channel_creation_name_input).text.toString()
    }
}