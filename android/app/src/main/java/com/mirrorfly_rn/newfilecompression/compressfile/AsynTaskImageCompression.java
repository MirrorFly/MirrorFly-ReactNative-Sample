/*
 * @category ContusFly
 * @copyright Copyright (C) 2016 Contus. All rights reserved.
 * @license http://www.apache.org/licenses/LICENSE-2.0
 */

package com.mirrorfly_rn.newfilecompression.compressfile;

import android.os.AsyncTask;

import androidx.annotation.IntRange;
import androidx.annotation.Keep;
import androidx.annotation.NonNull;

/**
 * A simple helper class that compresses the image asynchronously and notifies in a callback.
 * This class uses async task to perform the compression in the background. It also uses the
 * default {@link AsyncTask#THREAD_POOL_EXECUTOR} executor to run 5 compression tasks
 * simultaneously. Any compression requests further, will be queued and will be executed if
 * any of the threads in the pool, completes the task.
 * <p>
 * <p>
 * <p>
 * Note: Tested compressing an image of size 14MB, 50 times concurrently (Concurrency as
 * explained above), on a Nexus 5. There were no problems. For bigger images, run a test
 * before using.
 * <p>
 * References : Stack overflow, Android.
 *
 * @author ContusTeam <developers@contus.in>
 * @version 1.0
 */
@Keep
public class AsynTaskImageCompression {

    private static final int DEFAULT_COMPRESSION_QUALITY = 95;

    /**
     * The compression quality that will be used when compressing the image to JPEG. This is
     * global for all compression tasks.
     */
    private static volatile int compressionQuality = DEFAULT_COMPRESSION_QUALITY;

    private AsynTaskImageCompression() {
        //This is a helper class with static methods.
    }

    /**
     * Calling this method will queue the compression task to the thread pool. If any threads
     * are free in the pool, it will be immediately started. Otherwise, this particular
     * request will have to wait for its turn.
     *
     * @param imageFilePath The path of the image file to be compressed.
     * @param listener      The listener interface reference to be called after the
     *                      compression completes.
     * @param outPath       The output path to store the comrpessed images.
     * @return An integer ID, that identifies this task. Will be sent back with the callback
     * after the compression
     * completes.
     */
    public static int compress(@NonNull String imageFilePath, @NonNull String outPath,
                               @NonNull ImageCompressionListener listener) {
        CompressTask task = new CompressTask(imageFilePath, outPath, listener);
        task.startCompressing();
        return task.getTaskID();
    }

    /**
     * Returns the compression quality currently set.
     *
     * @return Returns the compression quality currently set.
     */
    public static int getCompressionQuality() {
        return compressionQuality;
    }

    /**
     * Sets the compression quality that will be applied during the final creation of the
     * JPEG image file. Changing this midway when there are tasks in queue, will apply this
     * value to those tasks.
     * <p>
     * However, tasks that are already in process, will be continued with the old value.
     *
     * @param compressionQuality The desired compression quality percentage.
     */
    public static void setCompressionQuality(@IntRange(from = 1, to = 100)
                                                     int compressionQuality) {
        AsynTaskImageCompression.compressionQuality = compressionQuality;
    }

    /**
     * The interface that has the callback methods to be called after the compression is done.
     */
    public interface ImageCompressionListener {

        /**
         * This method will be called once the compression is successfully completed.
         *
         * @param compressedPath The path of the compressed image.
         * @param taskID         The ID for this compression task.
         */
        void onCompressed(int taskID, @NonNull String compressedPath);

        /**
         * This method will be called in case of any errors during compression.
         *
         * @param taskID The id of the task that failed.
         */
        void onCompressionFailed(int taskID);
    }
}