package com.mirrorfly_rn;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.media.AudioDeviceInfo;
import android.media.AudioManager;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.ArrayList;

@ReactModule(name = AudioRoutingModule.NAME)
public class AudioRoutingModule extends ReactContextBaseJavaModule {
    public static final String NAME = "AudioRoutingModule";
    private static BluetoothAdapter bluetoothAdapter;
    private static AudioManager audioManager;
    public final String AUDIO_ROUTE_DEVICE_WIRED_HEADSET = "Headset";
    public final String AUDIO_ROUTE_DEVICE_BLUETOOTH_HEADSET = "Bluetooth";

    ReactApplicationContext reactApplicationContext;

    public AudioRoutingModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactApplicationContext = reactContext;
    }

    public static void stopBluetoothDevice() {
        audioManager.stopBluetoothSco();
        audioManager.setBluetoothScoOn(false);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @Override
    public void initialize() {
        super.initialize();
        audioManager = (AudioManager) reactApplicationContext.getSystemService(Context.AUDIO_SERVICE);
    }

    private final BroadcastReceiver receiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            boolean isSilent = isSilentModeEnabled(audioManager);
            reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onSilentModeStatusChange", isSilent);
        }
    };

    private Boolean checkIsBluetoothHeadsetConnected() {
        Boolean isBlHeadsetConnected = false;
        BluetoothManager bluetoothManager = (BluetoothManager) this.reactApplicationContext
                .getSystemService(Context.BLUETOOTH_SERVICE);
        bluetoothAdapter = bluetoothManager.getAdapter();
        // Checking if the bluetoothAdapter is enabled or not
        if (bluetoothAdapter.isEnabled()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (ActivityCompat.checkSelfPermission(reactApplicationContext,
                        Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                    return false;
                }
            } else {
                if (ActivityCompat.checkSelfPermission(reactApplicationContext,
                        Manifest.permission.BLUETOOTH) != PackageManager.PERMISSION_GRANTED) {
                    return false;
                }
            }

            int connectionState = bluetoothAdapter
                    .getProfileConnectionState(BluetoothProfile.HEADSET);
            if (connectionState == BluetoothProfile.STATE_CONNECTED
                    || connectionState == BluetoothProfile.STATE_CONNECTING) {
                isBlHeadsetConnected = true;
            }
        }
        return isBlHeadsetConnected;
    }

    private void routeAudioToWiredHeadset() {
        // Unfortunately, there's no direct way to force routing to the wired headset.
        // This method focuses on disabling Bluetooth SCO, which is commonly used for call audio,
        // hoping the system will then route audio to the wired headset if connected.
        audioManager.stopBluetoothSco();
        audioManager.setBluetoothScoOn(false);
        audioManager.setSpeakerphoneOn(false);
        audioManager.setMode(AudioManager.MODE_IN_COMMUNICATION);
        Log.d("TAG", "routeAudioToWiredHeadset: audio routed to Wired headset ");
    }

    private void routeAudioToBluetoothHeadset() {
        // checking whether bluetooth headset is connected or not
        Boolean isBluetoothConnected = checkIsBluetoothHeadsetConnected();
        Log.d("TAG", "routeAudioToBluetoothHeadset: isBluetoothConnected => " + isBluetoothConnected);
        if (Boolean.TRUE.equals(isBluetoothConnected)) {
            // route to bluetooth headset if available
            audioManager.startBluetoothSco();
            audioManager.setBluetoothScoOn(true);
            audioManager.setSpeakerphoneOn(false);
            audioManager.setMode(AudioManager.MODE_IN_COMMUNICATION);
            Log.d("TAG", "routeAudioToBluetoothHeadset: audio routed to Bluetooth headset ");
        } else {
            // else route to wired headset
            routeAudioToWiredHeadset();
        }
    }

    @ReactMethod
    public void routeAudioTo(String routeName, Promise promise) {
        try {
            Log.d("TAG", "routeAudioTo: routing Audio To -> " + routeName);
            switch (routeName) {
                case AUDIO_ROUTE_DEVICE_WIRED_HEADSET:
                    routeAudioToWiredHeadset();
                    return;
                case AUDIO_ROUTE_DEVICE_BLUETOOTH_HEADSET:
                    routeAudioToBluetoothHeadset();
                    return;
            }
            promise.resolve(true);
        } catch (Exception ex) {
            Log.d("TAG", "routeAudioTo: Error while routing audio to " + routeName + " ==>> " + ex);
            promise.resolve(false);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    @ReactMethod
    public void getAudioRoutes(Promise promise) {
        try {
            WritableArray devices = Arguments.createArray();
            ArrayList<String> typeChecker = new ArrayList<>();
            AudioDeviceInfo[] audioDeviceInfo = audioManager.getDevices(AudioManager.GET_DEVICES_INPUTS + AudioManager.GET_DEVICES_OUTPUTS);
            String selectedAudioRoute = getSelectedAudioRoute(audioManager);
            for (AudioDeviceInfo device : audioDeviceInfo) {
                String type = getAudioRouteType(device.getType());
                if (type != null && !typeChecker.contains(type)) {
                    WritableMap deviceInfo = Arguments.createMap();
                    deviceInfo.putString("name", type);
                    deviceInfo.putString("type", type);
                    if (type.equals(selectedAudioRoute)) {
                        deviceInfo.putBoolean("selected", true);
                    }
                    typeChecker.add(type);
                    devices.pushMap(deviceInfo);
                }
            }
            promise.resolve(devices);
        } catch (Exception e) {
            promise.reject("GetAudioRoutes Error", e.getMessage());
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

    private String getSelectedAudioRoute(AudioManager audioManager) {
        if (audioManager.isBluetoothScoOn()) {
            return "Bluetooth";
        }
        if (audioManager.isSpeakerphoneOn()) {
            return "Speaker";
        }
        if (audioManager.isWiredHeadsetOn()) {
            return "Headset";
        }
        return "Phone";
    }

    public static String getAudioRouteType(int type) {
        switch (type) {
            case (AudioDeviceInfo.TYPE_BLUETOOTH_A2DP):
            case (AudioDeviceInfo.TYPE_BLUETOOTH_SCO):
                return "Bluetooth";
            case (AudioDeviceInfo.TYPE_WIRED_HEADPHONES):
            case (AudioDeviceInfo.TYPE_WIRED_HEADSET):
                return "Headset";
            case (AudioDeviceInfo.TYPE_BUILTIN_MIC):
                return "Phone";
            case (AudioDeviceInfo.TYPE_BUILTIN_SPEAKER):
                return "Speaker";
            default:
                return null;
        }
    }

    public static boolean isSilentModeEnabled(AudioManager audioManager) {
        int currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC);
        switch (audioManager.getRingerMode()) {
            case AudioManager.RINGER_MODE_SILENT:
                return true;
            case AudioManager.RINGER_MODE_VIBRATE:
                return true;
            case AudioManager.RINGER_MODE_NORMAL:
                if (currentVolume == 0) {
                    return true;
                }
                return false;
            default:
                return false;
        }
    }

    @ReactMethod
    public void startObserving() {
        IntentFilter filter = new IntentFilter();
        String[] actions = {
            AudioManager.RINGER_MODE_CHANGED_ACTION,
            "android.media.VOLUME_CHANGED_ACTION"
        };

        for (String action : actions) {
            filter.addAction(action);
        }

        reactApplicationContext.registerReceiver(receiver, filter);
    }

    @ReactMethod
    public void stopObserving() {
        reactApplicationContext.unregisterReceiver(receiver);
    }
}


