#include <jni.h>
#include "visionkitOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::visionkit::initialize(vm);
}
