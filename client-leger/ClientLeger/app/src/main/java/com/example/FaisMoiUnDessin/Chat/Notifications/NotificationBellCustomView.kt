package com.example.FaisMoiUnDessin.Chat.Notifications

import android.content.Context
import android.util.AttributeSet
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import com.example.FaisMoiUnDessin.R

class NotificationBellCustomView: ConstraintLayout {
    val view: View

    init {
        val inflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        this.view = inflater.inflate(R.layout.notification_bell_custom_view,this,true)

    }

    constructor(ctx: Context) : super(ctx) {
        Log.d("NotificationBell","constructor(ctx: Context)")
    }

    constructor(ctx: Context, attributeSet: AttributeSet) : super(ctx, attributeSet) {
        Log.d("NotificationBell","constructor(ctx: Context, attributeSet: AttributeSet)")
    }

    fun setMessageCount(count: Int) {
        this.view.findViewById<TextView>(R.id.notification_count).text = count.toString()
        this.flashNotification()
    }

    fun hide(){
        this.view.findViewById<View>(R.id.notification_bell_view).visibility = View.INVISIBLE
    }
    fun show() {
        this.view.findViewById<View>(R.id.notification_bell_view).visibility = View.VISIBLE
    }

    private fun flashNotification() {

    }

}