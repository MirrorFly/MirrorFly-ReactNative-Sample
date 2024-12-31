package com.mirrorfly_rn

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class RingtoneSilentKeyEventModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    private val receiver: BroadcastReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action == Intent.ACTION_SCREEN_OFF) {
                // Power button pressed
                reactContext.getJSModule(
                    DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
                )
                    .emit("SILENT_BUTTON_PRESSED", true)
            }
        }
    }
    private var isRegistered = false

    override fun getName(): String {
        return "RingtoneSilentKeyEventModule"
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
    fun startListening() {
        isRegistered = true
        val filter = IntentFilter(Intent.ACTION_SCREEN_OFF)
        reactApplicationContext.registerReceiver(receiver, filter)
    }

    @ReactMethod
    fun stopListening() {
        if (java.lang.Boolean.TRUE == isRegistered) {
            reactApplicationContext.unregisterReceiver(receiver)
            isRegistered = false
        }
    }
}
