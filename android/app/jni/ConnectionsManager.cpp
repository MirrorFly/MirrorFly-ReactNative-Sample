//
// Created by user on 20/09/23.
//

#ifdef ANDROID
#include <jni.h>
JavaVM *javaVm = nullptr;
jclass jclass_ByteBuffer = nullptr;
jmethodID jclass_ByteBuffer_allocateDirect = nullptr;
#endif

