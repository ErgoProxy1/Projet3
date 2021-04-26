package com.example.FaisMoiUnDessin.Chat

import android.util.Log
import com.beust.klaxon.Converter
import com.beust.klaxon.JsonValue
import com.beust.klaxon.Klaxon
import com.example.FaisMoiUnDessin.Data.CustomServerTimeStamp
import com.example.FaisMoiUnDessin.Data.OurTimeStamp
import com.google.firebase.Timestamp
import org.json.JSONObject

data class ChatMessage @JvmOverloads constructor(
        val username: String = "",
        @OurTimeStamp
        var date: Timestamp = Timestamp.now(),
        val text: String = "",
        val channel_name: String = "",
        val gameId: String = "",
)
class CustomMessageConverter {
        companion object{
                val timeStampCustomConverter = object: Converter{
                        override fun canConvert(cls: Class<*>): Boolean = true//cls== ChatMessage::class.java
                        override fun fromJson(jv: JsonValue): Any? {
                                return try {
                                        Log.d("CustomMessageConverter","converting JsonValue==$jv")
                                        val jsonString = Klaxon().toJsonString(jv.obj)
                                        val specialTimeStamp = Klaxon().parse<CustomServerTimeStamp>(jsonString)
                                        Timestamp(specialTimeStamp!!.seconds,specialTimeStamp.nanoseconds)
                                } catch (e: Exception){
                                        Timestamp.now()
                                }
                        }

                        override fun toJson(value: Any): String {
                                return Klaxon().toJsonString(value)
                        }
                }
        }
}
