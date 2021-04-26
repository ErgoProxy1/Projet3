package com.example.FaisMoiUnDessin.Drawing

import android.app.Activity
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PointF
import android.graphics.Rect
import android.graphics.drawable.ShapeDrawable
import android.graphics.drawable.shapes.PathShape
import android.util.Log
import androidx.core.graphics.minus
import androidx.core.graphics.plus
import androidx.fragment.app.findFragment
import com.example.FaisMoiUnDessin.Constants
import com.example.FaisMoiUnDessin.Singletons
import kotlinx.coroutines.sync.Semaphore
import org.json.JSONObject
import kotlin.math.*

class CanvasModel {
    enum class Tool {
        ERASER,
        PENCIL,
        BACKGROUND
    }

    class Action {
        private val tool : Tool
        private var stroke: Stroke
        private var pathDrawable: ShapeDrawable?
        private var index: Int
        private var canvas: CanvasLayout?

        companion object {
            var sema: Semaphore = Semaphore(1,CanvasModel.instance.intSemaphore)
        }

        constructor(tool: Tool, stroke: Stroke, pathDrawable: ShapeDrawable?, index: Int, canvas: CanvasLayout? = null) {
            this.tool = tool
            this.stroke = stroke
            this.pathDrawable = pathDrawable
            this.index = index
            this.canvas = canvas
        }

        fun doFirst(strokeList: ArrayList<Stroke>, drawList: ArrayList<ShapeDrawable>) {
            if(tool == Tool.PENCIL){
                strokeList.add(index, stroke)
                //sema.acquire()
                synchronized(drawList) {
                    pathDrawable?.let { drawList.add(index, it )}
                }

                //sema.release()
                Singletons.socket.emit("start-draw", stroke.toJson())
                return
            }

            if(tool == Tool.ERASER) {
                index = strokeList.indexOf(stroke)
                strokeList.remove(stroke)
                //sema.acquire()
                synchronized(drawList) {
                    drawList.removeAt(index)
                }

                //sema.release()
                Singletons.socket.emit("redraw-canvas", Stroke.getArrayToJson(strokeList))
                return
            }

            if(tool== Tool.BACKGROUND) {
                CanvasModel.getInstance().currentBackGroundColor = stroke.color
                (canvas?.findFragment<CanvasFragment>()?.context as Activity).let {
                    it.runOnUiThread{
                        canvas?.setBackgroundColor(stroke.color)
                    }
                }
                Singletons.socket.emit("update-background", Stroke.colorToJson(stroke.color,true))

            }
        }

        fun redo(strokeList: ArrayList<Stroke>, drawList: ArrayList<ShapeDrawable>) {
            if(tool == Tool.PENCIL){
                strokeList.add(index, stroke)
                //sema.acquire()
                synchronized(drawList) {
                    pathDrawable?.let { drawList.add(index, it )}
                }

                //sema.release()
                Singletons.socket.emit("redraw-canvas", Stroke.getArrayToJson(strokeList))
                return
            }

            if(tool == Tool.ERASER) {
                index = strokeList.indexOf(stroke)
                strokeList.remove(stroke)
                //sema.acquire()
                synchronized(drawList) {
                    drawList.removeAt(index)
                }

                //sema.release()
                Singletons.socket.emit("redraw-canvas", Stroke.getArrayToJson(strokeList))
            }

            if(tool== Tool.BACKGROUND) {
                CanvasModel.getInstance().currentBackGroundColor = stroke.color
                (canvas?.findFragment<CanvasFragment>()?.context as Activity).let {
                    it.runOnUiThread{
                        canvas?.setBackgroundColor(stroke.color)
                    }
                }
                Singletons.socket.emit("update-background", Stroke.colorToJson(stroke.color,true))
            }
        }

        fun undo(strokeList: ArrayList<Stroke>, drawList: ArrayList<ShapeDrawable>) {
            if(tool == Tool.PENCIL){
                index = strokeList.indexOf(stroke)
                strokeList.remove(stroke)
                //sema.acquire()
                synchronized(drawList) {
                    drawList.remove(pathDrawable)
                }

                //sema.release()
                Singletons.socket.emit("redraw-canvas", Stroke.getArrayToJson(strokeList))
                return
            }

            if(tool == Tool.ERASER) {
                strokeList.add(index, stroke)
                //sema.acquire()
                synchronized(drawList) {
                    pathDrawable?.let { drawList.add(index, it )}
                }

                //sema.release()
                Singletons.socket.emit("redraw-canvas", Stroke.getArrayToJson(strokeList))
                return
            }

            if(tool== Tool.BACKGROUND) {
                CanvasModel.getInstance().currentBackGroundColor = stroke.oldColor
                (canvas?.findFragment<CanvasFragment>()?.context as Activity).let {
                    it.runOnUiThread{
                        canvas?.setBackgroundColor(stroke.oldColor)
                    }
                }
                Singletons.socket.emit("update-background", Stroke.colorToJson(stroke.oldColor,true))
            }
        }

    }

