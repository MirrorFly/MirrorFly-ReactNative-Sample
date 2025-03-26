package com.mirrorfly_rn.newfilecompression.controller;

//import static com.mirrorflysdk.flycall.call.utils.LogTagsKt.FILE_UPLOAD_TAG;

import android.media.MediaCodec;
import android.media.MediaCodecInfo;
import android.media.MediaExtractor;
import android.media.MediaFormat;
import android.media.MediaMetadataRetriever;
import android.util.Log;
import android.util.Size;
import com.mirrorfly_rn.newfilecompression.FileLog;
//import com.mirrorfly_rn.newfilecompression.FileLog;
import com.mirrorfly_rn.newfilecompression.Utilities;
import com.mirrorfly_rn.newfilecompression.compressfile.MediaCompress;
import com.mirrorfly_rn.newfilecompression.helper.AnimatedFileDrawable;
import com.mirrorfly_rn.newfilecompression.helper.VideoEditedInfo;
import java.io.File;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MediaController {



    private volatile int selectedCompression;
    private volatile int compressionsCount = -1;

    private int MAXBITRATE=100;

    private String currentPathObject;
    private int rotationValue;
    private volatile int originalWidth;
    private volatile int originalHeight;
    private volatile int resultWidth;
    private volatile int resultHeight;
    private volatile int bitrate;
    private volatile int originalBitrate;
    private float videoDuration;
    private int videoFramerate;
    private volatile boolean videoConvertSupported;
    private volatile boolean isH264Video;
    private long startTime;
    private long endTime;
    private float videoCutStart;
    private float videoCutEnd;
    private long audioFramesSize;
    private long videoFramesSize;
    private long estimatedSize;
    private long estimatedDuration;
    private long originalSize;

    private static final ConcurrentHashMap<String, Integer> cachedEncoderBitrates = new ConcurrentHashMap<>();

    public final static String VIDEO_MIME_TYPE = "video/avc";
    public final static String AUIDO_MIME_TYPE = "audio/mp4a-latm";

    VideoConvertorListener callback;
    VideoEditedInfo videoEditedInfo = new VideoEditedInfo();

    private String srcVideoPath;
    private String outputVideoPath;

   // FileUploadOperation operation;

    public MediaController(String srcPath, String outputPath, VideoConvertorListener listener){
        srcVideoPath=srcPath;
        outputVideoPath=outputPath;
        callback=listener;
        //this.videoEditedInfo = videoEditedInfo;
    }

    private ExecutorService executorService;

    public interface VideoConvertorListener {
        boolean checkConversionCanceled();
        void didWriteData(long availableSize, float progress);
        void compressFailed();
        void compressCompleted();
        void onCompressedFile();
    }



    private int selectCompression() {
        //1GB
        if (originalSize > 1024L * 1024L * 1000L) {
            return compressionsCount - 1;
        }
        int compressionsCount = this.compressionsCount;
        int maxCompression = 2;
        while (compressionsCount < 5) {
            int selectedCompression = -1;
            if (selectedCompression >= 0) {
                return Math.min(selectedCompression, maxCompression);
            }
            compressionsCount++;
        }
        Log.e("KSV","compressionsCount---"+compressionsCount);
        int s=Math.min(maxCompression, Math.round(MAXBITRATE/ (100f / compressionsCount)) - 1);
        Log.e("KSV","maxCompression---"+s);
        return Math.min(maxCompression, Math.round(MAXBITRATE / (100f / compressionsCount)) - 1);
    }

    private void updateCompressionsCount(int h, int w) {
        int maxSize = Math.max(h, w);
        if (maxSize > 1280) {
            compressionsCount = 4;
        } else if (maxSize > 854) {
            compressionsCount = 3;
        } else if (maxSize > 640) {
            compressionsCount = 2;
        } else {
            compressionsCount = 1;
        }
    }

    private Size calculateResultVideoSize() {
        if (compressionsCount == 1) {
            return new Size(originalWidth, originalHeight);
        }
        float maxSize;
        int resultWidth;
        int resultHeight;
        switch (selectedCompression) {
            case 0:
                maxSize = 480.0f;
                break;
            case 1:
                maxSize = 854.0f;
                break;
            case 2:
                maxSize = 1280.0f;
                break;
            case 3:
            default:
                maxSize = 1920.0f;
                break;
        }

        float scale = originalWidth > originalHeight ? maxSize / originalWidth : maxSize / originalHeight;
        if (selectedCompression == compressionsCount - 1 && scale >= 1f) {
            resultWidth = originalWidth;
            resultHeight = originalHeight;
        } else {
            resultWidth = Math.round(originalWidth * scale / 2) * 2;
            resultHeight = Math.round(originalHeight * scale / 2) * 2;
        }
        return new Size(resultWidth, resultHeight);
    }

    private void prepareRealEncoderBitrate() {
        Size resultSize = calculateResultVideoSize();
        if (resultSize.getWidth() == originalWidth && resultSize.getHeight() == originalHeight) {
            MediaController.extractRealEncoderBitrate(resultSize.getWidth(), resultSize.getHeight(), originalBitrate,false);
        } else {
            int targetBitrate = MediaController.makeVideoBitrate(originalHeight, originalWidth, originalBitrate, resultSize.getHeight(), resultSize.getWidth());
            MediaController.extractRealEncoderBitrate(resultSize.getWidth(), resultSize.getHeight(), targetBitrate,false);
        }

    }

    public static int extractRealEncoderBitrate(int width, int height, int bitrate,boolean tryHevc) {
        String cacheKey = width + "" + height + "" + bitrate;
        Integer cachedBitrate = cachedEncoderBitrates.get(cacheKey);
        if (cachedBitrate != null) return cachedBitrate;
        try {
            MediaCodec encoder = null;
            if (tryHevc) {
                try {
                    encoder = MediaCodec.createEncoderByType("video/hevc");
                } catch (Exception ignore) {}
            }
            if (encoder == null) {
                encoder = MediaCodec.createEncoderByType(MediaController.VIDEO_MIME_TYPE);
            }
            MediaFormat outputFormat = MediaFormat.createVideoFormat(MediaController.VIDEO_MIME_TYPE, width, height);
            outputFormat.setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface);
            outputFormat.setInteger("max-bitrate", bitrate);
            outputFormat.setInteger(MediaFormat.KEY_BIT_RATE, bitrate);
            outputFormat.setInteger(MediaFormat.KEY_FRAME_RATE, 30);
            outputFormat.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1);
            encoder.configure(outputFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE);
            int encoderBitrate = (int) (encoder.getOutputFormat().getInteger(MediaFormat.KEY_BIT_RATE));
            cachedEncoderBitrates.put(cacheKey, encoderBitrate);
            encoder.release();
            return encoderBitrate;
        } catch (Exception e) {
            return bitrate;
        }
    }


    public static int makeVideoBitrate(int originalHeight, int originalWidth, int originalBitrate, int height, int width) {
        float compressFactor;
        float minCompressFactor;
        int maxBitrate;
        if (Math.min(height, width) >= 1080) {
            maxBitrate = 6800_000;
            compressFactor = 1f;
            minCompressFactor = 1f;
        } else if (Math.min(height, width) >= 720) {
            maxBitrate = 2600_000;
            compressFactor = 1f;
            minCompressFactor = 1f;
        } else if (Math.min(height, width) >= 480) {
            maxBitrate = 1000_000;
            compressFactor = 0.75f;
            minCompressFactor = 0.9f;
        } else {
            maxBitrate = 750_000;
            compressFactor = 0.6f;
            minCompressFactor = 0.7f;
        }
        int remeasuredBitrate = (int) (originalBitrate / (Math.min(originalHeight / (float) (height), originalWidth / (float) (width))));
        remeasuredBitrate *= compressFactor;
        int minBitrate = (int) (getVideoBitrateWithFactor(minCompressFactor) / (1280f * 720f / (width * height)));
        if (originalBitrate < minBitrate) {
            return remeasuredBitrate;
        }
        if (remeasuredBitrate > maxBitrate) {
            return maxBitrate;
        }
        return Math.max(remeasuredBitrate, minBitrate);
    }


    private static int getVideoBitrateWithFactor(float f) {
        return (int) (f * 2000f * 1000f * 1.13f);
    }

    public static boolean isH264Video(String videoPath) {
        MediaExtractor extractor = new MediaExtractor();
        try {
            extractor.setDataSource(videoPath);
            int videoIndex = MediaController.findTrack(extractor, false);
            return videoIndex >= 0 && extractor.getTrackFormat(videoIndex).getString(MediaFormat.KEY_MIME).equals(MediaController.VIDEO_MIME_TYPE);
        } catch (Exception e) {
            FileLog.e(e);
        } finally {
            extractor.release();
        }
        return false;
    }

    private void updateWidthHeightBitrateForCompression() {
        if (compressionsCount <= 0) {
            return;
        }
        if (selectedCompression >= compressionsCount) {
            selectedCompression = compressionsCount - 1;
        }

        Size resultSize = calculateResultVideoSize();
        resultWidth = resultSize.getWidth();
        resultHeight = resultSize.getHeight();

        Log.e("KSV","resultWidth---"+resultWidth);
        Log.e("KSV","resultHeight---"+resultHeight);

        if (bitrate != 0) {
            final int encoderBitrate;
            if (resultWidth == originalWidth && resultHeight == originalHeight) {
                bitrate = originalBitrate;
                encoderBitrate = MediaController.extractRealEncoderBitrate(resultWidth, resultHeight, bitrate, false);
            } else {
                bitrate = MediaController.makeVideoBitrate(originalHeight, originalWidth, originalBitrate, resultHeight, resultWidth);
                encoderBitrate = MediaController.extractRealEncoderBitrate(resultWidth, resultHeight, bitrate, false);
            }
            Log.e("KSV","encoderBitrate---"+encoderBitrate);
            videoFramesSize = (long) (encoderBitrate / 8 * videoDuration / 1000);
            Log.e("KSV","videoFramesSize---"+videoFramesSize);
        }
    }

    public static int findTrack(MediaExtractor extractor, boolean audio) {
        int numTracks = extractor.getTrackCount();
        for (int i = 0; i < numTracks; i++) {
            MediaFormat format = extractor.getTrackFormat(i);
            String mime = format.getString(MediaFormat.KEY_MIME);
            if (audio) {
                if (mime.startsWith("audio/")) {
                    return i;
                }
            } else {
                if (mime.startsWith("video/")) {
                    return i;
                }
            }
        }
        return -5;
    }

    private void calculateEstimatedVideoSize(boolean needEncoding, boolean isMute) {
        Log.e("Video_process","needEncoding----"+needEncoding+"-----"+"isMute----"+isMute);
        if (needEncoding) {
            estimatedSize = (long) (((isMute ? 0 : audioFramesSize) + videoFramesSize) * ((float) estimatedDuration / videoDuration));
            estimatedSize += estimatedSize / (32 * 1024) * 16;
        } else {
            estimatedSize = (long) (originalSize * ((float) estimatedDuration / videoDuration));
            if (isMute)
                estimatedSize -= (long) (audioFramesSize * ((float) estimatedDuration / videoDuration));
        }
        Log.e("Video_process","estimatedSize----"+estimatedSize);
    }

    private boolean needEncoding() {
        return !isH264Video || videoCutStart != 0 || rotationValue != 0 || resultWidth != originalWidth || resultHeight != originalHeight;
    }

    public static int getVideoBitrate(String path) {
        MediaMetadataRetriever retriever = new MediaMetadataRetriever();
        int bitrate = 0;
        try {
            retriever.setDataSource(path);
            bitrate = Integer.parseInt(retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_BITRATE));
        } catch (Exception e) {
            FileLog.e(e);
        }

        try {
            retriever.release();
        } catch (Throwable throwable) {
            FileLog.e(throwable);
        }
        return bitrate;
    }


    public void processVideo() {
        int compressQuality = -1;
        currentPathObject = srcVideoPath;
        compressionsCount = -1;
        rotationValue = 0;
        videoFramerate = 25;
        File file = new File(srcVideoPath);
        originalSize = file.length();
        int videoBitrate = MediaController.getVideoBitrate(srcVideoPath);

        int[] params = new int[AnimatedFileDrawable.PARAM_NUM_COUNT];
        AnimatedFileDrawable.getVideoInfo(srcVideoPath, params);
        final boolean hasAudio = params[AnimatedFileDrawable.PARAM_NUM_HAS_AUDIO] != 0;
        videoConvertSupported = params[AnimatedFileDrawable.PARAM_NUM_SUPPORTED_VIDEO_CODEC] != 0 &&  (!hasAudio || params[AnimatedFileDrawable.PARAM_NUM_SUPPORTED_AUDIO_CODEC] != 0);
        originalBitrate = bitrate = videoBitrate == -1 ? params[AnimatedFileDrawable.PARAM_NUM_BITRATE] : videoBitrate;

        if (videoConvertSupported) {
            resultWidth = originalWidth = params[AnimatedFileDrawable.PARAM_NUM_WIDTH];
            resultHeight = originalHeight = params[AnimatedFileDrawable.PARAM_NUM_HEIGHT];
            updateCompressionsCount(originalWidth, originalHeight);
            selectedCompression = compressQuality == -1 ? selectCompression() : compressQuality;
            prepareRealEncoderBitrate();
            isH264Video = MediaController.isH264Video(srcVideoPath);
        }

        audioFramesSize = params[AnimatedFileDrawable.PARAM_NUM_AUDIO_FRAME_SIZE];
        videoDuration = params[AnimatedFileDrawable.PARAM_NUM_DURATION];
        videoFramerate = params[AnimatedFileDrawable.PARAM_NUM_FRAMERATE];
        videoFramesSize = (long) (bitrate / 8 * videoDuration / 1000);

        if (videoConvertSupported) {
            rotationValue = params[AnimatedFileDrawable.PARAM_NUM_ROTATION];
            updateWidthHeightBitrateForCompression();

            if (selectedCompression > compressionsCount - 1) {
                selectedCompression = compressionsCount - 1;
            }

        }

        updateVideoInfo();
    }

    private void updateVideoInfo() {

        float progressLeft = 0;
        float progressRight = 1;

        estimatedDuration = (long) Math.ceil((progressRight - progressLeft) * videoDuration);
        Log.e("Video_process","estimatedDuration----"+estimatedDuration);

        videoCutStart = progressLeft;
        videoCutEnd = progressRight;
        Log.e("Video_process","rotationValue----"+rotationValue);
        int width = rotationValue == 90 || rotationValue == 270 ? resultHeight : resultWidth;
        int height = rotationValue == 90 || rotationValue == 270 ? resultWidth : resultHeight;

        boolean needEncoding = needEncoding();

        calculateEstimatedVideoSize(needEncoding, false);

        if (videoCutStart == 0) {
            startTime = -1;
        } else {
            startTime = (long) (videoCutStart * videoDuration) * 1000;
        }

        if (videoCutEnd == 1) {
            endTime = -1;
        } else {
            endTime = (long) (videoCutEnd * videoDuration) * 1000;
        }
        Log.e("Video_process","startTime+++++"+startTime+"++++endTime++++"+endTime);
        Log.e("Video_process","width----"+width+"----height---"+height);
        String videoDimension = String.format("%dx%d", width, height);
        String videoTimeSize = String.format("%s, ~%s", Utilities.formatShortDuration((int) (estimatedDuration / 1000)), Utilities.formatFileSize(estimatedSize));
        Log.e("final_size","----videoDimension+++"+videoDimension+"++++++videoTimeSize++++++"+videoTimeSize);

//        Log.e(FILE_UPLOAD_TAG,"----Compression Video Size : -----videoDimension+++"+videoDimension+"++++++videoTimeSize++++++"+videoTimeSize);
        Log.e("FILE_UPLOAD_TAG","----Compression Video Size : -----videoDimension+++"+videoDimension+"++++++videoTimeSize++++++"+videoTimeSize);

        setVideoEditInfo();

    }

    public void setVideoEditInfo(){
        try {
            videoEditedInfo.startTime = startTime;
            videoEditedInfo.endTime = endTime;
            videoEditedInfo.start = videoCutStart;
            videoEditedInfo.end = videoCutEnd;
            videoEditedInfo.compressQuality = selectedCompression;
            videoEditedInfo.rotationValue = rotationValue;
            videoEditedInfo.originalWidth = originalWidth;
            videoEditedInfo.originalHeight = originalHeight;
            videoEditedInfo.originalPath = currentPathObject;
            videoEditedInfo.estimatedSize = estimatedSize != 0 ? estimatedSize : 1;
            videoEditedInfo.estimatedDuration = estimatedDuration;
            videoEditedInfo.framerate = videoFramerate;
            videoEditedInfo.originalDuration = (long) (videoDuration * 1000);

            videoEditedInfo.resultWidth = resultWidth;
            videoEditedInfo.resultHeight = resultHeight;
            videoEditedInfo.bitrate =  bitrate;
            videoEditedInfo.muted = false;

            videoEditedInfo.videoConvertFirstWrite =true;

            startVideoCompression(callback);

        } catch(Exception e) {
            Log.e("Error",e.toString());
        }
    }

    public void startVideoCompression(VideoConvertorListener callback) {

        try {
            String videoPath = videoEditedInfo.originalPath;
            long startTime = videoEditedInfo.startTime;
            long avatarStartTime = videoEditedInfo.avatarStartTime;
            long endTime = videoEditedInfo.endTime;
            int resultWidth = videoEditedInfo.resultWidth;
            int resultHeight = videoEditedInfo.resultHeight;
            int rotationValue = videoEditedInfo.rotationValue;
            int originalWidth = videoEditedInfo.originalWidth;
            int originalHeight = videoEditedInfo.originalHeight;
            int framerate = videoEditedInfo.framerate;
            int bitrate = videoEditedInfo.bitrate;
            int originalBitrate = videoEditedInfo.originalBitrate;

            boolean isSecret = false;
            final File cacheFile = new File(outputVideoPath);
            long filelength=cacheFile.length();
            Log.e("Write_File_Check_CACHE", String.valueOf(filelength));
            if (cacheFile.exists()) {
                cacheFile.delete();
            }

            if (videoPath == null) {
                videoPath = "";
            }

            long duration;
            if (startTime > 0 && endTime > 0) {
                duration = endTime - startTime;
            } else if (endTime > 0) {
                duration = endTime;
            } else if (startTime > 0) {
                duration = videoEditedInfo.originalDuration - startTime;
            } else {
                duration = videoEditedInfo.originalDuration;
            }

            if (framerate == 0) {
                framerate = 25;
            } else if (framerate > 59) {
                framerate = 59;
            }

            if (rotationValue == 90 || rotationValue == 270) {
                int temp = resultHeight;
                resultHeight = resultWidth;
                resultWidth = temp;
            }

            if (!videoEditedInfo.shouldLimitFps && framerate > 40 && (Math.min(resultHeight, resultWidth) <= 480)) {
                framerate = 30;
            }

            boolean needCompress = resultWidth != originalWidth || resultHeight != originalHeight || rotationValue != 0 || startTime != -1 || !videoEditedInfo.mixedSoundInfos.isEmpty();

            if(!needCompress) {
                callback.onCompressedFile();
                return;
            }

            MediaCompress videoConvertor = new MediaCompress();
            MediaCompress.ConvertVideoParams convertVideoParams = MediaCompress.ConvertVideoParams.of(videoPath, cacheFile,
                    rotationValue, isSecret,
                    originalWidth, originalHeight,
                    resultWidth, resultHeight,
                    framerate, bitrate, originalBitrate,
                    startTime, endTime, avatarStartTime,
                    needCompress, duration,
                    videoEditedInfo.isPhoto,
                    videoEditedInfo.roundVideo,
                    callback,
                    videoEditedInfo.muted,
                    videoEditedInfo.isStory);
            convertVideoParams.soundInfos.addAll(videoEditedInfo.mixedSoundInfos);

            getExecutorService().execute(() -> {
                boolean error = videoConvertor.convertVideo(convertVideoParams);
                if(error) {
                    callback.compressFailed();
                } else {
                    callback.compressCompleted();
                }
            });

        } catch(Exception e) {
            Log.e("Error",e.toString());
        }
    }

    private ExecutorService getExecutorService() {
        if (executorService == null) {
            executorService = Executors.newSingleThreadExecutor();
        }
        return executorService;
    }

}
