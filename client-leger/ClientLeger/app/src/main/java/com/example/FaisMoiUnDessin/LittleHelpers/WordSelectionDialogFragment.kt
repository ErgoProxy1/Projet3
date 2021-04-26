package com.example.FaisMoiUnDessin.LittleHelpers

import android.content.DialogInterface
import android.content.res.ColorStateList
import android.os.Build
import android.os.Bundle
import android.os.CountDownTimer
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.annotation.RequiresApi
import androidx.compose.ui.res.colorResource
import androidx.fragment.app.DialogFragment
import com.example.FaisMoiUnDessin.R
import java.util.*

class WordSelectionDialogFragment : DialogFragment() {

    private val MAX_CHOOSE_TIME: Long = 10000

    private var currentIndex = 0
    private var currentTimeLeft = MAX_CHOOSE_TIME/1000
    private lateinit var choices : Array<String>
    private var listener: SelectionListener? = null

    interface SelectionListener {
        fun onSelection(index: Int)
    }

    lateinit var timer: CountDownTimer

    companion object {
        fun newInstance(choices: Array<String>, listener: SelectionListener? = null): WordSelectionDialogFragment{
            val fragment = WordSelectionDialogFragment()
            val args = Bundle()
            fragment.listener = listener
            fragment.choices = choices
            fragment.isCancelable = false
            fragment.arguments = args
            return fragment
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_word_selection_dialog, container, false)
    }

    @RequiresApi(Build.VERSION_CODES.M)
    override fun onStart() {
        super.onStart()
        requireView().findViewById<Button>(R.id.DialogSelectButton).setOnClickListener {
            dismiss()
        }
        requireView().findViewById<TextView>(R.id.DialogTimer).text = "${currentTimeLeft}s"

        setupRadioButtons()
        setupTimer()
        timer.start()
    }

    private fun setupTimer() {
        timer = object: CountDownTimer(MAX_CHOOSE_TIME, 1000){
            override fun onTick(millisUntilFinished: Long) {
                currentTimeLeft -= 1

                requireActivity().runOnUiThread{
                    requireView().findViewById<TextView>(R.id.DialogTimer).text = "${currentTimeLeft}s"
                }

            }

            override fun onFinish() {
                forceDismiss()
            }

        }
    }

    @RequiresApi(Build.VERSION_CODES.M)
    private fun setupRadioButtons() {
        val radioGroup = requireView().findViewById<RadioGroup>(R.id.DialogRadioGroup)
        choices.forEachIndexed { index, s ->
            val rdbtn = RadioButton(requireContext())
            rdbtn.id = View.generateViewId()
            rdbtn.text = s
            rdbtn.setTextColor(resources.getColor(R.color.white,null))
            rdbtn.setOnCheckedChangeListener(CompoundButton.OnCheckedChangeListener{ compoundButton: CompoundButton, b: Boolean ->
                if(b) currentIndex = index
            })
            rdbtn.isChecked = index == 0
            radioGroup.addView(rdbtn)
        }
    }

    private fun select(index: Int) {
        listener?.onSelection(index)
    }

    private fun forceDismiss(){
        this.dismiss()
    }

    override fun onDismiss(dialog: DialogInterface) {
        super.onDismiss(dialog)
        timer.cancel()
        select(currentIndex)
    }

}