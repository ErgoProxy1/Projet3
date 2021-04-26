package com.example.FaisMoiUnDessin.Profile

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.drawable.Drawable
import android.text.TextPaint
import android.util.AttributeSet
import android.view.View
import android.widget.FrameLayout
import androidx.core.content.res.ResourcesCompat
import com.example.FaisMoiUnDessin.R
import kotlin.math.max

/**
 * TODO: document your custom view class.
 */
class CustomTabIndicatorLayout : FrameLayout {

    var tabCount: Int = 1
    var tabPosition: Int = 0
    var indicatorHeight: Int = 5
    var color: Int = ResourcesCompat.getColor(resources, R.color.base_text_color, null)
    var indicatorPaint: Paint = Paint()

    constructor(context: Context) : super(context) {
        init(null, 0)
    }

    constructor(context: Context, attrs: AttributeSet) : super(context, attrs) {
        init(attrs, 0)
    }

    constructor(context: Context, attrs: AttributeSet, defStyle: Int) : super(
        context,
        attrs,
        defStyle
    ) {
        init(attrs, defStyle)
    }

    private fun init(attrs: AttributeSet?, defStyle: Int) {
        setWillNotDraw(false)
    }

    fun setTabTotalCount(tabCount: Int) {
        this.tabCount = tabCount
        invalidate()
    }

    fun setCurrentTabPosition(tabPosition: Int) {
        this.tabPosition = tabPosition
        invalidate()
    }

    fun setCurrentIndicatorHeight(height: Int){
        this.indicatorHeight = max(0, height)
        invalidate()
    }

    fun setIndicatorColor(color: Int){
        this.color = color
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        //tabCount = 3 //debug

        indicatorPaint.color = color
        val indicatorLength = width/tabCount.toFloat()

        val x = tabPosition*indicatorLength

        canvas!!.drawRect(x, height-indicatorHeight.toFloat(), x+indicatorLength, height.toFloat(), indicatorPaint)

    }
}