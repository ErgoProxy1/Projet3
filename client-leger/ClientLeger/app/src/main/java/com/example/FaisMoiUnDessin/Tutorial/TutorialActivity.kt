package com.example.FaisMoiUnDessin.Tutorial

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageButton
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.widget.ViewPager2
import com.example.FaisMoiUnDessin.Enums.NavigationWindow
import com.example.FaisMoiUnDessin.MainMenu.MainMenuActivity
import com.example.FaisMoiUnDessin.Profile.CustomTabLayout
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import com.google.android.material.tabs.TabLayout
import kotlin.math.max
import kotlin.math.min

class TutorialActivity : FragmentActivity() {

    private lateinit var pager: ViewPager2
    private lateinit var tabLayout: CustomTabLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        Singletons.currentWindow = NavigationWindow.TUTORIAL
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_tutorial)

        setupPager()
        setupButton()
    }

    private fun setupPager() {
        pager = findViewById<ViewPager2>(R.id.tutorialPager)
        tabLayout = findViewById<CustomTabLayout>(R.id.tutorialTabLayout)

        val buttonNext = findViewById<ImageButton>(R.id.buttonNextPicture)
        val buttonPrev = findViewById<ImageButton>(R.id.buttonPreviousPicture)

        tabLayout.setTabsList(arrayOf<String>("Interface partie 1","Interface partie 2","Interface partie 3", "Mode Classique", "Mode Chacun Pour Soi"))
        val tutorialPagerAdapter = TutorialPagerAdapter(this,tabLayout.tabCount)

        pager.adapter = tutorialPagerAdapter

        tabLayout.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener{
            override fun onTabSelected(tab: TabLayout.Tab?) {
                pager.currentItem = tabLayout.selectedTabPosition
            }

            override fun onTabReselected(tab: TabLayout.Tab?) {

            }

            override fun onTabUnselected(tab: TabLayout.Tab?) {

            }
        })

        pager.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            var firstCheck = true
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)

                buttonNext.visibility = View.VISIBLE
                buttonPrev.visibility = View.VISIBLE
                if(position == 0) buttonPrev.visibility = View.GONE
                if(position == tabLayout.tabCount-1) buttonNext.visibility = View.GONE
                buttonNext.invalidate()
                buttonPrev.invalidate()

                tabLayout.selectTab(position)
            }
        })


        if(tabLayout.selectedTabPosition == 0) buttonPrev.visibility = View.GONE
        if(tabLayout.selectedTabPosition == tabLayout.tabCount-1) buttonNext.visibility = View.GONE

        buttonNext.setOnClickListener(View.OnClickListener {
            tabLayout.selectTab(min(tabLayout.selectedTabPosition+1,tabLayout.tabCount-1))

        })

        buttonPrev.setOnClickListener(View.OnClickListener {
            tabLayout.selectTab(max(tabLayout.selectedTabPosition-1, 0))

        })
    }

    private fun setupButton(){
        findViewById<Button>(R.id.quitTutoButton).setOnClickListener(View.OnClickListener {
            Intent(this, MainMenuActivity::class.java).also {
                it.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(it)
            }
            finish()
        })
    }

    override fun onBackPressed() {
        Intent(this, MainMenuActivity::class.java).also {
            it.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(it)
        }
        finish()
        super.onBackPressed()
    }
}