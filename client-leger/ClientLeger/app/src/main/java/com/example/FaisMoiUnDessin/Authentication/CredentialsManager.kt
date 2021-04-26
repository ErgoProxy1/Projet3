package com.example.FaisMoiUnDessin.Authentication

import android.util.Log
import android.view.View
import android.widget.EditText
import com.example.FaisMoiUnDessin.Constants
import com.example.FaisMoiUnDessin.LittleHelpers.TextValidator
import com.example.FaisMoiUnDessin.Data.UserInfo
import com.example.FaisMoiUnDessin.Singletons
import com.google.android.gms.tasks.Task
import com.google.firebase.Timestamp
import com.google.firebase.firestore.QuerySnapshot
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.firestore.ktx.toObject
import com.google.firebase.ktx.Firebase
import io.socket.client.Socket

class CredentialsManager(socket: Socket) {
    var socket: Socket = socket
    var firebaseDB = Firebase.firestore
    lateinit var mUsernameInput: EditText
    lateinit var mPasswordInput: EditText
    lateinit var mFirstNameInput: EditText
    lateinit var mLastNameInput: EditText
    var lastConnection =  Timestamp.now()
    private lateinit var userData: Any
    /*lateinit*/var userInfo: UserInfo /*Attempt to get the compiler to stop bitching about the lateinit*/ = UserInfo("","","","")
    var registering = false

    fun setInputFields(mUsernameInput: EditText, mPasswordInput: EditText, mFirstNameInput:EditText? = null, mLastNameInput:EditText? = null) {
        this.mUsernameInput = mUsernameInput
        this.mPasswordInput = mPasswordInput
        if (mFirstNameInput != null && mLastNameInput != null) {
            this.registering = true
            this.mFirstNameInput = mFirstNameInput
            this.mLastNameInput = mLastNameInput
        } else {this.registering = false}
    }

    fun recordLogin() {
        this.lastConnection = Timestamp.now()
    }

    fun login() {
        if(!this.inputIsValid()) return
        val username = this.mUsernameInput.text.toString()
        val password = this.mPasswordInput.text.toString()
        Log.d("CredentialsManager","Logging user in")
        this.queryUser(username,password).addOnSuccessListener { result ->
                if (result.documents.size>0) {
                    this.userInfo = result.documents[0].toObject<UserInfo>()!!
                    Singletons.uid = result.documents[0].id
                    Singletons.socket.emit("request-login",username)

                } else {
                    TextValidator.displayError(this.mUsernameInput, "Mauvais mot de pass ou nom d'utilisateur")
                }
            }
            .addOnFailureListener {}
    }

    fun register(viewTrigger: View) {
        if(!this.inputIsValid()) return
        val username = this.mUsernameInput.text.toString()
        val password = this.mPasswordInput.text.toString()
        this.queryUser(username,password).addOnSuccessListener { result ->
            if (result.documents.size>0) {
                this.userInfo = result.documents[0].toObject<UserInfo>()!!
                TextValidator.displayError(this.mUsernameInput, "Ce nom d'utilisateur est déja pris!")
            } else {
                this.saveUserData()
                this.registerUser()
            }
        }.addOnFailureListener {
            viewTrigger.isClickable = true
        }
    }

    fun saveUserData() {
        this.userData = hashMapOf(
                "avatar" to "",
                "connections" to arrayListOf<Timestamp>(),
                "disconnections" to arrayListOf<Timestamp>(),
                "firstName" to this.mFirstNameInput.text.toString(),
                "lastName" to this.mLastNameInput.text.toString(),
                "username" to this.mUsernameInput.text.toString(),
                "password" to this.mPasswordInput.text.toString(),
                "games" to arrayListOf<String>(),
                "gamesPlayed" to 0L,
                "gamesWon" to 0L,
                "totalPlayTime" to 0L
        )
        this.userInfo = UserInfo(this.mUsernameInput.text.toString(), this.mFirstNameInput.text.toString(), this.mLastNameInput.text.toString())
    }

    fun registerUser() {
        firebaseDB.collection("users").add(this.userData).addOnSuccessListener { result ->
            Singletons.uid = result.id
            Singletons.socket.emit("request-login",this.userInfo.username)
        }
    }

    private fun inputIsValid(): Boolean {
        var optionalInputsReadable = this::mFirstNameInput.isInitialized  && this::mLastNameInput.isInitialized
        if(optionalInputsReadable) optionalInputsReadable = optionalInputsReadable && (this.mFirstNameInput !=null) && (this.mLastNameInput !=null) && registering
        if(optionalInputsReadable){
            if(!TextValidator.textFieldIsValidName(this.mFirstNameInput, "prénom")) return false
            if(!TextValidator.textFieldIsValidName(this.mLastNameInput, "nom de famille")) return false
        }
        if(!TextValidator.textFieldIsValidName(this.mUsernameInput, "nom d'utilisateur", Constants.MAX_USERNAME_LENGTH)) return false
        if(!this.passwordIsValid()) return false
        return true
    }



    private fun queryUser(username: String,password: String): Task<QuerySnapshot> {
        return this.firebaseDB.collection("users").whereEqualTo("username", username).whereEqualTo("password",password).get()// TODO restore password verification
    }



    private fun passwordIsValid(): Boolean {
        if(this.mPasswordInput.text.toString() == "") {
            TextValidator.displayError(this.mPasswordInput, "Votre mot de passe ne doit pas etre vide")
            return false
        }
        return true
    }
}