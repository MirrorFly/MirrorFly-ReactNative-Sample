//
// Created by user on 19/09/23.
//

#include <jni.h>

extern "C" JNIEXPORT jstring JNICALL
Java_com_example_nativeappvideocompression_MainActivity_stringFromJNI(JNIEnv* env, jobject /* this */) {
    return env->NewStringUTF("Hello from native code!");
}

