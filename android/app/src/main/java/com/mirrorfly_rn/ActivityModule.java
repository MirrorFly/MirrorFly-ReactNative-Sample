// Adapted from
// https://github.com/gijoehosaphat/react-native-keep-screen-on

package com.mirrorfly_rn;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.List;

public class ActivityModule extends ReactContextBaseJavaModule {

    public ReactApplicationContext reactContext;
    public static ActivityModule instance = null;
    public static final String CALL_SCREEN_ACTIVITY_STATE_CHANGE = "CALL_SCREEN_ACTIVITY_STATE_CHANGE";
    private static DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter = null;

    public ActivityModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public void initialize() {
        super.initialize();
        eventEmitter = getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    }

    @Override
    public String getName() {
        return "ActivityModule";
    }

    public static synchronized void callScreenStateChanged(String state) {
        Log.d("TAG", "callScreenStateChanged: emitting event callScreenStateChanged");
        eventEmitter.emit(CALL_SCREEN_ACTIVITY_STATE_CHANGE, state);
    }

    @ReactMethod
    public void closeActivity() {
        ActivityManager.getInstance().finishActivity(CallScreenActivity.class);
    }

    @ReactMethod
    public void updateCallConnectedStatus(Boolean isConnected) {
        CallScreenActivity.isCallConnected = isConnected;
    }

    @ReactMethod
    public void getPackageName(Promise promise) {
        final Activity activity = getReactApplicationContext().getCurrentActivity();
        if (activity != null) {
            try {
                String packageName = activity.getPackageName();
                promise.resolve(packageName);
            } catch (Exception e) {
                promise.resolve("undefined");
            }
        } else {
            promise.resolve("undefined");
        }
    }

    @ReactMethod
    public void getInstalledPackages(String targetPackage, Promise promise) {
        Boolean isPackageExists = isPackageExists(targetPackage);
        promise.resolve(isPackageExists);
    }

    public boolean isPackageExists(String targetPackage) {
        PackageManager pm = getReactApplicationContext().getPackageManager();
        List<ApplicationInfo> packages = pm.getInstalledApplications(0);
        for (ApplicationInfo packageInfo : packages) {
            if (packageInfo.packageName.equals(targetPackage)) {
                return true;
            }
        }
        return false;
    }

    @ReactMethod
    public void getActivity(Promise promise) {
        final Activity activity = this.reactContext.getCurrentActivity();
        if (activity != null) {
            try {
                String classname = activity.getComponentName().getClassName();
                promise.resolve(classname);
            } catch (Exception e) {
                promise.resolve("undefined");
            }
        } else {
            promise.resolve("undefined");
        }
    }

    @ReactMethod
    public void getCallActivity(Promise promise) {
        try {
            final String activity = CallScreenActivity.class.getName();
            promise.resolve(activity);
        } catch (Exception e) {
            promise.resolve("undefined");
        }
    }

    @ReactMethod
    public void getMainActivity(Promise promise) {
        try {
            final String activity = MainActivity.class.getName();
            promise.resolve(activity);
        } catch (Exception e) {
            promise.resolve("undefined");
        }
    }

    @ReactMethod
    public void isLocked(Promise promise) {
        try {
            boolean isLocked = isLockScreenDisabled();
            promise.resolve(isLocked);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    private boolean isLockScreenDisabled() {
        KeyguardManager km = (KeyguardManager) this.reactContext.getSystemService(Context.KEYGUARD_SERVICE);
        if (km.isKeyguardLocked())
            return true;
        else
            return false;
    }

    @ReactMethod
    public void openActivity() {
        Intent intent = new Intent(getReactApplicationContext(), CallScreenActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getReactApplicationContext().startActivity(intent);
    }
}