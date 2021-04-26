package com.example.FaisMoiUnDessin.GameSelection

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.fragment.app.DialogFragment
import com.example.FaisMoiUnDessin.Data.GameInfo
import com.example.FaisMoiUnDessin.LittleHelpers.WordSelectionDialogFragment
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import io.reactivex.rxjava3.subjects.PublishSubject

class InsertPasswordPopupFragment(private val gameToJoin: GameInfo) : DialogFragment() {

    companion object {
        fun newInstance(choices: Array<String>, listener: WordSelectionDialogFragment.SelectionListener? = null): WordSelectionDialogFragment {
            val fragment = WordSelectionDialogFragment()
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
        return inflater.inflate(R.layout.fragment_insert_password, container, false)
    }

    override fun onStart() {
        super.onStart()
        this.setupListeners()
    }

    private fun setupListeners() {
        requireView().findViewById<EditText>(R.id.insert_password_input).setOnClickListener {
            (it as EditText).error = null
        }
        requireView().findViewById<EditText>(R.id.insert_password_input).setOnEditorActionListener { v, actionId, event ->
            (v as EditText).error = null
            return@setOnEditorActionListener false
        }

        requireView().findViewById<Button>(R.id.insert_password_view_confirmation_btn).setOnClickListener {
            val password = getPassword()
            if (password.trim() == "") {
                requireView().findViewById<EditText>(R.id.insert_password_input).error = "Veuillez inserer un mot de passe visible s'il vous plait"
            } else if (password != gameToJoin.password) {
                requireView().findViewById<EditText>(R.id.insert_password_input).error = "Mauvais mot de passe! Veuillez retenter"
            }
            else {
                Singletons.gamesSwitchingManager.askToJoinGame(gameToJoin)
                dismiss()
            }
        }
    }

    private fun getPassword(): String {
        return requireView().findViewById<TextView>(R.id.insert_password_input).text.toString()
    }
}