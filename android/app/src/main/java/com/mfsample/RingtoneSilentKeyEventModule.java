package com.mfsample;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class RingtoneSilentKeyEventModule extends ReactContextBaseJavaModule {
    private final BroadcastReceiver receiver;
    private final String ACTION_VOLUME_CHANGED = "android.media.VOLUME_CHANGED_ACTION";
    private Boolean isRegistered = false;

    public RingtoneSilentKeyEventModule(ReactApplicationContext reactContext) {
        super(reactContext);
        receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent.getAction().equals(Intent.ACTION_SCREEN_OFF)) {
                    // Power button pressed
                    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("SILENT_BUTTON_PRESSED", true);
                }
            }
        };
    }

    @Override
    public String getName() {
        return "RingtoneSilentKeyEventModule";
    }
    
    @ReactMethod
    public void addListener(String eventName) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void startListening() {
        isRegistered = true;
        IntentFilter filter = new IntentFilter(Intent.ACTION_SCREEN_OFF);
        getReactApplicationContext().registerReceiver(receiver, filter);
    }

    @ReactMethod
    public void stopListening() {
        if (Boolean.TRUE.equals(isRegistered)) {
            getReactApplicationContext().unregisterReceiver(receiver);
            isRegistered = false;
        }
    }
}
