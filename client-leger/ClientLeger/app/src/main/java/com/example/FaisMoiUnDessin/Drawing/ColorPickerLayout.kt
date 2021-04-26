package com.example.FaisMoiUnDessin.Drawing

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.drawable.ShapeDrawable
import android.graphics.drawable.shapes.OvalShape
import android.util.AttributeSet
import android.util.Log
import android.view.View
import android.widget.FrameLayout
import androidx.core.content.res.ResourcesCompat
import androidx.core.graphics.get
import androidx.core.graphics.set
import com.example.FaisMoiUnDessin.R
import kotlin.math.*

class ColorPickerLayout : FrameLayout {

    private var isDrawn: Boolean = false
    private var bitmap: Bitmap? = null

    private var bitmapPaint: Paint = Paint()
    private var center: Int = 0
    private var radius: Int = 0
    private var selectedColor: Int = 0xFF000000.toInt()

    private var saturation: Float = 1f

    private var selectorSize: Int = 20
    private var selector: OvalShape = OvalShape()
    private var selectorOutline: OvalShape = OvalShape()
    private var selectorDrawable: ShapeDrawable = ShapeDrawable(selector)
    private var selectorOutlineDrawable: ShapeDrawable = ShapeDrawable(selectorOutline)

    private val INV_60 = 1f/60

    companion object { //Garanti l'existence de dimensions valide lors d'une re-création du colorpicker
        private var calculatedWidth: Int = 0
        private var calculatedHeight: Int = 0
        private var selectedX: Int = 0
        private var selectedY: Int = 0
        private var hsvHolder: Array<Array<FloatArray>>? = null
        private var rgbHolder: IntArray? = null
    }


    constructor(context: Context) : super(context, null, 0) {
        init()
    }

    constructor(context: Context, attrs: AttributeSet) : super(context, attrs, 0) {
        init()
    }

    constructor(context: Context, attrs: AttributeSet, defStyleAttr: Int) : super(
        context,
        attrs,
        defStyleAttr
    ) {
        init()
    }

    private fun init(){
        isDrawn = false
        calculatedWidth = 0
        calculatedHeight = 0
        selectedX = 0
        selectedY = 0
        hsvHolder = null
        rgbHolder = null

        selectorDrawable.paint.color = 0xFFFFFFFF.toInt()
        selectorOutlineDrawable.paint.color = 0xFF000000.toInt()
        bitmapPaint.isAntiAlias = true
        bitmapPaint.isFilterBitmap = true
        setLayerType(View.LAYER_TYPE_SOFTWARE, bitmapPaint)
        invalidate()
    }

    fun updateSaturation(saturation: Float) {
        this.saturation = max(min(saturation, 1f), 0f)
        updateColorWheel()
        invalidate()
    }

    fun getCurrentColor(): Int {
        if(selectedX == 0 && selectedY == 0){
            selectedX = center
            selectedY = center
        }
        return getColor(selectedX, selectedY)
    }

    fun getColor(x: Int, y: Int) : Int {
        var x1 = x-center
        var y1 = y-center

        if((x1*x1+y1*y1) < radius*radius) {
            selectedColor = bitmap!![x, y]
            selectedX = x
            selectedY = y
        }
        else{
            var ratio = sqrt((x1 * x1 + y1 * y1).toDouble()) / sqrt((radius * radius).toDouble())
            ratio+=0.03 //to account for rounding
            var x2 = x1/ratio + center
            var y2 = y1/ratio + center
            selectedColor = bitmap!![x2.toInt(), y2.toInt()]
            selectedX = x2.toInt()
            selectedY = y2.toInt()
        }

        return selectedColor
    }

    fun updateColorWheel() {
        if(calculatedWidth == 0 && calculatedHeight == 0){
            calculatedWidth = this.layoutParams.width //width
            calculatedHeight = this.layoutParams.height //height
        }

        var t0 = System.nanoTime() //Performance check

        var maxSize = min(calculatedWidth, calculatedHeight)
        var currentHsv: FloatArray

        for (i in 0 until maxSize){
            for(j in 0 until maxSize){
                currentHsv = hsvHolder!![i][j]
                currentHsv[1] = saturation

                rgbHolder!![i*maxSize + j] = fastHSLtoRBG(currentHsv)
            }
        }

        bitmap = Bitmap.createBitmap(rgbHolder!! ,maxSize, maxSize, Bitmap.Config.ARGB_8888)

        var t1 = System.nanoTime()
        Log.d("ColorPickerRenderTime", ((t1 - t0)/1000000).toString() + "ms") //Performance check
        Log.d("ColorPickerRenderTime", "Over")
    }

