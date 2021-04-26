package com.example.FaisMoiUnDessin.Drawing

import android.app.Activity
import android.app.AlertDialog
import android.content.DialogInterface
import android.content.Intent
import android.content.res.ColorStateList
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.Drawable
import android.media.MediaPlayer
import android.os.Build
import android.os.Bundle
import android.view.*
import android.view.inputmethod.InputMethodManager
import android.widget.*
import androidx.annotation.RequiresApi
import androidx.fragment.app.Fragment
import com.example.FaisMoiUnDessin.Enums.GameMode
import com.example.FaisMoiUnDessin.LittleHelpers.DialogPopup
import com.example.FaisMoiUnDessin.LittleHelpers.WordSelectionDialogFragment
import com.example.FaisMoiUnDessin.MainMenu.MainMenuActivity
import com.example.FaisMoiUnDessin.R
import com.example.FaisMoiUnDessin.Singletons
import io.socket.emitter.Emitter
import org.json.JSONArray
import org.json.JSONObject


/**
 * A simple [Fragment] subclass.
 * Use the [CanvasFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class CanvasFragment : Fragment() {
    lateinit var canvasLayout: CanvasLayout
    lateinit var pencilButton: Button
    lateinit var eraserButton: Button
    lateinit var guessButton: Button
    lateinit var undoButton: Button
    lateinit var redoButton: Button
    lateinit var hintButton: Button
    lateinit var backgroundSetterButton : Button

    lateinit var toolIndicator: Drawable
    lateinit var correctSound: MediaPlayer
    lateinit var incorrectSound: MediaPlayer
    lateinit var clockTickSound: MediaPlayer
    lateinit var timerOverSound: MediaPlayer
    lateinit var applauseSound: MediaPlayer
    lateinit var gaspSound: MediaPlayer
    lateinit var wowSound: MediaPlayer

    @Volatile var isInRelaunch: Boolean = false

    var buttonColor: Int = 0
    var deactivatedButtonColor: Int = 0
    var hintIndex: Int = 0

    lateinit var fragmentView: View

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        fragmentView = inflater.inflate(R.layout.fragment_canvas, container, false)
        return fragmentView
    }

    @RequiresApi(Build.VERSION_CODES.M)
    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)

    }

    @RequiresApi(Build.VERSION_CODES.M)
    override fun onStart() {
        super.onStart()
        setupSounds()
        setupInterface()
        setupSocket()
        setDrawingState(false)
        setGuessingState(false)
        Singletons.socket.emit("ready-to-start", "${Singletons.gameId}")
    }

    private fun setupSounds(){
        correctSound = MediaPlayer.create(this.requireContext(),R.raw.correct)
        incorrectSound = MediaPlayer.create(this.requireContext(),R.raw.incorrect)
        clockTickSound = MediaPlayer.create(this.requireContext(),R.raw.clock_single_tick_1)
        timerOverSound = MediaPlayer.create(this.requireContext(),R.raw.timer_over)
        applauseSound = MediaPlayer.create(this.requireContext(),R.raw.applause)
        gaspSound = MediaPlayer.create(this.requireContext(),R.raw.crowd_gasp)
        wowSound = MediaPlayer.create(this.requireContext(),R.raw.crowd_wow)
    }

    @RequiresApi(Build.VERSION_CODES.M)
    fun setDrawingState(isDrawingBlocked: Boolean){
        canvasLayout.setLockedDrawing(isDrawingBlocked)
        setButtonActivation(pencilButton, !isDrawingBlocked)
        setButtonActivation(eraserButton, !isDrawingBlocked)
        setButtonActivation(backgroundSetterButton, !isDrawingBlocked)
        setButtonActivation(undoButton, !isDrawingBlocked && canvasLayout.canUndo())
        setButtonActivation(redoButton, !isDrawingBlocked && canvasLayout.canRedo())

        (requireContext() as Activity).runOnUiThread{
            pencilButton.foreground = if(!isDrawingBlocked && canvasLayout.model.getCurrentTool == CanvasModel.Tool.PENCIL) toolIndicator else null
            eraserButton.foreground = if(!isDrawingBlocked && canvasLayout.model.getCurrentTool == CanvasModel.Tool.ERASER) toolIndicator else null
        }

    }

    private fun setButtonActivation(button: Button, activated: Boolean) {
        val color: Int = if(activated) buttonColor else deactivatedButtonColor

        button.isClickable = activated
        (requireContext() as Activity).runOnUiThread{
            button.backgroundTintList = ColorStateList.valueOf(color)
        }
    }

    private fun setGuessingState(isGuessAllowed: Boolean) {
        guessButton.isClickable = isGuessAllowed
        val color: Int = if(!isGuessAllowed) deactivatedButtonColor else buttonColor

        (requireContext() as Activity).runOnUiThread{
            guessButton.backgroundTintList = ColorStateList.valueOf(color)
        }
    }

    fun updateUndoRedoButtons() {
        setButtonActivation(undoButton, canvasLayout.canUndo())
        setButtonActivation(redoButton, canvasLayout.canRedo())
    }

    @RequiresApi(Build.VERSION_CODES.M)
    private fun setupInterface(){

        canvasLayout = requireView().findViewById<CanvasLayout>(R.id.canvasLayout)
        var strokeSizeBar: SeekBar = requireView().findViewById<SeekBar>(R.id.seekBarWidth)
        var strokeAlphaBar: SeekBar = requireView().findViewById<SeekBar>(R.id.seekBarAlpha)
        var saturationBar: SeekBar = requireView().findViewById<SeekBar>(R.id.seekBarSaturation)
        var colorPicker: ColorPickerLayout = requireView().findViewById<ColorPickerLayout>(R.id.colorPickerLayout)
        var colorDisplayAlpha: FrameLayout = requireView().findViewById<FrameLayout>(R.id.colorDisplayAlpha)
        var colorDisplayNoAlpha: FrameLayout = requireView().findViewById<FrameLayout>(R.id.colorDisplayNoAlpha)

        pencilButton = requireView().findViewById<Button>(R.id.buttonPencil)
        eraserButton = requireView().findViewById<Button>(R.id.buttonEraser)
        guessButton = requireView().findViewById<Button>(R.id.guessButton)
        undoButton = requireView().findViewById<Button>(R.id.buttonUndo)
        redoButton = requireView().findViewById<Button>(R.id.buttonRedo)
        hintButton = requireView().findViewById<Button>(R.id.buttonHint)
        backgroundSetterButton = requireView().findViewById<Button>(R.id.buttonSetBackground)


        strokeAlphaBar.progress = strokeAlphaBar.max
        strokeSizeBar.progress = strokeSizeBar.max/2
        saturationBar.progress = saturationBar.max
        colorPicker.setupColorWheel()
        colorPicker.updateSaturation(saturationBar.progress.toFloat() / saturationBar.max)
        canvasLayout.setupModel(
            strokeSizeBar.progress,
            colorPicker.getCurrentColor(),
            strokeAlphaBar.progress
        )

        colorDisplayAlpha.foreground = ColorDrawable(canvasLayout.model.getPencilColor())
        colorDisplayNoAlpha.setBackgroundColor(canvasLayout.model.getPencilColor() or 0xFF000000.toInt())

        toolIndicator = Drawable.createFromXml(
            resources,
            resources.getXml(R.drawable.selected_border)
        )     //fake warning, it works
        buttonColor = resources.getColor(R.color.button_color, null)
        deactivatedButtonColor = resources.getColor(R.color.deactivated_button_color, null)

        //Pencil Button
        pencilButton.setOnClickListener { v: View? ->
            pencilButton.foreground = toolIndicator
            eraserButton.foreground = null
            canvasLayout.selectPencil()
        }

        //EraserButton
        eraserButton.setOnClickListener { v: View? ->
            eraserButton.foreground = toolIndicator
            pencilButton.foreground = null
            canvasLayout.selectEraser()
        }

        //GuessButton
        guessButton.setOnClickListener { v: View? ->
            setGuessingState(false)
            sendAttempt()
        }

        //UndoButton
        undoButton.setOnClickListener{ v: View? ->
            canvasLayout.undo()
            updateUndoRedoButtons()
        }

        //RedoButton
        redoButton.setOnClickListener { v: View? ->
            canvasLayout.redo()
            updateUndoRedoButtons()
        }

        //GridButton
        requireView().findViewById<Button>(R.id.buttonGrid).setOnClickListener { v: View? ->
            canvasLayout.toggleGrid()
        }

        //HintButton
        hintButton.setOnClickListener { v: View? ->
            if(Singletons.hintList.size > hintIndex){
                DialogPopup.showDialog(this.requireContext(), "Indice","Indice #${hintIndex+1} : ${Singletons.hintList[hintIndex]}")
                ++hintIndex
            } else {
                Toast.makeText(this.context, "Vous avez consulté tous les indices disponibles", Toast.LENGTH_SHORT).show()
            }
        }

        backgroundSetterButton.setOnClickListener(View.OnClickListener() { v: View? ->
            canvasLayout.updateBackgroundColor()
            updateUndoRedoButtons()
        })

        //ColorWheel
        colorPicker.setOnTouchListener(View.OnTouchListener() { v: View?, m: MotionEvent ->
            var selectedColor: Int = colorPicker.getColor(m.x.toInt(), m.y.toInt())
            canvasLayout.setPencilColor(selectedColor)

            colorDisplayNoAlpha.setBackgroundColor(selectedColor)
            colorDisplayAlpha.foreground = ColorDrawable(canvasLayout.model.getPencilColor())

            colorPicker.invalidate()

            true
        })

        saturationBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                colorPicker.updateSaturation(progress.toFloat() / saturationBar.max)
                var color = colorPicker.getCurrentColor()
                canvasLayout.setPencilColor(color)

                colorDisplayAlpha.foreground = ColorDrawable(canvasLayout.model.getPencilColor())
                colorDisplayNoAlpha.setBackgroundColor(color)
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}

            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        //Stroke Size Bar
        strokeSizeBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            var currentProgress: Int = strokeSizeBar.progress

            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                currentProgress = progress
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}

            override fun onStopTrackingTouch(seekBar: SeekBar?) {
                canvasLayout.setStrokeSize(currentProgress.toFloat())
            }
        })

        //Alpha Bar
        strokeAlphaBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            var currentAlpha: Int = strokeAlphaBar.progress

            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                currentAlpha = progress


                colorDisplayAlpha.foreground.alpha = currentAlpha
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}

            override fun onStopTrackingTouch(seekBar: SeekBar?) {
                canvasLayout.setPencilAlpha(currentAlpha)
            }
        })
    }

    private fun getPairs(json: String) : Array<String> {
        val pairs = JSONObject(json).getJSONArray("pairs")
        var array: Array<String> = Array<String>(pairs.length()){pairs.getJSONObject(it).getString("word")}

        return array
    }

    private fun sendAttempt(){
        val textField = requireView().findViewById<EditText>(R.id.guessTextView)
        val attempt: String = textField.text.toString().trim()
        textField.setText("")
        if(attempt.isEmpty()) return

        val jsonAttempt: String = "{\"gameId\":\"${Singletons.gameId}\", \"word\":\"${attempt}\"}"
        Singletons.socket.emit("attemptWord", jsonAttempt)
    }

    private fun chooseWordToDraw(word: String, hints: Array<String>){
        val json: String =
                "{\"gameId\": \"${Singletons.gameId}\"," +
                        "\"word\": \"${word}\"," +
                        "\"hints\": [${hints.joinToString("\",\"", "\"", "\"")}]}"

        Singletons.socket.emit("chooseWord", json)
    }

    @RequiresApi(Build.VERSION_CODES.M)
    private fun setupSocket(){
        var timerText =  requireView().findViewById<TextView>(R.id.textViewTimer)
        Singletons.socket.on("wordSuggestions"){
            hideKeyboard()
            val json = it[0] as String
            if(JSONObject(json).getString("user").compareTo(Singletons.username) != 0) return@on
            val array: Array<String> = getPairs(json)
            (requireContext() as Activity).runOnUiThread {

                WordSelectionDialogFragment.newInstance(array,object:WordSelectionDialogFragment.SelectionListener{
                    override fun onSelection(index: Int) {
                        val chosenIndex: Int = index

                        val jsonHints = JSONObject(json).getJSONArray("pairs").getJSONObject(
                            chosenIndex
                        ).getJSONArray("hints")
                        var hints: Array<String> = Array(jsonHints.length()) { hintIndex: Int ->
                            jsonHints.getString(hintIndex)
                        }
                        chooseWordToDraw(array[chosenIndex], hints)

                        (requireContext() as Activity).apply {
                            var infoText = this.findViewById<TextView>(R.id.currentGameInfoText)
                            infoText.text =
                                "C'est ton tour\nLe mot à dessiner est \"${array[chosenIndex]}\""
                        }
                    }
                }).show(parentFragmentManager, null)
                /*
                DialogPopup.showDialogChoice(
                    requireContext(),
                    "Choix de mot",
                    array,
                    DialogInterface.OnClickListener { dialogInterface: DialogInterface, i: Int ->
                        val lw: ListView = (dialogInterface as AlertDialog).listView
                        val chosenIndex: Int = lw.checkedItemPosition

                        val jsonHints = JSONObject(json).getJSONArray("pairs").getJSONObject(
                            chosenIndex
                        ).getJSONArray("hints")
                        var hints: Array<String> = Array(jsonHints.length()) { hintIndex: Int ->
                            jsonHints.getString(hintIndex)
                        }
                        chooseWordToDraw(array[chosenIndex], hints)

                        (requireContext() as Activity).apply {
                            var infoText = this.findViewById<TextView>(R.id.currentGameInfoText)
                            infoText.text =
                                "C'est ton tour\nLe mot à dessiner est \"${array[chosenIndex]}\""
                        }

                    })

                 */
            }

        }.on("receiveClockTime") {
            if(this.context == null) return@on
            val time: Int = (it[0] as String).toInt()
            (this.requireContext() as Activity).runOnUiThread {
                if(time in 1 until 10 && !isInRelaunch) clockTickSound.start()
                if(time == 0) timerOverSound.start()
                //timerText.text = "${time/60}:${time%60}"
                timerText.text = "${time}s"
            }
        }.on("receive-start-draw", Emitter.Listener {
            //Log.d("CheckUnicityOfEmits", "Ok")
            val json: String = (it[0] as String)
            canvasLayout.model.receiveStroke(json, true)
            canvasLayout.invalidate()
        }).on("receive-update-draw", Emitter.Listener {
            val json: String = (it[0] as String)
            canvasLayout.model.receiveStroke(json, false)
            canvasLayout.invalidate()
        }).on("receive-finish-draw", Emitter.Listener {
            val json: String = (it[0] as String)
            canvasLayout.model.receiveStroke(json, false)
            canvasLayout.invalidate()
        }).on("receive-redraw-canvas", Emitter.Listener {
            val json: String = (it[0] as String)
            canvasLayout.model.receiveFullDrawing(json)
            canvasLayout.invalidate()
        }).on("receive-update-background", Emitter.Listener {
            val jsonColorString: String = (it[0] as String)
            val colorString = JSONObject(jsonColorString).getString("color")
            val jsonColorObject = JSONObject(colorString)
            val newBackgroundColor: Int = Stroke.jsonToColor(jsonColorObject)
            canvasLayout.setBackgroundColor(newBackgroundColor)
            canvasLayout.invalidate()
        }).on("nextDrawing", Emitter.Listener {
            isInRelaunch = false
            hideKeyboard()
            val json: String = (it[0] as String)
            val obj: JSONObject = JSONObject(json)
            val playingUser: String = obj.getString("userPlaying")
            val isDrawingBlocked: Boolean = playingUser.compareTo(Singletons.username) != 0
            var isGuessAllowed = false
            Singletons.gameManager.detailedGameInfo.value.teams.forEach {
                isGuessAllowed =
                    isGuessAllowed || (it.users.contains(Singletons.username) && it.users.contains(
                        playingUser
                    ) && isDrawingBlocked)
            }
            isGuessAllowed = when(Singletons.gameMode){
                GameMode.CLASSIC.ordinal -> isGuessAllowed && isDrawingBlocked
                GameMode.FREE_FOR_ALL.ordinal -> !isGuessAllowed && isDrawingBlocked
                else -> false //Should never happen, but whatever
            }
            setGuessingState(isGuessAllowed)
            setDrawingState(isDrawingBlocked)

            if (isDrawingBlocked) {   //if it's not your turn to draw
                (requireContext() as Activity).apply {
                    this.runOnUiThread {
                        var infoText = this.findViewById<TextView>(R.id.currentGameInfoText)
                        infoText.text = "$playingUser dessine\n"
                        infoText.text =
                            infoText.text.toString() + if (isGuessAllowed) "À toi de deviner" else ""
                    }
                }

            }

            canvasLayout.model.clearAllDrawings()
            canvasLayout.invalidate()
        }).on("roundEnd", Emitter.Listener {
            hideKeyboard()
            val round: String = (it[0] as String)
            (requireContext() as Activity).apply {
                this.runOnUiThread {
                    this.findViewById<TextView>(R.id.currentGameMessageText).text = "Ronde $round"
                }
            }
            canvasLayout.model.clearAllDrawings()
            canvasLayout.invalidate()
        }).on("endGame") {
            hideKeyboard()
            canvasLayout.model.clearAllDrawings()
            canvasLayout.invalidate()

            val json: String = (it[0] as String)
            val objWinners: JSONArray = JSONArray(json)
            var hasWon = false
            for (i in 0 until objWinners.length()) {
                hasWon = hasWon || objWinners.getString(i).compareTo(Singletons.username) == 0
            }

            if(hasWon) {
                applauseSound.start()
                wowSound.start()
            } else {
                gaspSound.start()
            }

            val result: String = if(hasWon) "Victoire !" else "Défaite !"

            (this.requireContext() as Activity).runOnUiThread {
                DialogPopup.showDialog(this.requireContext(), "Résultat", result) { dialogInterface: DialogInterface, i: Int ->
                    endGame()
                    Intent(this.requireContext(), MainMenuActivity::class.java).also {intent ->
                        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                        startActivity(intent)
                    }
                    (this.requireContext() as Activity).finish()
                }
            }
        }.on("removeAllPlayers") {
            endGame()
            (this.requireContext() as Activity).runOnUiThread {
                Intent(this.requireContext(), MainMenuActivity::class.java).also {
                    it.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    startActivity(it)
                }
                (this.requireContext() as Activity).finish()
            }
        }.on("relaunch") {
            if(it.isEmpty()) return@on
            isInRelaunch = true
            val json: String = (it[0] as String)
            val playersAllowedToReply = JSONObject(json).getJSONArray("users")
            var isAllowed = false
            for(i in 0 until playersAllowedToReply.length()){
                isAllowed = isAllowed || playersAllowedToReply.getString(i).compareTo(Singletons.username) == 0
            }

            (requireContext() as Activity).apply {
                this.runOnUiThread {
                    var infoText = this.findViewById<TextView>(R.id.currentGameInfoText)
                    if(isAllowed){
                        infoText.text = "Votre équipe a un droit de réplique\n" + "À toi de deviner"
                    }
                    else{
                        infoText.text = "Votre équipe n'a pas deviné à temps\n" + "L'équipe adverse a un droit de réplique"
                    }

                    setGuessingState(isAllowed)
                }
            }

        }.on("correctGuess") {
            correctSound.start()
            hideKeyboard()
        }.on("incorrectGuess") {
            incorrectSound.start()
            setGuessingState(true)
        }.on("drawingTurn") {
            val json: String = (it[0] as String)
            val jsonHints = JSONObject(json).getJSONArray("hints")
            Singletons.hintList = Array(jsonHints.length()) { index: Int -> jsonHints.getString(index) }
            hintIndex = 0
        }
    }

    private fun hideKeyboard() {
        (this.context as Activity).apply {
            val imm: InputMethodManager = this.getSystemService(Activity.INPUT_METHOD_SERVICE) as InputMethodManager
            //Find the currently focused view, so we can grab the correct window token from it.
            var view = this.currentFocus
            //If no view currently has focus, create a new one, just so we can grab a window token from it
            if (view == null) {
                view = View(activity)
            }
            imm.hideSoftInputFromWindow(view.windowToken, 0)
        }
    }

    fun unlinkSocket(){
        Singletons.socket.
        off("wordSuggestions").
        off("receive-start-draw").
        off("receive-update-draw").
        off("receive-finish-draw").
        off("receive-redraw-canvas").
        off("receive-update-background").
        off("nextDrawing").
        off("roundEnd").
        off("endGame").
        off("receiveClockTime").
        off("relaunch").
        off("removeAllPlayers").
        off("incorrectGuess").
        off("correctGuess").
        off("drawingTurn")
    }

    fun endGame(){
        unlinkSocket()

        val json: String = "{ \"gameId\": \"${Singletons.gameId}\", \"user\": \"${Singletons.username}\" }"
        Singletons.socket.emit("leaveTheGame", json)
        Singletons.isInGame = false
        canvasLayout.clearAllDrawings()
    }

    override fun onStop() {
        super.onStop()
        //endGame()
    }

}