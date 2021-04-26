package com.example.FaisMoiUnDessin.Authentication

import android.app.Activity
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import com.example.FaisMoiUnDessin.LittleHelpers.TextValidator
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.ServerType
import com.example.FaisMoiUnDessin.Singletons
import io.socket.client.IO
import io.socket.emitter.Emitter


class LoginFragment : Fragment() {


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {

        return inflater.inflate(R.layout.fragment_login, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.d("LoginFragment","onViewCreated")
        Singletons.credentialsManager.setInputFields(requireView().findViewById(R.id.username),requireView().findViewById(R.id.password))
        Singletons.credentialsManager.registering = false
        setupEvents()
    }

    private fun setupEvents() {
        requireView().findViewById<EditText>(R.id.username).setOnClickListener {
            (it as EditText).error = null
        }
        requireView().findViewById<EditText>(R.id.username).setOnEditorActionListener { v, actionId, event ->
            (v as EditText).error = null
            return@setOnEditorActionListener false
        }
        requireView().findViewById<EditText>(R.id.password).setOnClickListener {
            requireView().findViewById<EditText>(R.id.username).error = null
        }
        requireView().findViewById<EditText>(R.id.password).setOnEditorActionListener { v, actionId, event ->
            requireView().findViewById<EditText>(R.id.username).error = null
            return@setOnEditorActionListener false
        }

        requireView().findViewById<Button>(R.id.button_login).setOnClickListener {
            (context as AuthActivity).setupRemoteSocket()
            Singletons.credentialsManager.login()
        }
    }

}