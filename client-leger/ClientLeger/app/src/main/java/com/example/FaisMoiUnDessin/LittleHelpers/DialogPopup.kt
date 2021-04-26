package com.example.FaisMoiUnDessin.LittleHelpers

import android.app.AlertDialog
import android.content.Context
import android.content.DialogInterface
import com.example.FaisMoiUnDessin.R

class DialogPopup {
    companion object{
        fun showDialog(context: Context, title: String, message: String, listener: DialogInterface.OnClickListener? = null) {
            AlertDialog.Builder(context, R.style.TextAppearance_DialogLightText).
            setTitle(title).
            setMessage(message).
            setPositiveButton("OK", listener).
            setCancelable(false).
            show()
        }

        fun showYesNoDialog(context: Context, title: String, message: String, yesListener: DialogInterface.OnClickListener? = null, noListener: DialogInterface.OnClickListener? = null) {
            AlertDialog.Builder(context, R.style.TextAppearance_DialogLightText).
            setTitle(title).
            setMessage(message).
            setPositiveButton("Oui", yesListener).
            setNegativeButton("Non", noListener).
            setCancelable(false).
            show()
        }

        fun showDialogChoice(context: Context, title: String, choices: Array<String>, listener: DialogInterface.OnClickListener,positiveTxt:String = "Continuer") {
            AlertDialog.Builder(context, R.style.TextAppearance_DialogLightText).
            setTitle(title).
            setSingleChoiceItems(choices,0, null).
            setPositiveButton(positiveTxt, listener).
            setCancelable(false).
            show()
        }
    }
}
