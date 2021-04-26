package com.example.FaisMoiUnDessin.Tutorial

import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.adapter.FragmentStateAdapter
import com.example.FaisMoiUnDessin.R

class TutorialPagerAdapter : FragmentStateAdapter {

    var itemsCountTotal: Int = 0
    var currentFragment: Fragment? = null

    var list: MutableList<Fragment> = mutableListOf()
    lateinit var firstFragmentInfo: List<String>

    constructor(activity: FragmentActivity, itemsCount: Int): super(activity) {
        this.itemsCountTotal = itemsCount
    }

    override fun createFragment(position: Int): Fragment {

        //currentFragment = PictureFragment(R.drawable.tutorial_placeholder)
        currentFragment = when(position) {
            0 -> PictureFragment(R.drawable.tuto_draw_1)
            1 -> PictureFragment(R.drawable.tuto_draw_2)
            2 -> PictureFragment(R.drawable.tuto_draw_3)
            3 -> PictureFragment(R.drawable.tuto_classic)
            4 -> PictureFragment(R.drawable.tuto_ffa)
            else -> PictureFragment(R.drawable.tuto_draw_1) //Should never happen, but whatever
        }
        list.add(currentFragment!!)

        return currentFragment!!
    }

    fun getFragment(index: Int): Fragment {
        return list[index]
    }

    override fun getItemCount(): Int {
        return itemsCountTotal
    }
}