package com.example.FaisMoiUnDessin.MainMenu

import android.content.DialogInterface
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.FragmentActivity
import com.example.FaisMoiUnDessin.Authentication.AuthActivity
import com.example.FaisMoiUnDessin.Chat.ChatFragment
import com.example.FaisMoiUnDessin.Chat.MessageManager
import com.example.FaisMoiUnDessin.GameCreation.GameCreationActivity
import com.example.FaisMoiUnDessin.GameSelection.GameSelectionActivity
import com.example.FaisMoiUnDessin.LittleHelpers.DialogPopup
import com.example.FaisMoiUnDessin.MainActivity
import com.example.FaisMoiUnDessin.Profile.UserProfileActivity
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import com.example.FaisMoiUnDessin.SocialMenu.SocialMenuActivity
import com.example.FaisMoiUnDessin.Tutorial.TutorialActivity

class MainMenuActivity : FragmentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Singletons.isPartOfGame = false
        Singletons.messageManager = MessageManager(inGame = false)
        setContentView(R.layout.activity_main_menu)
        this.setupChat()
        this.setupEvents()
    }

    override fun onResume() {
        super.onResume()
        //Singletons.messageManager = MessageManager(inGame = false)
    }

    override fun onStart() {
        super.onStart()
        if(Singletons.credentialsManager.registering) {
            Singletons.credentialsManager.registering = false
            askForTutorial()
        }
    }

    private fun askForTutorial() {
        DialogPopup.showYesNoDialog(this,"Inscription terminée", "Voulez vous voir le tutoriel ?",
                DialogInterface.OnClickListener { dialog, which ->
                    Intent(this, TutorialActivity::class.java).also { intent: Intent ->
                        startActivity(intent)
                    }
                },
                DialogInterface.OnClickListener { dialog, which ->
                    dialog.dismiss()
                }
        )
    }

    private fun setupChat() {
        val chatFragment  = supportFragmentManager.findFragmentById(R.id.main_menu_chat_fragment) as ChatFragment
        //chatFragment.setForGlobalChat()
    }

    fun setupEvents() {
        findViewById<Button>(R.id.btn_begin).setOnClickListener {
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
        }

        findViewById<Button>(R.id.btn_join_game).setOnClickListener {
            val intent = Intent(this, GameSelectionActivity::class.java)
            startActivity(intent)
        }

        findViewById<Button>(R.id.btn_launch_tutorial).setOnClickListener {
            val intent = Intent(this, TutorialActivity::class.java)
            startActivity(intent)
        }

        findViewById<Button>(R.id.btn_create_game).setOnClickListener {
            val intent = Intent(this, GameCreationActivity::class.java)
            startActivity(intent)
        }

        findViewById<Button>(R.id.btn_social).setOnClickListener {
            val intent = Intent(this, SocialMenuActivity::class.java)
            startActivity(intent)
        }
    }

    fun viewProfil(view: View) {
        val intent = Intent(this, UserProfileActivity::class.java).apply {}
        startActivity(intent)
    }

    fun backToLogin() {
        Intent(this, AuthActivity::class.java).also { intent: Intent ->
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP;
            startActivity(intent)
        }
        finish()
    }

    fun leave(view: View) {
        Singletons.socket.emit("manual-disconnect")
        backToLogin()
    }

    override fun onBackPressed() {
        super.onBackPressed()
        Singletons.socket.emit("manual-disconnect")
        backToLogin()
    }
}