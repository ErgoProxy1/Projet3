package com.example.FaisMoiUnDessin.Drawing

import android.content.Context
import android.graphics.*
import android.graphics.drawable.ShapeDrawable
import android.util.AttributeSet
import android.util.Log
import android.view.MotionEvent
import android.widget.FrameLayout
import androidx.fragment.app.findFragment
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import io.socket.emitter.Emitter
import org.json.JSONObject

class CanvasLayout : FrameLayout {
    //@Volatile lateinit var bitmap: Bitmap
    //lateinit var modCanvas: Canvas

    val model: CanvasModel
    get() = CanvasModel.getInstance()

    constructor(context: Context) : super(context, null, 0) {
        init()
    }

    constructor(context: Context, attrs: AttributeSet) : super(context, attrs, 0) {
        init()
    }

    constructor(context: Context, attrs: AttributeSet, defStyleAttr: Int) : super(context, attrs, defStyleAttr) {
        init()
    }

    fun init() {

    }

    fun setupModel(strokeSize: Int, strokeColor: Int, strokeAlpha: Int ) {
        model.setupCanvas(this.layoutParams.width, this.layoutParams.height, strokeSize, strokeColor, strokeAlpha)
    }

    fun setStrokeSize(size: Float) {
        model.setStrokeSize(size)
    }

    fun setPencilColor(color: Int) {
        model.setPencilColor(color)
    }

    fun setPencilAlpha(color: Int) {
        model.setPencilAlpha(color)
    }

    fun selectPencil() {
        model.selectPencil()
    }

    fun selectEraser() {
        model.selectEraser()
    }

    fun undo() {
        model.undo()
        invalidate()
    }

    fun redo() {
        model.redo()
        invalidate()
    }

    fun canUndo(): Boolean {
        return model.canUndo()
    }

    fun canRedo(): Boolean {
        return model.canRedo()
    }

    fun toggleGrid() {
        model.toggleGrid()
        invalidate()
    }

    fun clearAllDrawings() {
        model.clearAllDrawings()
    }

    fun updateBackgroundColor() {
        model.updateBackgroundColor(model.getPencilColor(), this)
    }

    fun setLockedDrawing(isBlocked: Boolean){
        model.isDrawingLocked = isBlocked
    }

    override fun onTouchEvent(event: MotionEvent?): Boolean {
        Log.d("Action", event!!.action.toString())
        if(model.isDrawingLocked) return true

        when(event!!.action){
            MotionEvent.ACTION_DOWN -> model.down(event!!.x, event!!.y)
            MotionEvent.ACTION_MOVE -> model.move(event!!.x, event!!.y)
            MotionEvent.ACTION_UP -> model.up(event!!.x, event!!.y)
        }

        findFragment<CanvasFragment>().updateUndoRedoButtons()

        invalidate()
        return true
    }

    override fun onDraw(canvas: Canvas?) {
        super.onDraw(canvas)

        synchronized(model.drawableShapes) {
            for (drawable: ShapeDrawable in model.drawableShapes) {
                drawable.draw(canvas!!)
            }
        }

        if(model.isGridOn()) model.getGrid().draw(canvas!!)
    }
}