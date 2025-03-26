package com.mirrorfly_rn.newfilecompression;



import android.app.ActivityManager;
import android.content.Context;
import android.media.ExifInterface;
import android.os.Build;
import android.util.Log;
import android.util.Pair;

import androidx.annotation.RequiresApi;


import com.mirrorfly_rn.MainApplication;

import java.io.File;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.security.SecureRandom;
import java.util.Locale;

public class Utilities {

    public static String byteValue ="%d B";
    public static String kbValue ="%d KB";
    public static String kb1Value ="%.1f KB";
    public static String mbValue ="%d MB";
    public static String mb1Value ="%.1f MB";
    public static String gbValue ="%d GB";
    public static String gb1Value ="%.2f GB";
    public static String gb2Value ="%.1f GB";

    public static SecureRandom random = new SecureRandom();

    public static Integer photoSize = null;

    public static float screenRefreshRate = 60;

    private static final int[] LOW_SOC = {
            -1775228513, // EXYNOS 850
            802464304,  // EXYNOS 7872
            802464333,  // EXYNOS 7880
            802464302,  // EXYNOS 7870
            2067362118, // MSM8953
            2067362060, // MSM8937
            2067362084, // MSM8940
            2067362241, // MSM8992
            2067362117, // MSM8952
            2067361998, // MSM8917
            -1853602818 // SDM439
    };

    public static final int CPU_COUNT = Runtime.getRuntime().availableProcessors();
    public final static int PERFORMANCE_CLASS_LOW = 0;
    public final static int PERFORMANCE_CLASS_AVERAGE = 1;
    public final static int PERFORMANCE_CLASS_HIGH = 2;

    @PerformanceClass
    private static int devicePerformanceClass;
    @PerformanceClass
    private static int overrideDevicePerformanceClass;

    public static int clamp(int value, int maxValue, int minValue) {
        return Math.max(Math.min(value, maxValue), minValue);
    }

    public static float clamp(float value, float maxValue, float minValue) {
        if (Float.isNaN(value)) {
            return minValue;
        }
        if (Float.isInfinite(value)) {
            return maxValue;
        }
        return Math.max(Math.min(value, maxValue), minValue);
    }

    public static Integer parseInt(CharSequence value) {
        if (value == null) {
            return 0;
        }
        int val = 0;
        try {
            int start = -1, end;
            for (end = 0; end < value.length(); ++end) {
                char character = value.charAt(end);
                boolean allowedChar = character == '-' || character >= '0' && character <= '9';
                if (allowedChar && start < 0) {
                    start = end;
                } else if (!allowedChar && start >= 0) {
                    end++;
                    break;
                }
            }
            if (start >= 0) {
                String str = value.subSequence(start, end).toString();
                val = Integer.parseInt(str);
            }
        } catch (Exception ignore) {
            Log.e("error",ignore.toString());
        }
        return val;

    }

    public static boolean deviceIsLow() {
        return getDevicePerformanceClass() == PERFORMANCE_CLASS_LOW;
    }

    public static boolean deviceIsAboveAverage() {
        return getDevicePerformanceClass() >= PERFORMANCE_CLASS_AVERAGE;
    }

    public static boolean deviceIsHigh() {
        return getDevicePerformanceClass() >= PERFORMANCE_CLASS_HIGH;
    }

    public static boolean deviceIsAverage() {
        return getDevicePerformanceClass() <= PERFORMANCE_CLASS_AVERAGE;
    }

    public @interface PerformanceClass {}

    @PerformanceClass
    public static int getDevicePerformanceClass() {
        if (overrideDevicePerformanceClass != -1) {
            return overrideDevicePerformanceClass;
        }
        if (devicePerformanceClass == -1) {
            devicePerformanceClass = measureDevicePerformanceClass();
        }
        return devicePerformanceClass;
    }

    public static int measureDevicePerformanceClass() {
        int androidVersion = Build.VERSION.SDK_INT;
        int cpuCount = CPU_COUNT;

        int memoryClass = ((ActivityManager) MainApplication.Companion.getInstance().getSystemService(Context.ACTIVITY_SERVICE)).getMemoryClass();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && Build.SOC_MODEL != null) {
            int hash = Build.SOC_MODEL.toUpperCase().hashCode();
            for (int i = 0; i < LOW_SOC.length; ++i) {
                if (LOW_SOC[i] == hash) {
                    return PERFORMANCE_CLASS_LOW;
                }
            }
        }

        int totalCpuFreq = 0;
        int freqResolved = 0;
        for (int i = 0; i < cpuCount; i++) {
            try {
                RandomAccessFile reader = new RandomAccessFile(String.format(Locale.ENGLISH, "/sys/devices/system/cpu/cpu%d/cpufreq/cpuinfo_max_freq", i), "r");
                String line = reader.readLine();
                if (line != null) {
                    totalCpuFreq += Utilities.parseInt(line) / 1000;
                    freqResolved++;
                }
                reader.close();
            } catch (Throwable ignore) {}
        }
        int maxCpuFreq = freqResolved == 0 ? -1 : (int) Math.ceil(totalCpuFreq / (float) freqResolved);

