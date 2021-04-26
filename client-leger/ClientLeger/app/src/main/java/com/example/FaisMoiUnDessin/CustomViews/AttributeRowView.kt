package com.example.FaisMoiUnDessin.CustomViews

import android.content.Context
import android.util.AttributeSet
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import com.example.FaisMoiUnDessin.R

class AttributeRowView(context: Context, attrs: AttributeSet) : ConstraintLayout(context, attrs) {
    var attrs = attrs
    var view: View
    var attName: TextView
    var attValue: TextView
    init {
        val inflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        this.view = inflater.inflate(R.layout.attribute_row,this,true)
        this.attName = view.findViewById(R.id.attribute_name)
        this.attValue = view.findViewById(R.id.attribute_value)
        this.setupAttributes()
    }

    fun setupAttributes() {
        val view = this.view
        var name = this.attName
        var value = this.attValue
        val styleArray = context.theme.obtainStyledAttributes(attrs, R.styleable.AttributeRowView,0,0).apply {
            try{
                val attName = getString(R.styleable.AttributeRowView_attributeName)
                name = view.findViewById<TextView>(R.id.attribute_name).apply{text = attName}
                val attVal = getString(R.styleable.AttributeRowView_attributeValue)
                value = view.findViewById<TextView>(R.id.attribute_value).apply{text = attVal}
            }
            finally {
                recycle()
            }
        }
    }
    fun setAttrValue(attrValue: String) {
        Log.d("AttributeRowView",">>> Val given: $attrValue")
        this.attValue.text = attrValue
    }
    fun setAttrName(attrName: String) {
        Log.d("AttributeRowView",">>> Val given: $attrName")
        this.attName.text = attrName
    }
    fun setAttrNameValue(attrName: String,attrValue: String) {
        setAttrName(attrName)
        setAttrValue(attrValue)
    }
}