    @Volatile var intSemaphore: Int = 1
    private lateinit var currentPath: Path
    private var oldX: Float = 0F
    private var oldY: Float = 0F

    var drawableShapes: ArrayList<ShapeDrawable> = ArrayList()
    private var strokeList: ArrayList<Stroke> = ArrayList()
    private var actionList: ArrayList<Action> = ArrayList()

    private var undoRedoIndex: Int = -1

    private var grid: ShapeDrawable = ShapeDrawable()

    private var isGridOn: Boolean = false
    fun isGridOn(): Boolean { return isGridOn }

    private val gridStep: Int = 50

    private val gridPaint:Paint = Paint()
    private val pencilPaint:Paint = Paint()

    private var currentTool : Tool = Tool.PENCIL
    var getCurrentTool: Tool = Tool.PENCIL
    get() = currentTool
    var currentBackGroundColor : Int = 0xFFFFFFFF.toInt()

    private var previewDeleteColor : Int = 0xFFFF0000.toInt()
    private var previewDeleteTrueColor : Int = 0
    private var previewDeleteIndex : Int = -1

    var width: Int = 0
    var height: Int = 0
    var hasHadFirstSetup = false
    @Volatile var isDrawingLocked = false

    companion object {
        private var instance: CanvasModel = CanvasModel()

        fun getInstance(): CanvasModel {
            return instance
        }
    }

    private constructor() {

    }

    fun setupCanvas(width: Int, height: Int, strokeSize: Int, strokeColor: Int, strokeAlpha: Int) {
        actionList.clear()
        drawableShapes.clear()
        currentBackGroundColor = 0xFFFFFFFF.toInt()
        currentPath = Path()
        oldX = 0F
        oldY= 0F

        this.width = width
        this.height = height

        setStrokeSize(strokeSize.toFloat())  //Used to setup the pencil
        setPencilColor(strokeColor)
        setPencilAlpha(strokeAlpha)

        Stroke.hDPtoPXratio = Constants.DRAWING_PIXEL_WIDTH/width.toFloat()
        Stroke.vDPtoPXratio = Constants.DRAWING_PIXEL_HEIGHT/height.toFloat()
        Stroke.hPXtoDPratio = width/Constants.DRAWING_PIXEL_WIDTH.toFloat()
        Stroke.vPXtoDPratio = height/Constants.DRAWING_PIXEL_HEIGHT.toFloat()

        if(!hasHadFirstSetup){
            createGrid()
            hasHadFirstSetup = true
        }
    }

    fun receiveStroke(json: String, isNewStroke: Boolean){
        val jsonObject = JSONObject(json)
        val jsonPath = if(jsonObject.has("path")) jsonObject.getJSONObject("path") else jsonObject

        if(!isNewStroke && strokeList.isNotEmpty()){
            strokeList.last().setPointListFromJSON(jsonPath.getJSONArray("points"))
            var newPath = Path()
            var pathShape = PathShape(newPath, width.toFloat(), height.toFloat())

            newPath.moveTo(strokeList.last().points[0].x, strokeList.last().points[0].y)
            for (point: PointF in strokeList.last().points){
                newPath.lineTo(point.x, point.y)
            }

            //Mettre à la fin de l'update pour éviter d'afficher un path vide sur le onDraw (car asynch)
            synchronized(drawableShapes) {
                drawableShapes.last().shape = pathShape
            }
            return
        }

        strokeList.add(Stroke(jsonPath))

        var paint = Paint()
        paint.color = strokeList.last().color
        paint.style = Paint.Style.STROKE
        paint.strokeWidth = strokeList.last().strokeWidth
        paint.strokeCap = Paint.Cap.ROUND
        paint.strokeJoin = Paint.Join.ROUND
        paint.isAntiAlias = true

        var newPath = Path()
        var newPathShape = PathShape(newPath, width.toFloat(), height.toFloat())
        var newDrawable = ShapeDrawable(newPathShape)
        newDrawable.bounds = Rect(0, 0, width, height)
        newDrawable.paint.set(paint)


        newPath.moveTo(strokeList.last().points[0].x, strokeList.last().points[0].y)
        for (point: PointF in strokeList.last().points){
            newPath.lineTo(point.x, point.y)
        }
        synchronized(drawableShapes) {
            drawableShapes.add(newDrawable)
        }

    }

    fun receiveFullDrawing(json: String) {
        undoRedoIndex = -1
        synchronized(drawableShapes) {
            drawableShapes.clear()
        }

        strokeList.clear()
        actionList.clear()

        val jsonPathList = JSONObject(json).getJSONArray("primitives")
        for (i in 0 until jsonPathList.length()){
            receiveStroke(jsonPathList.getString(i), true)
        }
    }