        long ram = -1;
        try {
            ActivityManager.MemoryInfo memoryInfo = new ActivityManager.MemoryInfo();
            ((ActivityManager) MainApplication.Companion.getInstance().getSystemService(Context.ACTIVITY_SERVICE)).getMemoryInfo(memoryInfo);
            ram = memoryInfo.totalMem;
        } catch (Exception ignore) {
            Log.e("error",ignore.toString());
        }

        int performanceClass;
        if (
                androidVersion < 21 ||
                        cpuCount <= 2 ||
                        memoryClass <= 100 ||
                        cpuCount <= 4 && maxCpuFreq != -1 && maxCpuFreq <= 1250 ||
                        cpuCount <= 4 && maxCpuFreq <= 1600 && memoryClass <= 128 && androidVersion <= 21 ||
                        cpuCount <= 4 && maxCpuFreq <= 1300 && memoryClass <= 128 && androidVersion <= 24 ||
                        ram != -1 && ram < 2L * 1024L * 1024L * 1024L
        ) {
            performanceClass = PERFORMANCE_CLASS_LOW;
        } else if (
                cpuCount < 8 ||
                        memoryClass <= 160 ||
                        maxCpuFreq != -1 && maxCpuFreq <= 2055 ||
                        maxCpuFreq == -1 && cpuCount == 8 && androidVersion <= 23
        ) {
            performanceClass = PERFORMANCE_CLASS_AVERAGE;
        } else {
            performanceClass = PERFORMANCE_CLASS_HIGH;
        }

