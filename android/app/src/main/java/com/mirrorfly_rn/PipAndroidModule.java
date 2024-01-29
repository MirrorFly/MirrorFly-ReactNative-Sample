package com.mirrorfly_rn;

import android.app.Activity;
import android.app.AppOpsManager;
import android.app.PictureInPictureParams;
import android.content.Context;
import android.os.Build;
import android.os.Process;
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

    @ReactMethod
    public void enterPipMode(int width, int height) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && getCurrentActivity() != null) {
                AppOpsManager appOpsManager;
                appOpsManager = (AppOpsManager) getCurrentActivity().getSystemService(Context.APP_OPS_SERVICE);
                Boolean isPipAllowedInSystem = AppOpsManager.MODE_ALLOWED == appOpsManager.checkOpNoThrow(AppOpsManager.OPSTR_PICTURE_IN_PICTURE, Process.myUid(), getCurrentActivity().getPackageName());
                Log.d("TAG", "isPipAllowed: before validation " + isPipAllowedInSystem);
                if (isPipAllowedInSystem) {
                            Log.d("TAG", "enterPipMode: before validation "+ getCurrentActivity().toString().toLowerCase() + " ___ " + getCurrentActivity().isInPictureInPictureMode());
                            if (getCurrentActivity().toString().toLowerCase().contains("callscreenactivity") && !getCurrentActivity().isInPictureInPictureMode()) {
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
                }
            }
        } catch (Exception e) {
            Log.d("TAG", "Error in CallScreenActivity enterPipMode method: "+ e);
        }
    }
}