    fun updateBackgroundColor(newColor: Int, canvas: CanvasLayout?) {
        if(newColor == currentBackGroundColor) return
        clearTopOfActionList()

        var newStroke = Stroke(newColor, currentBackGroundColor)
        actionList.add(CanvasModel.Action(Tool.BACKGROUND, newStroke, null, strokeList.size, canvas))
        actionList.last().doFirst(strokeList, drawableShapes)
        undoRedoIndex++
    }

    fun setStrokeSize(size: Float) {
        pencilPaint.style = Paint.Style.STROKE
        pencilPaint.strokeWidth = size * Stroke.hPXtoDPratio
        pencilPaint.strokeCap = Paint.Cap.ROUND
        pencilPaint.strokeJoin = Paint.Join.ROUND
        pencilPaint.isAntiAlias = true
    }

    fun setPencilColor(color: Int) {
        pencilPaint.color = (pencilPaint.color and 0xFF000000.toInt()) or (color and 0x00FFFFFF.toInt())
    }

    fun getPencilColor(): Int {
        return pencilPaint.color
    }

    fun setPencilAlpha(alpha: Int) {
        pencilPaint.color = (pencilPaint.color and 0x00FFFFFF.toInt()) or ((alpha shl 24) and 0xFF000000.toInt())
    }

    fun toggleGrid() {
        isGridOn = !isGridOn
        createGrid()
    }

    fun getDrawables(): ArrayList<ShapeDrawable> {
        return drawableShapes
    }

    fun getGrid(): ShapeDrawable {
        return grid!!
    }

    fun clearAllDrawings() {
        undoRedoIndex = -1
        actionList.clear()
        strokeList.clear()
        synchronized(drawableShapes) {
            drawableShapes.clear()
        }
    }

    private fun createGrid() {

        gridPaint.style = Paint.Style.STROKE
        gridPaint.strokeWidth = 2F
        gridPaint.strokeCap = Paint.Cap.ROUND
        gridPaint.strokeJoin = Paint.Join.ROUND
        gridPaint.color = 0xFF000000.toInt()
        gridPaint.isAntiAlias = true

        var gridPath: Path = Path()
        var gridShape: PathShape = PathShape(gridPath, width.toFloat(), height.toFloat())
        grid = ShapeDrawable(gridShape)
        grid!!.paint.set(gridPaint)
        grid!!.bounds = Rect(0, 0, width, height)

        for (i in 0..width step gridStep) {
            gridPath.moveTo(i.toFloat(), 0F)
            gridPath.lineTo(i.toFloat(), height.toFloat())
        }

        for (i in 0..height step gridStep) {
            gridPath.moveTo(0F, i.toFloat())
            gridPath.lineTo(width.toFloat(), i.toFloat())
        }

    }

    fun undo() {
        if (undoRedoIndex >= 0) {
            actionList[undoRedoIndex].undo(strokeList, drawableShapes)
            undoRedoIndex = max(undoRedoIndex - 1, -1)
        }
    }

    fun redo() {
        if (undoRedoIndex < actionList.size-1) {
            undoRedoIndex = min(undoRedoIndex + 1, actionList.size - 1)
            actionList[undoRedoIndex].redo(strokeList, drawableShapes)
        }
    }

    fun canUndo(): Boolean {
        return undoRedoIndex > -1
    }

    fun canRedo(): Boolean {
        return undoRedoIndex < actionList.size-1
    }

    fun selectPencil() {
        currentTool = Tool.PENCIL
    }

    fun selectEraser() {
        currentTool = Tool.ERASER
    }

    fun down(x: Float, y: Float){
        oldX = x
        oldY = y



        if(currentTool == Tool.PENCIL) {
            startPath(x, y)
        }


        if(currentTool == Tool.ERASER)
            previewDelete(x, y)
    }

    private fun startPath(x: Float, y: Float) {
        clearTopOfActionList()

        currentPath = Path()
        currentPath.moveTo(x, y)
        currentPath.lineTo(x, y)

        var shape = PathShape(currentPath, width.toFloat(), height.toFloat())
        var drawable = ShapeDrawable(shape)
        drawable.bounds = Rect(0, 0, width, height)
        drawable.paint.set(pencilPaint)

        Log.d("Pos", "${x*Stroke.hDPtoPXratio}-${y*Stroke.vDPtoPXratio}")

        var newStroke = Stroke(pencilPaint)
        newStroke.addPoint(PointF(x, y))
        newStroke.addPoint(PointF(x, y))

        actionList.add(Action(currentTool, newStroke, drawable, strokeList.size))
        actionList.last().doFirst(strokeList, drawableShapes)
        undoRedoIndex++
    }

