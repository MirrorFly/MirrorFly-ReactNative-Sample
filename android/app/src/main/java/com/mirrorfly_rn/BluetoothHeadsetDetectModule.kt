package com.mirrorfly_rn

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothHeadset
import android.bluetooth.BluetoothProfile
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class BluetoothHeadsetDetectModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), LifecycleEventListener {
    private var receiver: BroadcastReceiver
    private val bluetoothServiceListener: BluetoothProfile.ServiceListener =
        object : BluetoothProfile.ServiceListener {
            override fun onServiceConnected(
                i: Int,
                bluetoothProfile: BluetoothProfile
            ) {
                Log.d("TAG", "onServiceConnected: bluetoothServiceListener")
            }

            override fun onServiceDisconnected(i: Int) {
                AudioRoutingModule.stopBluetoothDevice()
                Log.d("TAG", "onServiceDisconnected: bluetoothServiceListener")
            }
        }

    @ReactMethod
    fun addListener(eventName: String?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    private fun onChange(deviceName: String) {
        // Report device name (if not empty) to the host
        val payload = Arguments.createMap()
        val deviceList = Arguments.createArray()
        if (deviceName.isNotEmpty()) {
            deviceList.pushString(deviceName)
        }
        payload.putArray("devices", deviceList)
        this.reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("onChange", payload)
    }

    init {
        val bluetoothAdapter = BluetoothAdapter.getDefaultAdapter()
        val intentFilter = IntentFilter()
        intentFilter.addAction(BluetoothHeadset.ACTION_CONNECTION_STATE_CHANGED)
        intentFilter.addAction(BluetoothHeadset.ACTION_AUDIO_STATE_CHANGED)
        this.receiver = object : BroadcastReceiver() {
            @SuppressLint("MissingPermission")
            override fun onReceive(context: Context, intent: Intent) {
                try {
                    val action = intent.action
                    if (action == BluetoothHeadset.ACTION_CONNECTION_STATE_CHANGED
                        || action == BluetoothHeadset.ACTION_AUDIO_STATE_CHANGED
                    ) {
                        // Bluetooth headset connection state has changed
                        val device =
                            intent.getParcelableExtra<BluetoothDevice>(BluetoothDevice.EXTRA_DEVICE)
                        val deviceName = device?.name
                        val state = intent.getIntExtra(
                            BluetoothProfile.EXTRA_STATE,
                            BluetoothProfile.STATE_DISCONNECTED
                        )
                        if (state == BluetoothProfile.STATE_CONNECTED) {
                            // Device has connected, report it
                            onChange(deviceName!!)
                        } else if (state == BluetoothProfile.STATE_DISCONNECTED) {
                            // Device has disconnected, report it
                            AudioRoutingModule.stopBluetoothDevice()
                            onChange("")
                        }
                    }
                } catch (ex: Exception) {
                    Log.d(
                        "TAG",
                        "onReceive: Error when processing bluetooth connect state change event ==>> $ex"
                    )
                }
            }
        }

        // Subscribe for intents
        reactContext.registerReceiver(this.receiver, intentFilter)
        Log.d("TAG", "BluetoothHeadsetDetectModule: receiver registered for event")
        val hasProxy = bluetoothAdapter.getProfileProxy(
            reactContext, bluetoothServiceListener,
            BluetoothProfile.HEADSET
        )
        Log.d("TAG", "BluetoothHeadsetDetectModule: hasProxy $hasProxy")
        // Subscribe for lifecycle
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName(): String {
        return "BluetoothHeadsetDetectModule"
    }

    @SuppressLint("ObsoleteSdkInt")
    override fun onHostResume() {
        val activity = currentActivity ?: return
        val audioManager = activity.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        var devices = arrayOfNulls<AudioDeviceInfo>(0)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            devices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS)
        }
        for (device in devices) {
            val type: Int
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                type = device!!.type

                if (type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP || type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO) {
                    // Device is found
                    val deviceName: String
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        deviceName = device.productName.toString()
                        onChange(deviceName)
                        return
                    }
                }
            }
        }
        // No devices found
        onChange("")
    }

    override fun onHostPause() {
    }

    override fun onHostDestroy() {
    }

    companion object {
        @ReactMethod
        fun getCurrentOutputDevice(context: Context): String {
            val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                // For Android Marshmallow (API level 23) and above
                getCurrentOutputDeviceMarshmallow(
                    audioManager
                )
            } else {
                // For versions below Marshmallow
                getCurrentOutputDevicePreMarshmallow(
                    audioManager
                )
            }
        }

        private fun getCurrentOutputDevicePreMarshmallow(audioManager: AudioManager): String {
            return if (audioManager.isBluetoothA2dpOn) {
                "Bluetooth A2DP"
            } else if (audioManager.isWiredHeadsetOn) {
                "Wired Headset"
            } else if (audioManager.isSpeakerphoneOn) {
                "Speakerphone"
            } else {
                "Unknown"
            }
        }

        @SuppressLint("ObsoleteSdkInt")
        private fun getCurrentOutputDeviceMarshmallow(audioManager: AudioManager): String {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                var devices = arrayOfNulls<AudioDeviceInfo>(0)
                devices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS)

                for (device in devices) {
                    if (device!!.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP) {
                        return "Bluetooth A2DP"
                    } else if (device.type == AudioDeviceInfo.TYPE_WIRED_HEADSET) {
                        return "Wired Headset"
                    } else if (device.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER) {
                        return "Built-in Speaker"
                    }
                }
                return "Unknown"
            }
            return "Unknown"
        }
    }
}
