package com.mirrorfly_rn.newfilecompression.helper;

import android.graphics.drawable.Animatable;
import android.graphics.drawable.BitmapDrawable;
import android.os.Build;

public class AnimatedFileDrawable extends BitmapDrawable implements Animatable {

    private static native void videoprocess(int sdkVersion, String src, int[] params);

    public final static int PARAM_NUM_SUPPORTED_VIDEO_CODEC = 0;
    public final static int PARAM_NUM_WIDTH = 1;
    public final static int PARAM_NUM_HEIGHT = 2;
    public final static int PARAM_NUM_BITRATE = 3;
    public final static int PARAM_NUM_DURATION = 4;
    public final static int PARAM_NUM_AUDIO_FRAME_SIZE = 5;
    public final static int PARAM_NUM_VIDEO_FRAME_SIZE = 6;
    public final static int PARAM_NUM_FRAMERATE = 7;
    public final static int PARAM_NUM_ROTATION = 8;
    public final static int PARAM_NUM_SUPPORTED_AUDIO_CODEC = 9;
    public final static int PARAM_NUM_HAS_AUDIO = 10;
    public final static int PARAM_NUM_COUNT = 11;

    public static void getVideoInfo(String src, int[] params) {
        videoprocess(Build.VERSION.SDK_INT, src, params);
    }

    @Override
    public void start() {
      // No Need
    }

    @Override
    public void stop() {
      // No Need
    }

    @Override
    public boolean isRunning() {
        return false;
    }
}

