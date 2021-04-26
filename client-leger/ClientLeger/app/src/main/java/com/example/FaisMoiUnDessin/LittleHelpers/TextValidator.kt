package com.example.FaisMoiUnDessin.LittleHelpers

import android.widget.EditText
import android.widget.TextView

class TextValidator {
    companion object {
        fun textFieldIsValidName(uiField: EditText, fieldName:String, maxLength: Int = Int.MAX_VALUE): Boolean {
            val text = uiField.text.toString()
            if(!textFieldIsVisible(uiField, fieldName)){
                return false
            }
            if(text.first() == ' '){
                displayError(uiField, "Votre $fieldName ne peut pas commencer par un espace")
                return false
            }
            if(!textFieldIsShortEnough(uiField, fieldName, maxLength)) {
                return false
            }
            return true
        }

        fun textFieldIsValidMessage(uiField: TextView, fieldName:String, maxLength: Int = Int.MAX_VALUE): Boolean{
            if(!textFieldIsVisible(uiField, fieldName)){
                return false
            }
            if(!textFieldIsShortEnough(uiField, fieldName, maxLength)) {
                return false
            }
            return true
        }

        fun displayError(inputField: TextView,error: String) {
            inputField.error = error
        }

        fun textFieldIsShortEnough(uiField: TextView, fieldName:String, maxLength: Int = Int.MAX_VALUE): Boolean {
            val text = uiField.text.toString()
            if(text.length > maxLength){
                displayError(uiField, "Votre $fieldName doit faire moins de ${maxLength} caracteres")
                return false
            }
            return true
        }

        fun textFieldIsVisible(uiField: TextView, fieldName:String): Boolean {
            val text = uiField.text.toString()
            if(text.trim() == ""){
                displayError(uiField, "Votre $fieldName ne doit pas etre vide")
                return false
            }
            return true
        }
    }
}