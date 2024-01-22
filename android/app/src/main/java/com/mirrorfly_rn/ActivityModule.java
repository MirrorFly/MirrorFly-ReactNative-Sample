// Adapted from
// https://github.com/gijoehosaphat/react-native-keep-screen-on

package com.mirrorfly_rn;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.List;

public class ActivityModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public ActivityModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "ActivityModule";
    }

    @ReactMethod
    public void CloseActivity() {
        final Activity activity = getReactApplicationContext().getCurrentActivity();
        if (activity != null) {
            final String className = getReactApplicationContext().getCurrentActivity().getComponentName().getClassName();
            if (className.contains("CallScreenActivity")) {
                activity.finish();
            }
        }
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
    public void getInstalledPackages(String targetPackage,Promise promise) {
        Boolean isPackageExists = isPackageExists(targetPackage);
        promise.resolve(isPackageExists);
    }

    public boolean isPackageExists(String targetPackage){
        PackageManager pm = getReactApplicationContext().getPackageManager();
        List<ApplicationInfo> packages = pm.getInstalledApplications(0);
        for (ApplicationInfo packageInfo:packages) {
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