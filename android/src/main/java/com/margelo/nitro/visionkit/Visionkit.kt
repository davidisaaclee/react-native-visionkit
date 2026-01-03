package com.margelo.nitro.visionkit
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class Visionkit : HybridVisionkitSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
