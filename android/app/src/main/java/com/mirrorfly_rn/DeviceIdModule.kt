package com.mirrorfly_rn

import android.annotation.SuppressLint
import android.provider.Settings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactMethod

class DeviceIdModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "DeviceId"

    @SuppressLint("HardwareIds")
    @ReactMethod
    fun getDeviceID(promise: Promise) {
        try {
            val androidId = Settings.Secure.getString(
                reactContext.contentResolver,
                Settings.Secure.ANDROID_ID
            )
            promise.resolve(androidId)
        } catch (e: Exception) {
            promise.reject("DEVICE_ID_ERROR", "Failed to get Android ID", e)
        }
    }
}
