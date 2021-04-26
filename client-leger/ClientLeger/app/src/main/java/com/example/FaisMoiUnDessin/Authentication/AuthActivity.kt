package com.example.FaisMoiUnDessin.Authentication

import android.app.Activity
import android.content.DialogInterface
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import androidx.navigation.NavController
import androidx.navigation.findNavController
import androidx.navigation.fragment.NavHostFragment
import com.example.FaisMoiUnDessin.*
import com.example.FaisMoiUnDessin.Chat.Notifications.NotificationChannelGateway
import com.example.FaisMoiUnDessin.LittleHelpers.DialogPopup
import com.example.FaisMoiUnDessin.LittleHelpers.TextValidator
import com.example.FaisMoiUnDessin.MainMenu.MainMenuActivity
import com.example.FaisMoiUnDessin.Profile.ProfileHolder
import com.example.FaisMoiUnDessin.Tutorial.TutorialActivity
import io.socket.client.IO
import io.socket.emitter.Emitter
import kotlinx.coroutines.Runnable

class AuthActivity : AppCompatActivity() {
    lateinit var navHostFragment: NavHostFragment
    lateinit var navController: NavController
    override fun onCreate(savedInstanceState: Bundle?) {
        NotificationChannelGateway.createNotificationChannel(this)
        Log.d("AuthActivity","on create")
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_auth)
        this.navHostFragment = supportFragmentManager.findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        this.navController = navHostFragment.navController
        Log.d("credentials","chosen-socket")
        Log.d("credentials", Singletons.socket.toString())
        setupRemoteSocket()
    }

    override fun onResume() {
        super.onResume()
        //TODO disconnect user no matter what
    }

    override fun onPause() {
        super.onPause()
        Singletons.chatRepository.setupServerEvents()
        Singletons.friendsRepository.fillFriendsList()
    }

    override fun onPostCreate(savedInstanceState: Bundle?) {
        findViewById<Button>(R.id.LocalConnectButton).setOnClickListener(View.OnClickListener {
            localButtonPressed()
        })

        Singletons.credentialsManager.setInputFields(findViewById(R.id.username),findViewById(R.id.password))
        super.onPostCreate(savedInstanceState)
    }

    private fun setupLocalSocket() {
        Log.d("AuthActivity","Local socket as ${Singletons.socket}")
        Singletons.currentServer = ServerType.LOCAL
        Singletons.socket = IO.socket(Singletons.localServerURL)
        Singletons.socket.connect()
                .on("login-pass", Emitter.Listener {
                    //Singletons.credentialsManager.userInfo = UserInfo(findViewById<EditText>(R.id.username).text.toString().trim(), "", "")
                    logUserIn()
                }).on("login-fail", Emitter.Listener {
                    runOnUiThread(Thread(){
                        if(!Singletons.credentialsManager.registering) TextValidator.displayError(Singletons.credentialsManager.mUsernameInput, "L'utilisateur est déja connecté sur un autre client!")
                    })
                    Log.d("credentials","login-failed")
                })
    }

    fun setupRemoteSocket() {
        Singletons.currentServer = ServerType.REMOTE
        Singletons.socket = IO.socket(Singletons.remoteServerURL)
        Singletons.socket.connect()
            .on("login-pass", Emitter.Listener {
                Log.d("credentials","login-pass")
                logUserIn()
            }).on("login-fail", Emitter.Listener {
                runOnUiThread(Thread(){
                    if(!Singletons.credentialsManager.registering) TextValidator.displayError(Singletons.credentialsManager.mUsernameInput, "L'utilisateur est déja connecté sur un autre client!")
                })

            })
    }

    private fun displayUsernameError(error: String) {
        var mUsernameInput = findViewById<EditText>(R.id.username)
        mUsernameInput.error = error
    }

    private var loginSuccessThread: Thread = Thread(){
        findViewById<EditText>(R.id.username).text.clear()
        findViewById<EditText>(R.id.password).text.clear()
        //if(Singletons.credentialsManager.registering) Singletons.credentialsManager.registerUser()
    }

    private fun localButtonPressed(){
        setupLocalSocket()
        Singletons.credentialsManager.login()
    }

    fun loginButtonPressed(view: View){
        Log.d("ORIGIN","AuthActivity")
        setupRemoteSocket()
        Singletons.credentialsManager.login()
    }

    fun registerButtonPressed(view: View){
        view.isClickable = false
        Log.d("ORIGIN","AuthActivity")
        Singletons.credentialsManager.register(view)
    }

    fun toRegisterButtonPressed(view: View){
        Log.d("REGISTER BUTTON","Pressed")
        val action = LoginFragmentDirections.actionLoginFragmentToRegisterFragment()
        view.findNavController().navigate(action)
    }

    fun toLoginButtonPressed(view: View){
        Log.d("REGISTER BUTTON","Pressed")
        val action = RegisterFragmentDirections.actionRegisterFragmentToLoginFragment()
        view.findNavController().navigate(action)
    }

    fun logUserIn() {
        var username = findViewById<EditText>(R.id.username).text.toString().trim()
        var mPasswordInput = findViewById<EditText>(R.id.password)
        ProfileHolder.retrieveUserData()
        Singletons.credentialsManager.recordLogin()
        runOnUiThread(loginSuccessThread)
        if(username.length > 0) {
            hideKeyboard()
            Intent(this, MainMenuActivity::class.java).also { intent: Intent ->
                intent.putExtra("username", username)
                startActivity(intent)
            }
        } else {
            runOnUiThread( Runnable() {
                run(){
                    displayUsernameError("Vous est déja connecté sur un autre appareil")
                    Singletons.socket.emit("manual-disconnect")
                }
            })
        }

    }


    private fun hideKeyboard() {
        val imm: InputMethodManager = this.getSystemService(Activity.INPUT_METHOD_SERVICE) as InputMethodManager
        //Find the currently focused view, so we can grab the correct window token from it.
        var view = this.currentFocus
        //If no view currently has focus, create a new one, just so we can grab a window token from it
        if (view == null) {
            view = View(this)
        }
        imm.hideSoftInputFromWindow(view.windowToken, 0)
    }

}