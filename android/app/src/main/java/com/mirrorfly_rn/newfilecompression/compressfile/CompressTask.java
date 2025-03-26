/*
 * @category ContusFly
 * @copyright Copyright (C) 2016 Contus. All rights reserved.
 * @license http://www.apache.org/licenses/LICENSE-2.0
 */

package com.mirrorfly_rn.newfilecompression.compressfile;


import static com.mirrorfly_rn.newfilecompression.compressfile.AsynTaskImageCompression.getCompressionQuality;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.media.ExifInterface;
import android.os.AsyncTask;
import android.text.TextUtils;
import android.util.Log;

import androidx.annotation.Keep;


import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * The class that does the compression. This class does 3 processes.
 * <p>
 * 1. Resize the original image to a smaller version. (Only if the original image is larger than
 * {@link #MAX_WIDTH} or {@link #MAX_HEIGHT}.
 * 2. Rotate the image to a proper orientation.
 * 3. Compress the image and save it in JPEG format at 90% of the original quality.
 * <p>
 * All the above steps are done in background and notified after completion on the calling thread.
 */
@Keep
public class CompressTask extends AsyncTask<Void, Void, String> {

    private static final float MAX_HEIGHT = 1280.0f;
    private static final float MAX_WIDTH = 1280.0f;
    private static AtomicInteger totalQueuedTasks = new AtomicInteger(0);
    private static AtomicInteger totalCompletedTasks = new AtomicInteger(0);
    private final String imageFilePath;
    private final String outputPath;
    private AsynTaskImageCompression.ImageCompressionListener listener;
    private int taskId;

    private Logger logger = Logger.getLogger(CompressTask.class.getName());

    CompressTask(String imageFilePath, String outPath, AsynTaskImageCompression.ImageCompressionListener listener) {
        this.imageFilePath = imageFilePath;
        this.outputPath = outPath;
        this.listener = listener;
        taskId = createTaskID();
        log("Task " + taskId + " is queued.");
    }

    private static void log(String log) {
        Log.d("Compressor", log);
    }

    /**
     * Does step 1 and 2 of the compression process.
     * <p>
     * It samples the original image using an optimal inSampleSize and then re-sizes the
     * possibly still bigger image which has dimensions greater than
     * {@link #MAX_HEIGHT} or {@link
     * #MAX_WIDTH} to the max possible width and height. If the input image is
     * lesser  than the original, no resizing is done and the original bitmap is returned.
     *
     * @param imagePath The path of the image file to be resized.
     */
    private static Boolean sampleAndResize(String imagePath, String outputPath) {
        Bitmap scaledBitmap = null;

        BitmapFactory.Options options = new BitmapFactory.Options();

//      by setting this field as true, the actual bitmap pixels are not loaded in the memory. Just the bounds are loaded. If
//      you try the use the bitmap here, you will get null.
        options.inJustDecodeBounds = true;
        Bitmap bmp ;
        BitmapFactory.decodeFile(imagePath, options);

        float actualHeight = options.outHeight;
        float actualWidth = options.outWidth;

//      max Height and width values of the compressed image is taken as 816x612

        float imgRatio = actualWidth / actualHeight;
        float maxRatio = MAX_WIDTH / MAX_HEIGHT;

//      width and height values are set maintaining the aspect ratio of the image

        if (actualHeight > MAX_HEIGHT || actualWidth > MAX_WIDTH) {
            if (imgRatio < maxRatio) {
                imgRatio = MAX_HEIGHT / actualHeight;
                actualWidth = (imgRatio * actualWidth);
                actualHeight = MAX_HEIGHT;
            } else if (imgRatio > maxRatio) {
                imgRatio = MAX_WIDTH / actualWidth;
                actualHeight =  (imgRatio * actualHeight);
                actualWidth = MAX_WIDTH;
            } else {
                actualHeight = MAX_HEIGHT;
                actualWidth = MAX_WIDTH;

            }
        }

//      setting inSampleSize value allows to load a scaled down version of the original image

        options.inSampleSize = calculateInSampleSize(options, actualWidth, actualHeight);

//      inJustDecodeBounds set to false to load the actual bitmap
        options.inJustDecodeBounds = false;

//      this options allow android to claim the bitmap memory if it runs low on memory
        options.inPurgeable = true;
        options.inInputShareable = true;
        options.inTempStorage = new byte[16 * 1024];

        try {
//          load the bitmap from its path
            bmp = BitmapFactory.decodeFile(imagePath, options);
        } catch (OutOfMemoryError exception) {
            Log.e("Compressor", "Error"+exception);
            return false;

        }
        try {
            scaledBitmap = Bitmap.createBitmap((int) actualWidth, (int) actualHeight, Bitmap.Config.ARGB_8888);
        } catch (OutOfMemoryError exception) {
            Log.e("Compressor", "Error"+exception);
            return false;
        }

        float ratioX = actualWidth / options.outWidth;
        float ratioY = actualHeight / options.outHeight;
        float middleX = actualWidth / 2.0f;
        float middleY = actualHeight / 2.0f;

        Matrix scaleMatrix = new Matrix();
        scaleMatrix.setScale(ratioX, ratioY, middleX, middleY);

        Canvas canvas = new Canvas(scaledBitmap);
        canvas.setMatrix(scaleMatrix);
        canvas.drawBitmap(bmp, middleX - bmp.getWidth() / 2f, middleY - bmp.getHeight() / 2f, new Paint(Paint.FILTER_BITMAP_FLAG));

//      check the rotation of the image and display it properly
        ExifInterface exif;
        try {
            exif = new ExifInterface(imagePath);

            int orientation = exif.getAttributeInt(
                    ExifInterface.TAG_ORIENTATION, 0);
            Matrix matrix = new Matrix();
            if (orientation == 6) {
                matrix.postRotate(90);
            } else if (orientation == 3) {
                matrix.postRotate(180);
            } else if (orientation == 8) {
                matrix.postRotate(270);
            }
            scaledBitmap = Bitmap.createBitmap(scaledBitmap, 0, 0,
                    scaledBitmap.getWidth(), scaledBitmap.getHeight(), matrix,
                    true);
        } catch (IOException e) {
            Log.e("Compressor", "Error"+e);
            return false;
        }

        FileOutputStream out = null;
        try {
            out = new FileOutputStream(outputPath);

//          write the compressed bitmap at the destination specified by filename.
            scaledBitmap.compress(Bitmap.CompressFormat.JPEG, getCompressionQuality(), out);

        } catch (FileNotFoundException e) {
            Log.e("Compressor", "Error"+e);
            return false;
        }


        return true;
    }

    public static int calculateInSampleSize(BitmapFactory.Options options, float reqWidth, float reqHeight) {
        final float height = options.outHeight;
        final float width = options.outWidth;
        int inSampleSize = 1;

        if (height > reqHeight || width > reqWidth) {
            final int heightRatio = Math.round(height / reqHeight);
            final int widthRatio = Math.round(width / reqWidth);
            inSampleSize = Math.min(heightRatio, widthRatio);
        }
        final float totalPixels = width * height;
        final float totalReqPixelsCap = reqWidth * reqHeight * 2;
        while (totalPixels / (inSampleSize * inSampleSize) > totalReqPixelsCap) {
            inSampleSize++;
        }

        return inSampleSize;
    }


    /**
     * A simple helper method to notify the task completion. Calling this method will
     * increment the completed tasks count.
     */
    private static void notifyTaskCompletion() {
        totalCompletedTasks.incrementAndGet();
    }

    /**
     * A simple helper method to keep track of queued tasks. Calling this method increments the
     * total queued tasks by one and returns the total count so far.
     *
     * @return Increments the total queued tasks count and returns it.
     */
    private int createTaskID() {
        return totalQueuedTasks.incrementAndGet();
    }

    @Override
    protected String doInBackground(Void... voids) {
        try {
            log("Compression in progress... Task id :" + taskId);
            boolean isBitmapSaved = sampleAndResize(imageFilePath, outputPath);
            return isBitmapSaved ? outputPath : null;
        } catch (OutOfMemoryError error) {
            log("Memory limit reached. Couldn't complete task " + taskId);
            logger.log(Level.INFO, "Memory limit reached. Could not complete task ",
                    error);
            return null;
        }

    }

    @Override
    protected void onPostExecute(String outPath) {
        log("Task " + taskId + " complete!");
        notifyTaskCompletion();
        if (listener != null) {
            if (!TextUtils.isEmpty(outPath))
                listener.onCompressed(getTaskID(), outPath);
            else {
                log("Compression failed!");
                listener.onCompressionFailed(getTaskID());
            }
        }
    }

    /**
     * Returns the task ID for this compression task.
     *
     * @return The integer id for this task.
     */
    int getTaskID() {
        return taskId;
    }

    /**
     * Starts the compression process in the background.
     */
    void startCompressing() {
        executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
    }
}