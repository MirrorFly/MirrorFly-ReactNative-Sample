package com.mirrorfly_rn;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.content.pm.PackageManager;
import android.media.AudioManager;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = AudioRoutingModule.NAME)
public class AudioRoutingModule extends ReactContextBaseJavaModule {
    public static final String NAME = "AudioRoutingModule";
    private BluetoothAdapter bluetoothAdapter;
    public final String AUDIO_ROUTE_DEVICE_WIRED_HEADSET = "Headset";
    public final String AUDIO_ROUTE_DEVICE_BLUETOOTH_HEADSET = "Bluetooth";

    ReactApplicationContext reactApplicationContext;

    public AudioRoutingModule(ReactApplicationContext reactContext) {
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
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    }

    private Boolean checkIsBluetoothHeadsetConnected() {
        Boolean isBlHeadsetConnected = false;
        if (bluetoothAdapter.isEnabled()) {
            if (ActivityCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                // TODO: Consider calling
                //    ActivityCompat#requestPermissions
                // here to request the missing permissions, and then overriding
                //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
                //                                          int[] grantResults)
                // to handle the case where the user grants the permission. See the documentation
                // for ActivityCompat#requestPermissions for more details.
                return false;
            }
            int connectionState = bluetoothAdapter
                    .getProfileConnectionState(BluetoothProfile.HEADSET);

            if (connectionState == BluetoothProfile.STATE_CONNECTED) {
                isBlHeadsetConnected = true;
            }
        }
        return isBlHeadsetConnected;
    }

    private void routeAudioToWiredHeadset() {
        AudioManager audioManager = (AudioManager) reactApplicationContext.getSystemService(Context.AUDIO_SERVICE);
        // Unfortunately, there's no direct way to force routing to the wired headset.
        // This method focuses on disabling Bluetooth SCO, which is commonly used for call audio,
        // hoping the system will then route audio to the wired headset if connected.
        audioManager.setSpeakerphoneOn(false);
        audioManager.stopBluetoothSco();
        audioManager.setBluetoothScoOn(false);
        Log.d("TAG", "routeAudioToWiredHeadset: audio routed to Wired headset ");
    }

    private void routeAudioToBluetoothHeadset() {
        // checking whether bluetooth headset is connected or not
        Boolean isBluetoothConnected = checkIsBluetoothHeadsetConnected();
        Log.d("TAG", "routeAudioToBluetoothHeadset: isBluetoothConnected => " + isBluetoothConnected);
        if(isBluetoothConnected) {
            // route to bluetooth headset if available
            AudioManager audioManager = (AudioManager) reactApplicationContext.getSystemService(Context.AUDIO_SERVICE);
            audioManager.setSpeakerphoneOn(false);
            audioManager.startBluetoothSco();
            audioManager.setBluetoothScoOn(true);
            Log.d("TAG", "routeAudioToWiredHeadset: audio routed to Wired headset ");
        } else {
            // else route to wired headset
            routeAudioToWiredHeadset();
        }
    }

    @ReactMethod
    public void routeAudioTo(String routeName, Promise promise) {
        try {
            Log.d("TAG", "routeAudioTo: routing Audio To -> "+ routeName);
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
}


