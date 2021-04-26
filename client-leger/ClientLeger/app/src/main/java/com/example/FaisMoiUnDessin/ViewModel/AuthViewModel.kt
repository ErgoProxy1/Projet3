package com.example.FaisMoiUnDessin.ViewModel
import android.view.View
import androidx.lifecycle.ViewModel
import com.example.FaisMoiUnDessin.Data.UserInfo


class AuthViewModel: ViewModel() {
    var userInfo = UserInfo()

    fun onLoginClicked(view: View){
        if(this.userInfo.username.isNullOrEmpty()||this.userInfo.password.isNullOrEmpty()){
            // TODO display error message
            return
        }

    }

}