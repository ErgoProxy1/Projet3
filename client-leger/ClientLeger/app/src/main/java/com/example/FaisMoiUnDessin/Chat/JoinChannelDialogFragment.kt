package com.example.FaisMoiUnDessin.Chat

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.DialogFragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.FaisMoiUnDessin.LittleHelpers.WordSelectionDialogFragment
import com.example.FaisMoiUnDessin.R
import io.reactivex.rxjava3.subjects.PublishSubject

class JoinChannelDialogFragment(val ctx: Context, val joinableChannels: List<ChatChannel>) : DialogFragment() {

    private val closeObservable: PublishSubject<Boolean> = PublishSubject.create<Boolean>()

    companion object {
        fun newInstance(ctx: Context, joinableChannels: List<ChatChannel>): JoinChannelDialogFragment {
            val fragment = JoinChannelDialogFragment(ctx, joinableChannels)
            val args = Bundle()

            fragment.isCancelable = true
            fragment.arguments = args
            return fragment
        }
    }

    override fun onCreateView(
            inflater: LayoutInflater, container: ViewGroup?,
            savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_channel_joining, container, false)
    }

    override fun onStart() {
        super.onStart()
        this.setupView()
    }

    private fun setupView() {
        this.closeObservable.subscribe { dismiss() }
        val recyclerView = requireView().findViewById<RecyclerView>(R.id.channel_joining_recycler_view)
        val givenAdapter = ChatChannelAdapter(joinableChannels,closeObservable)
        recyclerView.apply {
            layoutManager = LinearLayoutManager(ctx)
            adapter = givenAdapter
        }
    }
}