    private fun previewDelete(x: Float, y: Float) {
        val touchedIndex: Int = getTouchedStrokeIndex(x, y)

        if(previewDeleteIndex >= 0){
            synchronized(drawableShapes) {
                drawableShapes[previewDeleteIndex].paint.color = previewDeleteTrueColor
            }
        }

        if(touchedIndex >= 0){
            previewDeleteTrueColor = drawableShapes[touchedIndex].paint.color
            //drawables[touchedIndex].paint.color = 0xFFFFFFFF.toInt()-(drawables[touchedIndex].paint.color and 0x00FFFFFF) //Inverses the color
            synchronized(drawableShapes) {
                drawableShapes[touchedIndex].paint.color = previewDeleteColor
            }

            previewDeleteIndex = touchedIndex
        }
    }

    private fun deletePath(x: Float, y: Float){
        if (previewDeleteIndex >= 0) {
            synchronized(drawableShapes) {
                drawableShapes[previewDeleteIndex].paint.color = previewDeleteTrueColor
            }
        }
        previewDeleteIndex = -1

        val touchedIndex: Int = getTouchedStrokeIndex(x, y)
        if(touchedIndex >= 0){
            clearTopOfActionList()
            actionList.add(Action(Tool.ERASER, strokeList[touchedIndex], drawableShapes[touchedIndex], touchedIndex))
            actionList.last().doFirst(strokeList, drawableShapes)
            ++undoRedoIndex

            Singletons.socket.emit("redraw-canvas", Stroke.getArrayToJson(strokeList))
        }
    }

    private fun getTouchedStrokeIndex(x: Float, y: Float) : Int {
        var pos = PointF(x, y)
        var t0 = System.nanoTime() //Performance check

        var maxSquareDistance = 0f
        var currentPoints: ArrayList<PointF>

        for (i: Int in (0 until strokeList.size).reversed()) {
            maxSquareDistance = (strokeList[i].strokeWidth/2) * (strokeList[i].strokeWidth/2)
            currentPoints=strokeList[i].points
            for (j: Int in (1 until currentPoints.size)){
                if(getSquaredDistanceFromLine(pos, currentPoints[j - 1], currentPoints[j]) < maxSquareDistance){
                    return i
                }
            }
        }

        var t1 = System.nanoTime()

        //Performance check
        Log.d("EraseDetectTime", ((t1 - t0)).toString() + "ns")
        if(strokeList.size > 0) Log.d("Average1LineDetectTime", ((t1 - t0).toDouble() / strokeList[strokeList.size - 1].points.size).toString() + "ns")
        return -1
    }

    private fun getSquaredDistanceFromLine(point: PointF, linePoint1: PointF, linePoint2: PointF): Float {
        val line: PointF = linePoint2 - linePoint1
        val vect1: PointF = linePoint1 - point
        val vect2: PointF = linePoint2 - point

        val dot1 = vect1.x*line.x+vect1.y*line.y
        val dot2 = vect2.x*line.x+vect2.y*line.y

        if(dot1.sign == dot2.sign){   //projections
            val length1 = (vect1.x*vect1.x)+(vect1.y*vect1.y)
            val length2 = (vect2.x*vect2.x)+(vect2.y*vect2.y)
            val isVect1Bigger: Boolean = (length1 > length2)

            //Dodge needless if() statments (- because using same base boolean -> boolean.compareTo(true) = [0,-1])
            return length1*(isVect1Bigger.compareTo(false)) - length2*(isVect1Bigger.compareTo(true))
        }

        val projectionRatio = abs(dot1)/((line.x*line.x)+(line.y*line.y))
        val pointInter: PointF = linePoint1 + line*projectionRatio

        val dx = point.x - pointInter.x
        val dy = point.y - pointInter.y

        return dx*dx+dy*dy
    }

    fun move(x: Float, y: Float) {
        if(currentTool == Tool.ERASER){
            previewDelete(x, y)
            return
        }

        if(currentTool != Tool.PENCIL) return

        if((x-oldX).pow(2) + (y-oldY).pow(2) >= 1){
            currentPath.lineTo(x, y)
            strokeList.last().addPoint(PointF(x, y))
            oldX = x
            oldY = y
        }

        Singletons.socket.emit("update-draw", strokeList.last().toJson())
    }

    fun up(x: Float, y: Float) {
        if(currentTool == Tool.PENCIL) {
            currentPath = Path()
            Singletons.socket.emit("finish-draw", strokeList.last().toJson())
            return
        }

        if(currentTool == Tool.ERASER){
            deletePath(x, y)
        }

    }

    private fun clearTopOfActionList(){
        while(actionList.size > undoRedoIndex + 1){
            actionList.removeAt(undoRedoIndex + 1)
        }
    }
}

private operator fun PointF.times(value: Float): PointF {
    return PointF(this.x*value,this.y*value)
}
