package com.example.chatprototype

import com.example.chatprototype.R
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.drawable.Drawable
import android.os.Build
import android.text.Layout
import android.text.TextPaint
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.LinearLayout
import androidx.annotation.RequiresApi
import androidx.constraintlayout.widget.ConstraintLayout


/**
 * TODO: document your custom view class.
 */
class ChatView : ConstraintLayout {

    private var _exampleString: String? = "ExampleString" // TODO: use a default from R.string...
    private var _exampleColor: Int = Color.RED // TODO: use a default from R.color...
    private var _exampleDimension: Float = 0f // TODO: use a default from R.dimen...

    private lateinit var textPaint: TextPaint
    private var textWidth: Float = 0f
    private var textHeight: Float = 0f

    /**
     * The text to draw
     */
    var exampleString: String?
        get() = _exampleString
        set(value) {
            _exampleString = value
            invalidateTextPaintAndMeasurements()
        }

    /**
     * The font color
     */
    var exampleColor: Int
        get() = _exampleColor
        set(value) {
            _exampleColor = value
            invalidateTextPaintAndMeasurements()
        }

    /**
     * In the example view, this dimension is the font size.
     */
    var exampleDimension: Float
        get() = _exampleDimension
        set(value) {
            _exampleDimension = value
            invalidateTextPaintAndMeasurements()
        }

    /**
     * In the example view, this drawable is drawn above the text.
     */
    var exampleDrawable: Drawable? = null

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    constructor(context: Context) : super(context) {
        init(null, 0)
    }

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    constructor(context: Context, attrs: AttributeSet) : super(context, attrs) {
        init(attrs, 0)
    }

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    constructor(context: Context, attrs: AttributeSet, defStyle: Int) : super(
        context,
        attrs,
        defStyle
    ) {
        init(attrs, defStyle)
    }

    private var mView: View? = null
    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    private fun init(attrs: AttributeSet?, defStyle: Int) {
        // Load attributes
        val a = context.obtainStyledAttributes(
            attrs, R.styleable.ChatView, defStyle, 0
        )
        _exampleString = a.getString(
            R.styleable.ChatView_exampleString
        )
        _exampleColor = a.getColor(
            R.styleable.ChatView_exampleColor,
            exampleColor
        )
        // Use getDimensionPixelSize or getDimensionPixelOffset when dealing with
        // values that should fall on pixel boundaries.
        _exampleDimension = a.getDimension(
            R.styleable.ChatView_exampleDimension,
            exampleDimension
        )

        if (a.hasValue(R.styleable.ChatView_exampleDrawable)) {
            exampleDrawable = a.getDrawable(
                R.styleable.ChatView_exampleDrawable
            )
            exampleDrawable?.callback = this
        }

        a.recycle()

        // Set up a default TextPaint object
        textPaint = TextPaint().apply {
            flags = Paint.ANTI_ALIAS_FLAG
            textAlign = Paint.Align.LEFT
        }

        //invalidateTextPaintAndMeasurements() //Might have to put it back later
        val inflater: LayoutInflater
        inflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        mView = inflater.inflate(R.layout.sample_chat_view, this)
    }

