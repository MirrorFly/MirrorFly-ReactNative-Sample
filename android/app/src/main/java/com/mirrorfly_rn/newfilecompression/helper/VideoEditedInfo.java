package com.mirrorfly_rn.newfilecompression.helper;


import com.mirrorfly_rn.newfilecompression.compressfile.MediaCompress;

import java.util.ArrayList;

public class VideoEditedInfo {

    public long startTime;
    public long endTime;
    public long avatarStartTime = -1;
    public float start;
    public float end;
    public int compressQuality;
    public int rotationValue;
    public int originalWidth;
    public int originalHeight;
    public int originalBitrate;
    public int resultWidth;
    public int resultHeight;
    public int bitrate;
    public int framerate = 24;
    public String originalPath;
    public long estimatedSize;
    public long estimatedDuration;
    public boolean roundVideo;
    public boolean muted;
    public long originalDuration;
    public byte[] key;
    public byte[] iv;
    public boolean isPhoto;
    public boolean isStory;
    public long resumetime;

    public boolean canceled;
    public boolean videoConvertFirstWrite;
    public boolean shouldLimitFps = true;

    public ArrayList<MediaCompress.MixedSoundInfo> mixedSoundInfos = new ArrayList<>();


}
