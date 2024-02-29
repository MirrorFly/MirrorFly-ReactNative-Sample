package com.mirrorfly_rn;


import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.PowerManager;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class RingtoneSilentKeyEventModule extends ReactContextBaseJavaModule {
    private BroadcastReceiver receiver;
    private String ACTION_VOLUME_CHANGED = "android.media.VOLUME_CHANGED_ACTION";

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
    public void startListening() {
        IntentFilter filter = new IntentFilter(Intent.ACTION_SCREEN_OFF);
        getReactApplicationContext().registerReceiver(receiver, filter);
    }

    @ReactMethod
    public void stopListening() {
        getReactApplicationContext().unregisterReceiver(receiver);
    }
}
