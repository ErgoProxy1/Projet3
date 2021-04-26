package com.example.FaisMoiUnDessin.Authentication

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import com.example.FaisMoiUnDessin.MainActivity
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import io.socket.client.IO
import io.socket.emitter.Emitter

class LoginActivity : AppCompatActivity() {
    lateinit var credentialsManager: CredentialsManager


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        this.credentialsManager = CredentialsManager(Singletons.socket)
        this.credentialsManager.setInputFields(findViewById(R.id.username),findViewById(R.id.password))

        Singletons.uid = "";

        Singletons.socket.connect()
            .on("login-pass", Emitter.Listener {

                logUserIn()
            }).on("login-fail", Emitter.Listener {

                runOnUiThread(loginErrorThread)
            })
    }



    private var loginErrorThread: Thread = Thread(){
        displayUsernameError("Le nom d'utilisateur est déjà pris!")
    }

    private fun displayUsernameError(error: String) {
        var mUsernameInput = findViewById<EditText>(R.id.username)
        mUsernameInput.error = error
    }

    private var loginSuccessThread: Thread = Thread(){
        findViewById<EditText>(R.id.username).text.clear()
        findViewById<EditText>(R.id.password).text.clear()
    }

    fun loginButtonPressed(view: View){
        this.credentialsManager.login()
    }



    private fun logUserIn() {
        var username = findViewById<EditText>(R.id.username).text.toString().trim()
        var mPasswordInput = findViewById<EditText>(R.id.password)
        var password = mPasswordInput.text.toString()
        Singletons.credentialsManager.recordLogin()
        runOnUiThread(loginSuccessThread)
        if(username.length > 0) {
            val intent = Intent(this, MainActivity::class.java).apply {
                putExtra("username", username)
            }
            startActivity(intent)
        } else {
            runOnUiThread( Runnable() {
                run(){
                    displayUsernameError("Vous est déja connecté sur un autre appareil")
                    Singletons.socket.emit("manual-disconnect")
                }
            })
        }

    }

}

