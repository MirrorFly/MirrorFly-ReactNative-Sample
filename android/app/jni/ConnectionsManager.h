//
// Created by user on 19/09/23.
//

#ifndef NATIVEAPPVIDEOCOMPRESSION_CONNECTIONSMANAGER_H
#define NATIVEAPPVIDEOCOMPRESSION_CONNECTIONSMANAGER_H

#ifdef ANDROID
#include <jni.h>
#endif

#ifdef ANDROID
extern JavaVM *javaVm;
extern jclass jclass_ByteBuffer;
extern jmethodID jclass_ByteBuffer_allocateDirect;
#endif

#endif
