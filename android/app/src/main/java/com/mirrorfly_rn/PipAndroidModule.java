package com.mirrorfly_rn;

import android.app.Activity;
import android.app.AppOpsManager;
import android.app.PictureInPictureParams;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Process;
import android.provider.Settings;
import android.util.Log;
import android.util.Rational;

import androidx.annotation.NonNull;
import androidx.lifecycle.Lifecycle;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;

@ReactModule(name = PipAndroidModule.NAME)
public class PipAndroidModule extends ReactContextBaseJavaModule {
    public static final String NAME = "PipAndroid";
    public static final String PIP_MODE_CHANGE = "PIP_MODE_CHANGE";
    private static DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter = null;

    ReactApplicationContext reactApplicationContext;

    public static void pipModeChanged(Boolean isInPictureInPictureMode, Lifecycle.State currentState, CallScreenActivity callScreenActivity) {
        eventEmitter.emit(PIP_MODE_CHANGE, isInPictureInPictureMode);
        if(!isInPictureInPictureMode && currentState.equals(Lifecycle.State.CREATED)) {
            // PIP is closed, so finishing the CallScreen activity
            ActivityManager.getInstance().finishActivity(CallScreenActivity.class);
        }
    }

    public PipAndroidModule(ReactApplicationContext reactContext) {
        super(reactContext);
        Log.d("PIP", "Got the context");
        this.reactApplicationContext = reactContext;
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @Override
    public void initialize() {
        super.initialize();

        eventEmitter = getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    }

    public static void openPipSettings(Context context) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Intent intent;
                Log.d("TAG", "openPipSettings: true opening settings");
                intent = new Intent("android.settings.PICTURE_IN_PICTURE_SETTINGS",
                        Uri.parse("package:" + context.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
            }
        }catch (Exception ex) {
            Log.d("TAG", "openPipSettings: Error opening PIP settings"+ex);
        }
    }

    @ReactMethod
    public void enterPipMode(int width, int height, boolean shouldOpenPermissionScreenIfPipNotAllowed) {
        try {
            Log.d("TAG", "enterPipMode: shouldOpenPermissionScreenIfPipNotAllowed"+ shouldOpenPermissionScreenIfPipNotAllowed);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && getCurrentActivity() != null) {
                AppOpsManager appOpsManager;
                appOpsManager = (AppOpsManager) getCurrentActivity().getSystemService(Context.APP_OPS_SERVICE);
                Boolean isPipAllowedInSystem = AppOpsManager.MODE_ALLOWED == appOpsManager.checkOpNoThrow(AppOpsManager.OPSTR_PICTURE_IN_PICTURE, Process.myUid(), getCurrentActivity().getPackageName());
                Log.d("TAG", "isPipAllowed: before validation " + isPipAllowedInSystem);
                if (isPipAllowedInSystem) {
                            Log.d("TAG", "enterPipMode: before validation "+ getCurrentActivity().toString().toLowerCase() + " ___ " + getCurrentActivity().isInPictureInPictureMode());
                            if (getCurrentActivity().toString().toLowerCase().contains("callscreenactivity") && !getCurrentActivity().isInPictureInPictureMode() && CallScreenActivity.isCallConnected) {
                                int ratWidth = width > 0 ? width : 380;
                                int ratHeight = height > 0 ? height : 214;

                                Rational ratio
                                        = new Rational(ratWidth, ratHeight);
                                PictureInPictureParams.Builder
                                        pip_Builder
                                        = null;

                                pip_Builder = new PictureInPictureParams
                                        .Builder();
                                pip_Builder.setAspectRatio(ratio).build();
                                reactApplicationContext.getCurrentActivity().enterPictureInPictureMode(pip_Builder.build());
                            }
                } else if (shouldOpenPermissionScreenIfPipNotAllowed == true) {
                    openPipSettings(reactApplicationContext);
                }
            }
        } catch (Exception e) {
            Log.d("TAG", "Error in CallScreenActivity enterPipMode method: "+ e);
        }
    }
}


