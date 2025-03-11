package com.mirrorfly_rn.newfilecompression.systemlibLoader;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.os.Build;
import android.util.Log;

import com.mirrorfly_rn.newfilecompression.FileLog;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

public class NativeLoader {

    private static final int LIB_VERSION = 46;
    private static final String LIB_NAME = "mirror." + LIB_VERSION;
    private static final String LIB_SO_NAME = "lib" + LIB_NAME + ".so";
    private static final String LOCALE_LIB_SO_NAME = "lib" + LIB_NAME + "loc.so";

    private static final String ARM_EABI_V7A = "armeabi-v7a";
    private static final String ARM_EABI = "armeabi";
    private static final String ARM_64_V8A = "arm64-v8a";
    private static final String X86_64 = "x86_64";
    private static final String X86 = "x86";

    private static volatile boolean nativeLoaded = false;
    public static StringBuilder log = new StringBuilder();

    private NativeLoader() {
        // Private constructor to prevent instantiation
    }

    @SuppressLint({"UnsafeDynamicallyLoadedCode", "SetWorldReadable"})
    private static boolean loadFromZip(Context context, File destDir, File destLocalFile, String folder) {
        try {
            for (File file : destDir.listFiles()) {
                deleteFile(file);
            }
        } catch (Exception e) {
            FileLog.e(e);
        }

        ZipFile zipFile = null;
        InputStream stream = null;
        OutputStream out = null;
        try {
            if (context == null) {
                throw new FileNotFoundExceptionInApk("Unable to find file");
            }
            zipFile = new ZipFile(context.getApplicationInfo().sourceDir);
            ZipEntry entry = zipFile.getEntry("lib/" + folder + "/" + LIB_SO_NAME);
            if (entry == null) {
                throw new FileNotFoundExceptionInApk("Unable to find file in apk:" + "lib/" + folder + "/" + LIB_NAME);
            }
            stream = zipFile.getInputStream(entry);

            out = new FileOutputStream(destLocalFile);
            byte[] buf = new byte[4096];
            int len;
            while ((len = stream.read(buf)) > 0) {
                Thread.yield();
                out.write(buf, 0, len);
            }

            destLocalFile.setReadable(true, false);
            destLocalFile.setExecutable(true, false);
            destLocalFile.setWritable(true);
            systemLoad(destLocalFile);
            return true;
        } catch (Exception e) {
            FileLog.e(e);
        } finally {
            if (out != null) {
                try {
                    out.close();
                } catch (Exception e) {
                    FileLog.e(e);
                }
            }
            if (stream != null) {
                try {
                    stream.close();
                } catch (Exception e) {
                    FileLog.e(e);
                }
            }
            if (zipFile != null) {
                try {
                    zipFile.close();
                } catch (Exception e) {
                    FileLog.e(e);
                }
            }
        }
        return false;
    }

    private static void systemLoad(File destLocalFile){
        try {
            System.load(destLocalFile.getAbsolutePath());
            nativeLoaded = true;
        } catch (Error e) {
            FileLog.e(e);
        }
    }

    private static Boolean getsystemLoadLibException(){
        try {
            System.loadLibrary(LIB_NAME);
            nativeLoaded = true;
            FileLog.d("loaded normal lib");
            return false;
        } catch (Error e) {
            FileLog.e(e);
            log.append("128: ").append(e).append("\n");
        }
        return true;
    }

    private static Boolean getnativeLoadedException(File destLocalFile){
        try {
            FileLog.d("Load local lib");
            System.load(destLocalFile.getAbsolutePath());
            nativeLoaded = true;
            return false;
        } catch (Error e) {
            log.append(e).append("\n");
            FileLog.e(e);
        }
        return true;
    }

    @SuppressLint("UnsafeDynamicallyLoadedCode")
    public static synchronized void initNativeLibs(Context context) {
        if (nativeLoaded) {
            return;
        }

        try {
            boolean systemLoadLibException = getsystemLoadLibException();
            if(!systemLoadLibException){
                return;
            }

            String folder = getAbiFolder();

            File destDir = new File(context.getFilesDir(), "lib");
            Log.d("NativeLoader", "destDir = " + destDir.getAbsolutePath());
            destDir.mkdirs();

            File destLocalFile = new File(destDir, LOCALE_LIB_SO_NAME);
            if (destLocalFile.exists()) {
                boolean nativeLoadedException = getnativeLoadedException(destLocalFile);
                 if(!nativeLoadedException){
                     return;
                 }
                deleteFile(destLocalFile);
            }


            FileLog.e("Library not found, arch = " + folder);
            log.append("Library not found, arch = " + folder).append("\n");


            if (loadFromZip(context, destDir, destLocalFile, folder)) {
                return;
            }
        } catch (Throwable e) {
            e.printStackTrace();
            log.append("176: ").append(e).append("\n");
        }

        try {
            System.loadLibrary(LIB_NAME);
            nativeLoaded = true;
        } catch (Error e) {
            FileLog.e(e);
            log.append("184: ").append(e).append("\n");
        }
    }

    private static void deleteFile(File file){
        try {
            file.delete();
        } catch (Exception e) {
            FileLog.e(e);
        }
    }


    public static String getAbiFolder() {
        String folder;
        try {
            if (Build.CPU_ABI.equalsIgnoreCase(X86_64)) {
                folder = X86_64;
            } else if (Build.CPU_ABI.equalsIgnoreCase(ARM_64_V8A)) {
                folder = ARM_64_V8A;
            } else if (Build.CPU_ABI.equalsIgnoreCase(ARM_EABI_V7A)) {
                folder = ARM_EABI_V7A;
            } else if (Build.CPU_ABI.equalsIgnoreCase(ARM_EABI)) {
                folder = ARM_EABI;
            } else if (Build.CPU_ABI.equalsIgnoreCase(X86)) {
                folder = X86;
            } else if (Build.CPU_ABI.equalsIgnoreCase("mips")) {
                folder = "mips";
            } else {
                folder = ARM_EABI;

                FileLog.e("Unsupported arch: " + Build.CPU_ABI);

            }
        } catch (Exception e) {
            FileLog.e(e);
            folder = ARM_EABI;
        }

        String javaArch = System.getProperty("os.arch");
        if (javaArch != null && javaArch.contains("686")) {
            folder = X86;
        }
        return folder;
    }

    public static class FileNotFoundExceptionInApk extends Exception {
        public FileNotFoundExceptionInApk(String message) {
            super(message);
        }
    }


    public static boolean loaded() {
        return nativeLoaded;
    }
}