        return performanceClass;
    }

    public static int getPhotoSize() {
        if (photoSize == null) {
            photoSize = 1280;
        }
        return photoSize;
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    public static Pair<Integer, Integer> getImageOrientation(InputStream is) {
        try {
            return getImageOrientation(new ExifInterface(is));
        } catch (Exception e) {
            FileLog.e(e);
        }
        return new Pair<>(0, 0);
    }
    @RequiresApi(api = Build.VERSION_CODES.Q)
    public static Pair<Integer, Integer> getImageOrientation(File file) {
        try {
            return getImageOrientation(new ExifInterface(file));
        } catch (Exception e) {
            FileLog.e(e);
        }
        return new Pair<>(0, 0);
    }
    public static Pair<Integer, Integer> getImageOrientation(String path) {
        try {
            return getImageOrientation(new ExifInterface(path));
        } catch (Exception ignore) {
            Log.e("error",ignore.toString());
        }
        return new Pair<>(0, 0);
    }

    public static Pair<Integer, Integer> getImageOrientation(ExifInterface exif) {
        try {
            int orientation = 0, invert = 0;
            final int exifvalue = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);
            switch (exifvalue) {
                case ExifInterface.ORIENTATION_NORMAL:
                    break;
                case ExifInterface.ORIENTATION_FLIP_HORIZONTAL:
                    invert = 1;
                    break;
                case ExifInterface.ORIENTATION_ROTATE_180:
                    orientation = 180;
                    break;
                case ExifInterface.ORIENTATION_FLIP_VERTICAL:
                    invert = 2;
                    break;
                case ExifInterface.ORIENTATION_TRANSPOSE:
                    invert = 2;
                    orientation = 270;
                    break;
                case ExifInterface.ORIENTATION_ROTATE_90:
                    orientation = 90;
                    break;
                case ExifInterface.ORIENTATION_TRANSVERSE:
                    invert = 1;
                    orientation = 270;
                    break;
                case ExifInterface.ORIENTATION_ROTATE_270:
                    orientation = 270;
                    break;
                default:
                    invert = 1;
                    break;
            }
            return new Pair<>(orientation, invert);
        } catch (Exception e) {
            FileLog.e(e);
        }
        return new Pair<>(0, 0);
    }

    public static String formatFileSize(long size) {
        return formatFileSize(size, false);
    }


    public static String formatFileSize(long size, boolean removeZero) {
        if (size == 0) {
            return String.format(kbValue, 0);
        } else if (size < 1024) {
            return String.format(byteValue, size);
        } else if (size < 1024 * 1024) {
            float value = size / 1024.0f;
            if (removeZero && (value - (int) value) * 10 == 0) {
                return String.format(kbValue, (int) value);
            } else {
                return String.format(kb1Value, value);
            }
        } else if (size < 1000 * 1024 * 1024) {
            float value = size / 1024.0f / 1024.0f;
            if (removeZero && (value - (int) value) * 10 == 0) {
                return String.format(mbValue, (int) value);
            } else {
                return String.format(mb1Value, value);
            }
        } else {
            float value = (int) (size / 1024L / 1024L) / 1000.0f;
            if (removeZero && (value - (int) value) * 10 == 0) {
                return String.format(gbValue, (int) value);
            } else {
                return String.format(gb1Value, value);
            }
        }
    }

    public static String formatShortDuration(int duration) {
        return formatDuration(duration, false);
    }

    public static String formatLongDuration(int duration) {
        return formatDuration(duration, true);
    }

    public static String formatDuration(int duration, boolean isLong) {
        int h = duration / 3600;
        int m = duration / 60 % 60;
        int s = duration % 60;
        if (h == 0) {
            if (isLong) {
                return String.format(Locale.US, "%02d:%02d", m, s);
            } else {
                return String.format(Locale.US, "%d:%02d", m, s);
            }
        } else {
            return String.format(Locale.US, "%d:%02d:%02d", h, m, s);
        }
    }

    public static String formatFullDuration(int duration) {
        int h = duration / 3600;
        int m = duration / 60 % 60;
        int s = duration % 60;
        if (duration < 0) {
            return String.format(Locale.US, "-%02d:%02d:%02d", Math.abs(h), Math.abs(m), Math.abs(s));
        } else {
            return String.format(Locale.US, "%02d:%02d:%02d", h, m, s);
        }
    }

    public static String formatDurationNoHours(int duration, boolean isLong) {
        int m = duration / 60;
        int s = duration % 60;
        if (isLong) {
            return String.format(Locale.US, "%02d:%02d", m, s);
        } else {
            return String.format(Locale.US, "%d:%02d", m, s);
        }
    }

    public static String formatShortDuration(int progress, int duration) {
        return formatDuration(progress, duration, false);
    }

    public static String formatLongDuration(int progress, int duration) {
        return formatDuration(progress, duration, true);
    }

    public static String formatDuration(int progress, int duration, boolean isLong) {
        int h = duration / 3600;
        int m = duration / 60 % 60;
        int s = duration % 60;

        int ph = progress / 3600;
        int pm = progress / 60 % 60;
        int ps = progress % 60;

        if (duration == 0) {
            if (ph == 0) {
                if (isLong) {
                    return String.format(Locale.US, "%02d:%02d / -:--", pm, ps);
                } else {
                    return String.format(Locale.US, "%d:%02d / -:--", pm, ps);
                }
            } else {
                return String.format(Locale.US, "%d:%02d:%02d / -:--", ph, pm, ps);
            }
        } else {
            if (ph == 0 && h == 0) {
                if (isLong) {
                    return String.format(Locale.US, "%02d:%02d / %02d:%02d", pm, ps, m, s);
                } else {
                    return String.format(Locale.US, "%d:%02d / %d:%02d", pm, ps, m, s);
                }
            } else {
                return String.format(Locale.US, "%d:%02d:%02d / %d:%02d:%02d", ph, pm, ps, h, m, s);
            }
        }
    }

    public static String formatVideoDuration(int progress, int duration) {
        int h = duration / 3600;
        int m = duration / 60 % 60;
        int s = duration % 60;

        int ph = progress / 3600;
        int pm = progress / 60 % 60;
        int ps = progress % 60;

        if (ph == 0 && h == 0) {
            return String.format(Locale.US, "%02d:%02d / %02d:%02d", pm, ps, m, s);
        } else {
            if (h == 0) {
                return String.format(Locale.US, "%d:%02d:%02d / %02d:%02d", ph, pm, ps, m, s);
            } else if (ph == 0) {
                return String.format(Locale.US, "%02d:%02d / %d:%02d:%02d", pm, ps, h, m, s);
            } else {
                return String.format(Locale.US, "%d:%02d:%02d / %d:%02d:%02d", ph, pm, ps, h, m, s);
            }
        }
    }


    public static String formatFileSize(long size, boolean removeZero, boolean makeShort) {
        if (size == 0) {
            return String.format(kbValue, 0);
        } else if (size < 1024) {
            return String.format(byteValue, size);
        } else if (size < 1024 * 1024) {
            float value = size / 1024.0f;
            if (removeZero && (value - (int) value) * 10 == 0) {
                return String.format(kbValue, (int) value);
            } else {
                return String.format(kb1Value, value);
            }
        } else if (size < 1000 * 1024 * 1024) {
            float value = size / 1024.0f / 1024.0f;
            if (removeZero && (value - (int) value) * 10 == 0) {
                return String.format(mbValue, (int) value);
            } else {
                return String.format(mb1Value, value);
            }
        } else {
            float value = (int) (size / 1024L / 1024L) / 1000.0f;
            if (removeZero && (value - (int) value) * 10 == 0) {
                return String.format(gbValue, (int) value);
            } else if (makeShort) {
                return String.format(gb2Value, value);
            } else {
                return String.format(gb1Value, value);
            }
        }
    }


}

