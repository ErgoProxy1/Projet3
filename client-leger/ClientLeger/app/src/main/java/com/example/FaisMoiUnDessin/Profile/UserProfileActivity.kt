package com.example.FaisMoiUnDessin.Profile

import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.res.ResourcesCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.widget.ViewPager2
import com.example.FaisMoiUnDessin.LittleHelpers.DialogPopup
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import com.google.android.gms.tasks.Task
import com.google.android.material.tabs.TabLayout
import com.google.firebase.Timestamp
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import com.google.firebase.ktx.Firebase
import com.google.firebase.storage.ktx.storage
import java.io.File
import java.net.URL
import kotlin.math.max


class UserProfileActivity : FragmentActivity() {
    private lateinit var username: String
    private lateinit var picture: Bitmap

    @Volatile lateinit var adapter: ProfilePagerAdapter
    @Volatile lateinit var pager: ViewPager2

    //@Volatile var feedbackLoopCanceller = false
    //@Volatile var isFirstSelect = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user_profile)

        init()
        setPager()
    }

    private fun init() {
        username = Singletons.credentialsManager.userInfo.username
        var firstName = Singletons.credentialsManager.userInfo.firstName
        var lastName = Singletons.credentialsManager.userInfo.lastName

        ProfileHolder.retrieveUserData()

        findViewById<TextView>(R.id.profilUserName).text = "Nom d'utilisateur : ${username}"
        findViewById<TextView>(R.id.profilFirstName).text = "Prénom : ${firstName}"
        findViewById<TextView>(R.id.profilLastName).text = "Nom : ${lastName}"
        findViewById<ImageView>(R.id.profilPic).setImageBitmap(ProfileHolder.profilePic)
    }

    private fun setPager(){



        val tabLayout = findViewById<CustomTabLayout>(R.id.customTabLayout)
        tabLayout.setTabsList(arrayOf<String>("Statistiques", "Historique des parties","Connexions", "Déconnexion")) //Compte tout seul le nombre de tabs

        val color: Int = ResourcesCompat.getColor(resources, R.color.base_text_color, null)
        tabLayout.setColorTheme(color)
        tabLayout.setIndicatorHeight(10)

        adapter = ProfilePagerAdapter(this, tabLayout.tabCount)
        pager = findViewById<ViewPager2>(R.id.viewPagerProfile)
        pager.setBackgroundColor(Color.TRANSPARENT)

        pager.adapter = adapter

        tabLayout.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab?) {
                pager.currentItem = tabLayout.selectedTabPosition
            }

            override fun onTabReselected(tab: TabLayout.Tab?) {

            }

            override fun onTabUnselected(tab: TabLayout.Tab?) {

            }
        })

        pager.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            var isFirstSelect = true
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)

                if(isFirstSelect){
                    isFirstSelect = false
                    return
                }

                tabLayout.selectTab(position)
            }
        })



    }



    private val FILE_SELECT_CODE = 0

    private fun showFileChooser() {
        val intent = Intent(Intent.ACTION_GET_CONTENT)
        intent.type = "*/*"
        intent.addCategory(Intent.CATEGORY_OPENABLE)
        try {
            startActivityForResult(
                Intent.createChooser(intent, "Select a File to Upload"),
                FILE_SELECT_CODE
            )
        } catch (ex: ActivityNotFoundException) {
            // Potentially direct the user to the Market with a Dialog
            DialogPopup.showDialog(
                this,
                "Sélecteur de fichier introuvable",
                "Veuillez installer un sélecteur de fichier sur votre appareil"
            )
        }
    }



    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {

        var uri: Uri? = data!!.data
        uploadPicture(uri)


        super.onActivityResult(requestCode, resultCode, data)
    }

    private fun uploadPicture(uri: Uri?){
        if(uri == null) return

        val name = (File(uri!!.path)).name

        val storage = Firebase.storage.reference

        Log.d("FileFinding", uri.toString())
        Log.d("FileFinding", name)

        val imageRef = storage.child("avatars/${Singletons.uid}")

        val upload = imageRef.putFile(uri!!)

        val urlTask = upload.continueWithTask { task ->
            if (!task.isSuccessful) {
                task.exception?.let {
                    throw it
                }
            }
            imageRef.downloadUrl
        }.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val downloadUri = task.result
                val data = hashMapOf("avatar" to downloadUri.toString())
                Log.d("test", Singletons.uid)
                Singletons.firebaseDB.collection("users").document(Singletons.uid)
                    .set(data, SetOptions.merge())
                Thread {
                    if (downloadUri.toString() != "") {
                        var url: URL = URL(downloadUri.toString())
                        picture = BitmapFactory.decodeStream(url.openConnection().getInputStream())
                        runOnUiThread{
                            findViewById<ImageView>(R.id.profilPic).setImageBitmap(picture)
                        }
                    }
                }.start()
            }
        }
    }

    fun changeImage(view: View) {
        showFileChooser()
    }

    fun back(view: View) {
        this.finish()
    }
}