    private fun fastHSLtoRBG(hsva: FloatArray) : Int {
        //0 = H , 1 = S, 2 = V, 3 = A
        val H = hsva[0]
        val C = hsva[1]*hsva[2]*255
        val X = C * (1 - abs((H*INV_60)%2 - 1))
        val m = hsva[2]*255 - C

        val mult1: Int = (0 <= H && H < 60).compareTo(false)
        val mult2: Int = (60 <= H && H < 120).compareTo(false)
        val mult3: Int = (120 <= H && H < 180).compareTo(false)
        val mult4: Int = (180 <= H && H < 240).compareTo(false)
        val mult5: Int = (240 <= H && H < 300).compareTo(false)
        val mult6: Int = (300 <= H && H <= 360).compareTo(false)

        val r: Float = C*(mult1+mult6) + X*(mult2+mult5)
        val g: Float = C*(mult2+mult3) + X*(mult1+mult4)
        val b: Float = C*(mult4+mult5) + X*(mult3+mult6)

        val R = (r+m).toInt()
        val G = (g+m).toInt()
        val B = (b+m).toInt()
        val A = (hsva[3]*255).toInt()

        return (A shl 24) or (R shl 16) or (G shl 8) or B
    }

    private fun fastHSLtoRBG2(hsva: FloatArray) : Int {
        //0 = H , 1 = S, 2 = V, 3 = A
        val H = hsva[0]
        val S = hsva[1]
        val V = hsva[2]
        val A = hsva[3]

        return ((A*255).toInt() shl (24)) or
                ((f(H,S,V,5)*255).toInt() shl 16) or
                ((f(H,S,V,3)*255).toInt() shl 8) or
                (f(H,S,V,1)*255).toInt()

    }
    // For use in fastHSLtoRBG2()
    private inline fun f(h: Float, s: Float, v: Float, n :Int): Float{
        val k: Float = k(h,n)
        return (v-v*s*max(0f, minOf(k,4f-k, 1f)))
    }
    // For use in fastHSLtoRBG2()
    private inline fun k(h: Float, n :Int): Float{
        return (n+h*INV_60)%6
    }

    fun setupColorWheel() {
        if(calculatedWidth == 0 && calculatedHeight == 0){
            calculatedWidth = this.layoutParams.width //width
            calculatedHeight = this.layoutParams.height //height
        }

        var t0 = System.nanoTime() //Performance check

        var maxSize = min(calculatedWidth, calculatedHeight)
        var borderZone = 4f
        //var maxSize = 1000 //debug ONLYYYYYYY
        //var borderZone = 40f //debug ONLYYYYYYY
        center = maxSize/2
        radius = center-borderZone.toInt()
        var radiusInv: Float = 1f/radius
        if(bitmap == null) {
            bitmap = Bitmap.createBitmap(maxSize, maxSize, Bitmap.Config.ARGB_8888)
        }

        var centerD: Float = maxSize.toFloat()/2

        rgbHolder = IntArray(maxSize*maxSize)
        hsvHolder = Array<Array<FloatArray>>(maxSize) {i ->
            Array<FloatArray>(maxSize) { j ->
                FloatArray(4)
            }
        }
        for (i in 0 until maxSize){
            for(j in 0 until maxSize){

                var x = i-centerD
                var y = j-centerD

                val v: Float = sqrt(x*x+y*y)*radiusInv

                if(v<1){
                    var hue: Double = (atan2(y, x)+PI)*360/(2*PI)
                    var hsv = FloatArray(4)
                    hsv[0] = hue.toFloat()  //hue
                    hsv[1] = saturation     //saturation
                    hsv[2] = v              //value
                    hsv[3] = 1f             //alpha

                    hsvHolder!![i][j] = hsv
                }
                else if (v <= (radius+borderZone)/radius) {    //provides some aliasing on the perimeter
                    var hue: Double = (atan2(y, x)+PI)*360/(2*PI)
                    var hsv = FloatArray(4)
                    hsv[0] = hue.toFloat()
                    hsv[1] = saturation
                    hsv[2] = 1f
                    hsv[3] = (max(radius + borderZone - v * radius,0f) / borderZone).pow(2f)

                    hsvHolder!![i][j] = hsv
                }
            }
        }

        var t1 = System.nanoTime()
        Log.d("ColorPickerRenderTime", ((t1 - t0)/1000000).toString() + "ms")

        updateColorWheel()
    }

    override fun onDraw(canvas: Canvas?) {
        super.onDraw(canvas)

        if(!isDrawn) {
            setupColorWheel()
            isDrawn = true
        }

        if(selectedX == 0){
            selectedX = center
            selectedY = center
            selectorSize = center/10
        }

        canvas!!.drawBitmap(bitmap!!, 0F, 0F, bitmapPaint)

        selectorOutlineDrawable.setBounds(
            selectedX - selectorSize / 2 - 4,
            selectedY - selectorSize / 2 - 4,
            selectedX + selectorSize / 2 + 4,
            selectedY + selectorSize / 2 + 4
        )
        selectorDrawable.setBounds(
            selectedX - selectorSize / 2,
            selectedY - selectorSize / 2,
            selectedX + selectorSize / 2,
            selectedY + selectorSize / 2
        )
        selectorOutlineDrawable.draw(canvas!!)
        selectorDrawable.draw(canvas!!)

        //////////////
    }
}