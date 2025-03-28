package com.mirrorfly_rn.newfilecompression.compressionhelper;

import android.media.MediaCodec;
import android.media.MediaFormat;

import com.mirrorflysdk.shadow.media.googlecode.mp4parser.util.Matrix;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class Mp4Movie {

    private Matrix matrix = Matrix.ROTATE_0;
    private ArrayList<Track> tracks = new ArrayList<>();
    private File cacheFile;
    private int width;
    private int height;

    public Matrix getMatrix() {
        return matrix;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public void setCacheFile(File file) {
        cacheFile = file;
    }

    public void setRotation(int angle) {
        if (angle == 0) {
            matrix = Matrix.ROTATE_0;
        } else if (angle == 90) {
            matrix = Matrix.ROTATE_90;
        } else if (angle == 180) {
            matrix = Matrix.ROTATE_180;
        } else if (angle == 270) {
            matrix = Matrix.ROTATE_270;
        }
    }

    public void setSize(int w, int h) {
        width = w;
        height = h;
    }

    public List<Track> getTracks() {
        return tracks;
    }

    public File getCacheFile() {
        return cacheFile;
    }

    public void addSample(int trackIndex, long offset, MediaCodec.BufferInfo bufferInfo) {
        if (trackIndex < 0 || trackIndex >= tracks.size()) {
            return;
        }
        Track track = tracks.get(trackIndex);
        track.addSample(offset, bufferInfo);
    }

    public int addTrack(MediaFormat mediaFormat, boolean isAudio) {
        tracks.add(new Track(tracks.size(), mediaFormat, isAudio));
        return tracks.size() - 1;
    }

    public long getLastFrameTimestamp(int trackIndex) {
        if (trackIndex < 0 || trackIndex >= tracks.size()) {
            return 0;
        }
        Track track = tracks.get(trackIndex);
        return track.getLastFrameTimestamp();
    }
}
