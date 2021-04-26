package com.example.FaisMoiUnDessin.Profile

import android.content.Context
import android.content.res.ColorStateList
import android.content.res.TypedArray
import android.graphics.Canvas
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.FrameLayout
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.res.ResourcesCompat
import com.example.FaisMoiUnDessin.R
import com.google.android.material.tabs.TabLayout


/**
 * TODO: document your custom view class.
 */
class CustomTabLayout : FrameLayout {
//FRAME LAYOUT ALLOWS FOR THE REDRAWN INDICATOR BUT NOT CONSTRAINT LAYOUT IDK WHY BUT LEAVE IT THERE !!!

    private lateinit var tabLayout: TabLayout
    private lateinit var indicator: CustomTabIndicatorLayout

    var selectedTabPosition: Int = 0
        get() = tabLayout.selectedTabPosition

    var tabCount: Int = 0
        get() = tabLayout.tabCount

    constructor(context: Context) : super(context) {
        init(null, 0)
    }

    constructor(context: Context, attrs: AttributeSet) : super(context, attrs) {
        init(attrs, 0)
    }

    constructor(context: Context, attrs: AttributeSet, defStyle: Int) : super(context, attrs, defStyle) {
        init(attrs, defStyle)
    }

    private fun init(attrs: AttributeSet?, defStyle: Int) {
        val inflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        inflater.inflate(R.layout.custom_tab_layout, this)

        tabLayout = findViewById<TabLayout>(R.id.tabLayout)
        indicator = findViewById<CustomTabIndicatorLayout>(R.id.indicator)
        val color = ResourcesCompat.getColor(resources, R.color.base_text_color, null)
        tabLayout.tabTextColors = ColorStateList.valueOf(color)
        indicator.setIndicatorColor(color)
        linkIndicator()
        setWillNotDraw(false)
    }

    private fun linkIndicator() {
        indicator.setTabTotalCount(tabLayout.tabCount)

        tabLayout.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabReselected(tab: TabLayout.Tab?) {

            }

            override fun onTabSelected(tab: TabLayout.Tab?) {
                indicator.setCurrentTabPosition(tabLayout.selectedTabPosition)
            }

            override fun onTabUnselected(tab: TabLayout.Tab?) {

            }
        })
    }

    fun addOnTabSelectedListener(listener: TabLayout.OnTabSelectedListener){
        tabLayout.addOnTabSelectedListener(listener)
    }

    fun setTabsList(tabs: Array<String>){
        tabLayout.removeAllTabs()
        tabs.forEach { s: String ->
            val tab = tabLayout.newTab()
            tab.text = s
            tabLayout.addTab(tab)
        }
        indicator.setTabTotalCount(tabs.size)
    }

    fun selectTab(index: Int){
        tabLayout.selectTab(tabLayout.getTabAt(index))
    }

    fun setColorTheme(color: Int){
        tabLayout.tabTextColors = ColorStateList.valueOf(color)
        indicator.setIndicatorColor(color)
        invalidate()
    }

    fun setIndicatorHeight(height: Int){
        indicator.setCurrentIndicatorHeight(height)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)


    }
}