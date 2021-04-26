package com.example.FaisMoiUnDessin.Drawing

import android.graphics.Paint
import android.graphics.PointF
import com.example.FaisMoiUnDessin.Constants
import com.example.FaisMoiUnDessin.Singletons
import org.json.JSONArray
import org.json.JSONObject


class Stroke {

    var points: ArrayList<PointF> = ArrayList()
    var strokeWidth: Float = 0f;
    var color: Int = 0;
    var oldColor: Int = 0;

    constructor(paint: Paint) {
        this.strokeWidth = paint.strokeWidth
        this.color = paint.color
    }

    constructor(color: Int, oldColor: Int) {
        this.color = color
        this.oldColor = oldColor
    }

    constructor(jsonPath: JSONObject){

        this.color = jsonToColor(jsonPath.getJSONObject("strokeColor"))
        this.strokeWidth = jsonPath.getDouble("strokeWidth").toFloat() * hPXtoDPratio
        setPointListFromJSON(jsonPath.getJSONArray("points"))
    }

    companion object{
        var hDPtoPXratio = 1/1.5f
        var vDPtoPXratio = 1/1.5f
        var hPXtoDPratio = 1.5f
        var vPXtoDPratio = 1.5f

        fun getArrayToJson(list: ArrayList<Stroke>) : String {
            var temp = "{ \"primitives\":["

            for (stroke: Stroke in list){
                temp += stroke.toJson(false) + ","
            }
            if(list.size > 0) temp = temp.dropLast(1) //removes last ","
            temp += "], \"gameId\":${Singletons.gameId}}"

            return temp
        }

        fun jsonToColor(jsonColor: JSONObject): Int {

            val a = (jsonColor.getDouble("a")*255).toInt() shl 24
            val r = jsonColor.getInt("r") shl 16
            val g = jsonColor.getInt("g") shl 8
            val b = jsonColor.getInt("b")

            return a or r or g or b
        }

        fun colorToJson(color: Int, withGameId: Boolean = false): String {
            if(withGameId){
                return "{" +
                            "\"color\":{" +
                                "\"a\": ${((color and 0xFF000000.toInt()) ushr 24)/255f}, " +
                                "\"r\": ${(color and 0x00FF0000.toInt()) ushr 16}, " +
                                "\"g\": ${(color and 0x0000FF00.toInt()) ushr 8}," +
                                "\"b\": ${(color and 0x000000FF.toInt()) ushr 0}" +
                            "}," +
                            "\"gameId\":${Singletons.gameId}" +
                        "}"
            }

            return "{" +
                    "\"a\": ${((color and 0xFF000000.toInt()) ushr 24)/255f}, " +
                    "\"r\": ${(color and 0x00FF0000.toInt()) ushr 16}, " +
                    "\"g\": ${(color and 0x0000FF00.toInt()) ushr 8}," +
                    "\"b\": ${(color and 0x000000FF.toInt()) ushr 0}" +
                    "}"
        }
    }

    fun setPointListFromJSON(jsonPoints: JSONArray) {
        points.clear()

        var x: Float
        var y: Float

        for (i in 0 until jsonPoints.length()){
            x = jsonPoints.getJSONObject(i).getDouble("x").toFloat()
            y = jsonPoints.getJSONObject(i).getDouble("y").toFloat()
            points.add(PointF(x*hPXtoDPratio , y*vPXtoDPratio))
        }
    }

    fun addPoint(point: PointF){
        points.add(point)
    }

    fun commandSvgPoints(): String{
        if(points.size <= 0) return ""

        var fullString: String = "M${points[0].x * hDPtoPXratio} ${points[0].y * vDPtoPXratio} "

        for (i in 1 until points.size){
            fullString += "L${points[i].x * hDPtoPXratio} ${points[i].y * vDPtoPXratio} "
        }
        return fullString
    }

    fun stringifyPointsArray(): String{
        if(points.size <= 0) return "[]"

        var fullString: String = "["

        for (i in 0 until points.size){
            fullString += "{\"x\" : ${points[i].x * hDPtoPXratio} , \"y\" : ${points[i].y * vDPtoPXratio} },"
        }
        fullString = fullString.dropLast(1) //removes the last ","
        fullString += "]"
        return fullString
    }

    fun colorToJson(color: Int): String {
        return "{" +
                "\"a\": ${((color and 0xFF000000.toInt()) ushr 24)/255f}, " +
                "\"r\": ${(color and 0x00FF0000.toInt()) ushr 16}, " +
                "\"g\": ${(color and 0x0000FF00.toInt()) ushr 8}," +
                "\"b\": ${(color and 0x000000FF.toInt()) ushr 0}" +
                "}"
    }

    fun toJson(isSinglePath: Boolean = true): String {
        if(!isSinglePath){
            return "{" +
                        "\"commandSvg\": \"${commandSvgPoints()}\", " +
                        "\"points\": ${stringifyPointsArray()}, " +
                        "\"strokeWidth\": ${strokeWidth * hDPtoPXratio}, " +
                        "\"strokeColor\": ${colorToJson(color)}" +
                    "}"
        }
        return "{" +
                    "\"path\":{"+
                        "\"commandSvg\": \"${commandSvgPoints()}\", " +
                        "\"points\": ${stringifyPointsArray()}, " +
                        "\"strokeWidth\": ${strokeWidth * hDPtoPXratio}, " +
                        "\"strokeColor\": ${colorToJson(color)}" +
                    "}," +
                    "\"gameId\":${Singletons.gameId}" +
                "}"

    }




}