    private fun invalidateTextPaintAndMeasurements() {
        textPaint.let {
            it.textSize = exampleDimension
            it.color = exampleColor
            textWidth = it.measureText(exampleString!!)
            textHeight = it.fontMetrics.bottom
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        // TODO: consider storing these as member variables to reduce
        // allocations per draw cycle.
        val paddingLeft = paddingLeft
        val paddingTop = paddingTop
        val paddingRight = paddingRight
        val paddingBottom = paddingBottom

        val contentWidth = width - paddingLeft - paddingRight
        val contentHeight = height - paddingTop - paddingBottom

        exampleString?.let {
            // Draw the text.
            canvas.drawText(
                it,
                paddingLeft + (contentWidth - textWidth) / 2,
                paddingTop + (contentHeight + textHeight) / 2,
                textPaint
            )
        }

        // Draw the example drawable on top of the text.
        exampleDrawable?.let {
            it.setBounds(
                paddingLeft, paddingTop,
                paddingLeft + contentWidth, paddingTop + contentHeight
            )
            it.draw(canvas)
        }
    }


    // CHAT STUFF STARTING HERE -----------------------------

    lateinit var  receivedParams: LinearLayout.LayoutParams
    lateinit var  sentParams: LinearLayout.LayoutParams
    lateinit var listLayout: LinearLayout
    lateinit var username: String

    var lastMessage: String = ""
    var lastMessageUser: String = ""
    var lastMessageTime: String = ""
/*
    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        setupChat()
    }

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    private fun setupChat() {
        receivedParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )
        receivedParams.gravity = Gravity.BOTTOM or Gravity.FILL_VERTICAL

        sentParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )
        sentParams.gravity = Gravity.BOTTOM or Gravity.FILL_VERTICAL

        listLayout = findViewById<LinearLayout>(R.id.message_list)
        listLayout.removeAllViews()


        username = (this.context as Activity).intent.getStringExtra("username")!!
        var textViewUsername = findViewById<TextView>(R.id.textViewUsername7)
        textViewUsername.text = username

        LoginActivity.socket.on("message-broadcast"){ parameters ->
            var message: JSONObject = JSONObject(parameters[0].toString())
            Log.d("Time", message.getString("date"))
            var time: String = formatTime(message.getString("date"))
            receiveMessage(message.getString("text"), message.getString("username"), time)
        }

        setupEvents()
    }



    fun formatTime(timeToFormat: String): String {
        var time = timeToFormat.removeSuffix("Z")
        time = time.substringAfter("T").substringBefore(".")
        return time
    }

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    private fun setupEvents(){

        var button = findViewById<Button>(R.id.button_send7)
        button.setOnClickListener(View.OnClickListener {

            var message: String = findViewById<TextView>(R.id.text_field).text.toString()
            if (messageIsValid(message)) {
                addMessage(message, username, formatTime(LocalDateTime.now().toString()),true)
                sendMessage(message, username)
            }
            findViewById<TextView>(R.id.text_field).text = ""
        })

    }

    private fun messageIsValid(message: String): Boolean {
        var mMessage = findViewById<TextView>(R.id.text_field)
        Log.d("received message",message)
        if (message.trim() == "") {
            mMessage.error = "Votre message ne doit pas etre vide"
            return false
        }
        val MAX_MESSAGE_LENGTH = 200;
        if (message.length > MAX_MESSAGE_LENGTH) {
            mMessage.error = "Votre message ne doit pas dépasser les ${MAX_MESSAGE_LENGTH} caracteres"
            return false
        }
        return true
    }

    private fun sendMessage(message: String, sender: String){
        var date = LocalDateTime.now()
        var metaMessage = JSONObject("{\"username\": \"${sender}\"," +
                "\"date\": \"${date}\"," +
                "\"text\": \"${message}\"," +
                "\"channel_name\": \"${"All"}\"}")
        LoginActivity.socket.emit("message",metaMessage.toString())
    }

    private fun receiveMessage(message: String, sender: String, time: String){
        lastMessage = message
        lastMessageUser = sender
        lastMessageTime = time
        (this.context as Activity).runOnUiThread(messageThread)
    }

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    var messageThread: Thread = Thread() {
        addMessage(lastMessage, lastMessageUser, lastMessageTime, false)
    }

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    private fun addMessage(message: String, sender: String, time: String, isSender: Boolean){
        var text : TextView = TextView((this.context as Activity))
        text.layoutParams = if(isSender) sentParams else receivedParams
        text.layoutParams.width = ViewGroup.LayoutParams.WRAP_CONTENT

        var layout : LinearLayout = LinearLayout((this.context as Activity))
        layout.setBackgroundColor(0)
        //layout.gravity = if(isSender) Gravity.RIGHT else Gravity.LEFT

        text.setBackgroundColor(ContextCompat.getColor((this.context as Activity), R.color.deep_grey))


        if(isSender) {
            text.setText("À ${time}\n${message}")
            layout.gravity = Gravity.RIGHT

            //val currentTime: Date = Calendar.getInstance().getTime()
            //println(currentTime.toString())
        }
        else {
            text.setText("${sender} à ${time} : \n${message}")
            layout.gravity = Gravity.LEFT

        }

        text.textAlignment = TextView.TEXT_ALIGNMENT_GRAVITY
        text.gravity = if(isSender) Gravity.RIGHT else Gravity.LEFT

        layout.addView(text)
        listLayout.addView(layout)
    }

    fun logout(view: View){
        LoginActivity.socket.emit("manual-disconnect")
        (this.context as Activity).finish()
    }
*/
}