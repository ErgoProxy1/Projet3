package com.example.FaisMoiUnDessin.Profile

import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.adapter.FragmentStateAdapter

class ProfilePagerAdapter : FragmentStateAdapter {

    var itemsCountTotal: Int = 0
    var currentFragment: Fragment? = null

    var list: MutableList<Fragment> = mutableListOf()
    lateinit var firstFragmentInfo: List<String>

    constructor(activity: FragmentActivity, itemsCount: Int): super(activity) {
        this.itemsCountTotal = itemsCount
    }

    override fun createFragment(position: Int): Fragment {

        currentFragment = when(position){
            0 -> StatisticsFragment()
            1 -> GamesListFragment()
            2 -> ConnectionHistoricFragment()
            3 -> DisconnectionHistoricFragment()
            else -> StatisticsFragment()
        }

        list.add(currentFragment!!)

        return currentFragment!!
    }

    fun getFragment(index: Int): Fragment{
        return list[index]
    }

    override fun getItemCount(): Int {
        return itemsCountTotal
    }

}