// Adapted from
// https://github.com/gijoehosaphat/react-native-keep-screen-on
package com.mirrorfly_rn

import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.mirrorfly_rn.CallScreenActivity

class ActivityModule(var reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(
    reactContext
) {
    override fun initialize() {
        super.initialize()
        eventEmitter = reactApplicationContext.getJSModule(
            DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
        )
    }

    override fun getName(): String {
        return "ActivityModule"
    }

    @ReactMethod
    fun closeActivity() {
        ActivityManager.instance?.finishActivity(CallScreenActivity::class.java)
    }

    @ReactMethod
    fun updateCallConnectedStatus(isConnected: Boolean) {
        CallScreenActivity.isCallConnected = isConnected
    }

    @ReactMethod
    fun getPackageName(promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity != null) {
            try {
                val packageName = activity.packageName
                promise.resolve(packageName)
            } catch (e: Exception) {
                promise.resolve("undefined")
            }
        } else {
            promise.resolve("undefined")
        }
    }

    @ReactMethod
    fun getInstalledPackages(targetPackage: String, promise: Promise) {
        val isPackageExists = isPackageExists(targetPackage)
        promise.resolve(isPackageExists)
    }

    fun isPackageExists(targetPackage: String): Boolean {
        val pm = reactApplicationContext.packageManager
        val packages = pm.getInstalledApplications(0)
        for (packageInfo in packages) {
            if (packageInfo.packageName == targetPackage) {
                return true
            }
        }
        return false
    }

    @ReactMethod
    fun getActivity(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity != null) {
            try {
                val classname = activity.componentName.className
                promise.resolve(classname)
            } catch (e: Exception) {
                promise.resolve("undefined")
            }
        } else {
            promise.resolve("undefined")
        }
    }

    @ReactMethod
    fun getCallActivity(promise: Promise) {
        try {
            val activity = CallScreenActivity::class.java.name
            promise.resolve(activity)
        } catch (e: Exception) {
            promise.resolve("undefined")
        }
    }

    @ReactMethod
    fun getMainActivity(promise: Promise) {
        try {
            val activity = MainActivity::class.java.name
            promise.resolve(activity)
        } catch (e: Exception) {
            promise.resolve("undefined")
        }
    }

    @ReactMethod
    fun isLocked(promise: Promise) {
        try {
            val isLocked = isLockScreenDisabled
            promise.resolve(isLocked)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    private val isLockScreenDisabled: Boolean
        get() {
            val km =
                reactContext.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
            // boolean isLocked = km.inKeyguardRestrictedInputMode();
            // if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // Log.d("isLocked", "isLockScreenDisabled: isLocked " + isLocked + " ,, " +
            // km.isKeyguardSecure() +" , "+ km.isDeviceSecure());
            // }
            return km.isKeyguardLocked
        }

    @ReactMethod
    fun addListener(eventName: String?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun openActivity() {
        val intent = Intent(
            reactApplicationContext,
            CallScreenActivity::class.java
        )
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
    }

    companion object {
        const val CALL_SCREEN_ACTIVITY_STATE_CHANGE: String = "CALL_SCREEN_ACTIVITY_STATE_CHANGE"
        private var eventEmitter: DeviceEventManagerModule.RCTDeviceEventEmitter? = null

        @Synchronized
        fun callScreenStateChanged(state: String?) {
            Log.d("TAG", "callScreenStateChanged: emitting event callScreenStateChanged")
            eventEmitter!!.emit(CALL_SCREEN_ACTIVITY_STATE_CHANGE, state)
        }
    }
}