package com.mirrorfly_rn;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothHeadset;
import android.bluetooth.BluetoothProfile;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.media.AudioDeviceInfo;
import android.media.AudioManager;
import android.os.Build;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class BluetoothHeadsetDetectModule extends ReactContextBaseJavaModule implements LifecycleEventListener {

    BroadcastReceiver receiver;
    private BluetoothProfile.ServiceListener bluetoothServiceListener;
    @ReactMethod
    public static String getCurrentOutputDevice(Context context) {
        AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // For Android Marshmallow (API level 23) and above
            return getCurrentOutputDeviceMarshmallow(audioManager);
        } else {
            // For versions below Marshmallow
            return getCurrentOutputDevicePreMarshmallow(audioManager);
        }
    }

    private static String getCurrentOutputDevicePreMarshmallow(AudioManager audioManager) {
        if (audioManager.isBluetoothA2dpOn()) {
            return "Bluetooth A2DP";
        } else if (audioManager.isWiredHeadsetOn()) {
            return "Wired Headset";
        } else if (audioManager.isSpeakerphoneOn()) {
            return "Speakerphone";
        } else {
            return "Unknown";
        }
    }

    @ReactMethod
    public void addListener(String eventName) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    private static String getCurrentOutputDeviceMarshmallow(AudioManager audioManager) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            AudioDeviceInfo[] devices = new AudioDeviceInfo[0];
            devices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS);

            for (AudioDeviceInfo device : devices) {
                if (device.getType() == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP) {
                    return "Bluetooth A2DP";
                } else if (device.getType() == AudioDeviceInfo.TYPE_WIRED_HEADSET) {
                    return "Wired Headset";
                } else if (device.getType() == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER) {
                    return "Built-in Speaker";
                }
            }
            return "Unknown";
        }
        return "Unknown";
    }

    private void onChange(final String deviceName) {
        // Report device name (if not empty) to the host
        WritableMap payload = Arguments.createMap();
        WritableArray deviceList = Arguments.createArray();
        if (!deviceName.isEmpty()) {
            deviceList.pushString(deviceName);
        }
        payload.putArray("devices", deviceList);
        this.getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onChange", payload);
    }

    @SuppressLint("MissingPermission")
    public BluetoothHeadsetDetectModule(ReactApplicationContext reactContext) {
        super(reactContext);
        bluetoothServiceListener = new BluetoothProfile.ServiceListener() {
            @Override
            public void onServiceConnected(int i, BluetoothProfile bluetoothProfile) {
                Log.d("TAG", "onServiceConnected: bluetoothServiceListener");
            }

            @Override
            public void onServiceDisconnected(int i) {
                AudioRoutingModule.stopBluetoothDevice();
                Log.d("TAG", "onServiceDisconnected: bluetoothServiceListener");
            }
        };
        final BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(BluetoothHeadset.ACTION_CONNECTION_STATE_CHANGED);
        intentFilter.addAction(BluetoothHeadset.ACTION_AUDIO_STATE_CHANGED);
        this.receiver = new BroadcastReceiver() {
            @SuppressLint("MissingPermission")
            @Override
            public void onReceive(Context context, Intent intent) {
                try {
                    final String action = intent.getAction();
                    if (action.equals(BluetoothHeadset.ACTION_CONNECTION_STATE_CHANGED)
                            || action.equals(BluetoothHeadset.ACTION_AUDIO_STATE_CHANGED)) {
                        // Bluetooth headset connection state has changed
                        BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                        String deviceName = device != null ? device.getName() : null;
                        final int state = intent.getIntExtra(BluetoothProfile.EXTRA_STATE,
                                BluetoothProfile.STATE_DISCONNECTED);
                        if (state == BluetoothProfile.STATE_CONNECTED) {
                            // Device has connected, report it
                            onChange(deviceName);
                        } else if (state == BluetoothProfile.STATE_DISCONNECTED) {
                            // Device has disconnected, report it
                            AudioRoutingModule.stopBluetoothDevice();
                            onChange("");
                        }
                    }
                } catch (Exception ex) {
                    Log.d("TAG", "onReceive: Error when processing bluetooth connect state change event ==>> " + ex);
                }
            }
        };

        // Subscribe for intents
        reactContext.registerReceiver(this.receiver, intentFilter);
        Log.d("TAG", "BluetoothHeadsetDetectModule: receiver registered for event");
        Boolean hasProxy = bluetoothAdapter.getProfileProxy(reactContext, bluetoothServiceListener,
                BluetoothProfile.HEADSET);
        Log.d("TAG", "BluetoothHeadsetDetectModule: hasProxy " + hasProxy);
        // Subscribe for lifecycle
        reactContext.addLifecycleEventListener(this);
    }

    @Override
    public String getName() {
        return "BluetoothHeadsetDetectModule";
    }

    @Override
    public void onHostResume() {
        final Activity activity = getCurrentActivity();
        if (activity == null) {
            return;
        }
        final AudioManager audioManager = (AudioManager) activity.getSystemService(Context.AUDIO_SERVICE);
        AudioDeviceInfo[] devices = new AudioDeviceInfo[0];
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            devices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS);
        }
        for (AudioDeviceInfo device : devices) {
            final int type;
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                type = device.getType();

                if (type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP || type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO) {
                    // Device is found
                    final String deviceName;
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                        deviceName = device.getProductName().toString();
                        onChange(deviceName);
                        return;
                    }
                }
            }
        }
        // No devices found
        onChange("");
    }

    @Override
    public void onHostPause() {
    }

    @Override
    public void onHostDestroy() {
    }
}
