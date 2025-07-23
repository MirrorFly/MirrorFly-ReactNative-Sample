cmake_minimum_required(VERSION 3.6.0)

set(CMAKE_CXX_FLAGS "-std=c++14 -DANDROID -g")
set(CMAKE_C_FLAGS "-w -std=c11 -DANDROID -D_LARGEFILE_SOURCE=1 -g")
set(CMAKE_ASM_FLAGS "${CFLAGS} -x assembler-with-cpp")
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -ffunction-sections -fdata-sections")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -ffunction-sections -fdata-sections")
set(CMAKE_SHARED_LINKER_FLAGS "${CMAKE_SHARED_LINKER_FLAGS} -Wl,-z,max-page-size=16384,--exclude-libs,${CMAKE_HOME_DIRECTORY}/ffmpeg/${ANDROID_ABI}/libswscale.a,
${CMAKE_HOME_DIRECTORY}/ffmpeg/${ANDROID_ABI}/libavformat.a,
${CMAKE_HOME_DIRECTORY}/ffmpeg/${ANDROID_ABI}/libavcodec.a,
${CMAKE_HOME_DIRECTORY}/ffmpeg/${ANDROID_ABI}/libavresample.a,
${CMAKE_HOME_DIRECTORY}/ffmpeg/${ANDROID_ABI}/libavutil.a,
${CMAKE_HOME_DIRECTORY}/ffmpeg/${ANDROID_ABI}/libswresample.a,
${CMAKE_HOME_DIRECTORY}/ffmpeg/${ANDROID_ABI}/libvpx.a")

if (${ANDROID_ABI} STREQUAL "armeabi-v7a" OR ${ANDROID_ABI} STREQUAL "arm64-v8a")
    enable_language(ASM)
else()
    enable_language(ASM_NASM)
endif()

add_library(avutil STATIC IMPORTED)
set_target_properties(avutil PROPERTIES IMPORTED_LOCATION ${CMAKE_HOME_DIRECTORY}/ffmpeg/${ANDROID_ABI}/libavutil.a)

add_library(avformat STATIC IMPORTED)
set_target_properties(avformat PROPERTIES IMPORTED_LOCATION ${CMAKE_HOME_DIRECTORY}/ffmpeg/${ANDROID_ABI}/libavformat.a)

add_library(avcodec STATIC IMPORTED)
set_target_properties(avcodec PROPERTIES IMPORTED_LOCATION ${CMAKE_HOME_DIRECTORY}/ffmpeg/${ANDROID_ABI}/libavcodec.a)

add_library(avresample STATIC IMPORTED)
set_target_properties(avresample PROPERTIES IMPORTED_LOCATION ${CMAKE_HOME_DIRECTORY}/ffmpeg/${ANDROID_ABI}/libavresample.a)

add_library(swresample STATIC IMPORTED)
set_target_properties(swresample PROPERTIES IMPORTED_LOCATION ${CMAKE_HOME_DIRECTORY}/ffmpeg/${ANDROID_ABI}/libswresample.a)

add_library(swscale STATIC IMPORTED)
set_target_properties(swscale PROPERTIES IMPORTED_LOCATION ${CMAKE_HOME_DIRECTORY}/ffmpeg/${ANDROID_ABI}/libswscale.a)

add_library(libvpx STATIC IMPORTED)
set_target_properties(libvpx PROPERTIES IMPORTED_LOCATION ${CMAKE_HOME_DIRECTORY}/ffmpeg/${ANDROID_ABI}/libvpx.a)


#breakpad
add_library(breakpad STATIC
        third_party/breakpad/src/client/linux/crash_generation/crash_generation_client.cc
        third_party/breakpad/src/client/linux/handler/exception_handler.cc
        third_party/breakpad/src/client/linux/handler/minidump_descriptor.cc
        third_party/breakpad/src/client/linux/log/log.cc
        third_party/breakpad/src/client/linux/dump_writer_common/thread_info.cc
        third_party/breakpad/src/client/linux/dump_writer_common/seccomp_unwinder.cc
        third_party/breakpad/src/client/linux/dump_writer_common/ucontext_reader.cc
        third_party/breakpad/src/client/linux/microdump_writer/microdump_writer.cc
        third_party/breakpad/src/client/linux/minidump_writer/linux_dumper.cc
        third_party/breakpad/src/client/linux/minidump_writer/linux_ptrace_dumper.cc
        third_party/breakpad/src/client/linux/minidump_writer/minidump_writer.cc
        third_party/breakpad/src/client/minidump_file_writer.cc
        third_party/breakpad/src/common/android/breakpad_getcontext.S
        third_party/breakpad/src/common/convert_UTF.c
        third_party/breakpad/src/common/md5.cc
        third_party/breakpad/src/common/string_conversion.cc
        third_party/breakpad/src/common/linux/elfutils.cc
        third_party/breakpad/src/common/linux/file_id.cc
        third_party/breakpad/src/common/linux/guid_creator.cc
        third_party/breakpad/src/common/linux/linux_libc_support.cc
        third_party/breakpad/src/common/linux/memory_mapped_file.cc
        third_party/breakpad/src/common/linux/safe_readlink.cc)
set_target_properties(breakpad PROPERTIES ANDROID_ARM_MODE arm)
set_property(SOURCE third_party/breakpad/src/common/android/breakpad_getcontext.S PROPERTY LANGUAGE C)
target_include_directories(breakpad PUBLIC
        third_party/breakpad/src/common/android/include
        third_party/breakpad/src)


set(NATIVE_LIB "mirror.46")

#tmessages
add_library(${NATIVE_LIB} SHARED
        native-lib.cpp
        filecompress-lib.cpp
        NativeLoader.cpp
        ConnectionsManager.cpp
        NativeByteBuffer.cpp
        BuffersStorage.cpp
        ByteArray.cpp
        FileLog.cpp)

target_compile_options(${NATIVE_LIB} PUBLIC
        -ffast-math -Os -funroll-loops -ffast-math -fno-strict-aliasing -fno-math-errno)

target_compile_definitions(${NATIVE_LIB} PUBLIC
        BSD=1 NULL=0 SOCKLEN_T=socklen_t ANDROID_NDK DISABLE_IMPORTGL AVOID_TABLES ANDROID_TILE_BASED_DECODE __STDC_CONSTANT_MACROS ANDROID_ARMV6_IDCT OPUS_BUILD FIXED_POINT USE_ALLOCA restrict= __EMX__ LOCALE_NOT_USED HAVE_LRINT HAVE_LRINTF)

if (${ANDROID_ABI} STREQUAL "armeabi-v7a")
    set_target_properties(${NATIVE_LIB} PROPERTIES
            ANDROID_ARM_NEON FALSE
            ANDROID_ARM_MODE arm)
    target_compile_definitions(${NATIVE_LIB} PUBLIC
            ANDROID_ARM_NEON=false)
    target_sources(${NATIVE_LIB} PRIVATE
            third_party/libyuv/source/compare_neon.cc
            third_party/libyuv/source/rotate_neon.cc
            third_party/libyuv/source/row_neon.cc
            third_party/libyuv/source/scale_neon.cc)
else()
    set_target_properties(${NATIVE_LIB} PROPERTIES
            ANDROID_ARM_NEON FALSE
            ANDROID_ARM_MODE arm)
endif()


target_sources(${NATIVE_LIB} PRIVATE
        third_party/libyuv/source/compare_common.cc
        third_party/libyuv/source/compare_gcc.cc
        third_party/libyuv/source/compare_neon64.cc
        third_party/libyuv/source/compare_win.cc
        third_party/libyuv/source/compare.cc
        third_party/libyuv/source/convert_argb.cc
        third_party/libyuv/source/convert_from_argb.cc
        third_party/libyuv/source/convert_from.cc
        third_party/libyuv/source/convert_jpeg.cc
        third_party/libyuv/source/convert_to_argb.cc
        third_party/libyuv/source/convert_to_i420.cc
        third_party/libyuv/source/convert.cc
        third_party/libyuv/source/cpu_id.cc
        third_party/libyuv/source/mjpeg_decoder.cc
        third_party/libyuv/source/mjpeg_validate.cc
        third_party/libyuv/source/planar_functions.cc
        third_party/libyuv/source/rotate_any.cc
        third_party/libyuv/source/rotate_argb.cc
        third_party/libyuv/source/rotate_common.cc
        third_party/libyuv/source/rotate_gcc.cc
        third_party/libyuv/source/rotate_neon64.cc
        third_party/libyuv/source/rotate_win.cc
        third_party/libyuv/source/rotate.cc
        third_party/libyuv/source/row_any.cc
        third_party/libyuv/source/row_common.cc
        third_party/libyuv/source/row_gcc.cc
        third_party/libyuv/source/row_neon64.cc
        third_party/libyuv/source/row_win.cc
        third_party/libyuv/source/scale_any.cc
        third_party/libyuv/source/scale_argb.cc
        third_party/libyuv/source/scale_common.cc
        third_party/libyuv/source/scale_gcc.cc
        third_party/libyuv/source/scale_neon64.cc
        third_party/libyuv/source/scale_win.cc
        third_party/libyuv/source/scale.cc
        third_party/libyuv/source/video_common.cc
        third_party/libyuv/source/scale_uv.cc
        third_party/libyuv/source/rotate_lsx.cc
        third_party/libyuv/source/row_lasx.cc
        third_party/libyuv/source/row_lsx.cc
        third_party/libyuv/source/scale_lsx.cc
        third_party/libyuv/source/scale_rgb.cc)

target_include_directories(${NATIVE_LIB} PUBLIC
        native-lib
        third_party/libyuv/include
        third_party/libsrtp/include
        ffmpeg/include)

target_link_libraries(${NATIVE_LIB}
        -Wl,--no-whole-archive
        avutil
        avformat
        avcodec
        avresample
        swresample
        libvpx
        swscale
        avformat
        avcodec
        avresample
        avutil
        log
        android
        breakpad)

include(AndroidNdkModules)
android_ndk_import_module_cpufeatures()


