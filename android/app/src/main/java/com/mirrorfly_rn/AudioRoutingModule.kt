package com.mirrorfly_rn

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

@ReactModule(name = AudioRoutingModule.NAME)
class AudioRoutingModule(var reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    private val AUDIO_ROUTE_DEVICE_WIRED_HEADSET: String = "Headset"
    private val AUDIO_ROUTE_DEVICE_BLUETOOTH_HEADSET: String = "Bluetooth"

    override fun getName(): String {
        return NAME
    }

    override fun initialize() {
        super.initialize()
        audioManager =
            reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    }

    private val receiver: BroadcastReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val isSilent = isSilentModeEnabled(
                audioManager!!
            )
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onSilentModeStatusChange", isSilent)
        }
    }

    private fun checkIsBluetoothHeadsetConnected(): Boolean {
        var isBlHeadsetConnected = false
        val bluetoothManager = reactContext
            .getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        bluetoothAdapter = bluetoothManager.adapter
        // Checking if the bluetoothAdapter is enabled or not
        if (bluetoothAdapter.isEnabled) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (ActivityCompat.checkSelfPermission(
                        reactContext,
                        Manifest.permission.BLUETOOTH_CONNECT
                    ) != PackageManager.PERMISSION_GRANTED
                ) {
                    return false
                }
            } else {
                if (ActivityCompat.checkSelfPermission(
                        reactContext,
                        Manifest.permission.BLUETOOTH
                    ) != PackageManager.PERMISSION_GRANTED
                ) {
                    return false
                }
            }

            val connectionState = bluetoothAdapter
                .getProfileConnectionState(BluetoothProfile.HEADSET)
            if (connectionState == BluetoothProfile.STATE_CONNECTED
                || connectionState == BluetoothProfile.STATE_CONNECTING
            ) {
                isBlHeadsetConnected = true
            }
        }
        return isBlHeadsetConnected
    }

    private fun routeAudioToWiredHeadset() {
        // Unfortunately, there's no direct way to force routing to the wired headset.
        // This method focuses on disabling Bluetooth SCO, which is commonly used for call audio,
        // hoping the system will then route audio to the wired headset if connected.
        audioManager!!.stopBluetoothSco()
        audioManager!!.isBluetoothScoOn = false
        audioManager!!.isSpeakerphoneOn = false
        audioManager!!.mode = AudioManager.MODE_IN_COMMUNICATION
        Log.d("TAG", "routeAudioToWiredHeadset: audio routed to Wired headset ")
    }

    private fun routeAudioToBluetoothHeadset() {
        // checking whether bluetooth headset is connected or not
        val isBluetoothConnected = checkIsBluetoothHeadsetConnected()
        Log.d(
            "TAG",
            "routeAudioToBluetoothHeadset: isBluetoothConnected => $isBluetoothConnected"
        )
        if (isBluetoothConnected) {
            // route to bluetooth headset if available
            audioManager!!.startBluetoothSco()
            audioManager!!.isBluetoothScoOn = true
            audioManager!!.isSpeakerphoneOn = false
            audioManager!!.mode = AudioManager.MODE_IN_COMMUNICATION
            Log.d("TAG", "routeAudioToBluetoothHeadset: audio routed to Bluetooth headset ")
        } else {
            // else route to wired headset
            routeAudioToWiredHeadset()
        }
    }

    @ReactMethod
    fun routeAudioTo(routeName: String, promise: Promise) {
        try {
            Log.d("TAG", "routeAudioTo: routing Audio To -> $routeName")
            when (routeName) {
                AUDIO_ROUTE_DEVICE_WIRED_HEADSET -> {
                    routeAudioToWiredHeadset()
                    return
                }

                AUDIO_ROUTE_DEVICE_BLUETOOTH_HEADSET -> {
                    routeAudioToBluetoothHeadset()
                    return
                }
            }
            promise.resolve(true)
        } catch (ex: Exception) {
            Log.d(
                "TAG",
                "routeAudioTo: Error while routing audio to $routeName ==>> $ex"
            )
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun getAudioRoutes(promise: Promise) {
        try {
            val devices = Arguments.createArray()
            val typeChecker = ArrayList<String>()
            val audioDeviceInfo =
                audioManager!!.getDevices(AudioManager.GET_DEVICES_INPUTS + AudioManager.GET_DEVICES_OUTPUTS)
            val selectedAudioRoute = getSelectedAudioRoute(audioManager!!)
            for (device in audioDeviceInfo) {
                val type = getAudioRouteType(device.type)
                if (type != null && !typeChecker.contains(type)) {
                    val deviceInfo = Arguments.createMap()
                    deviceInfo.putString("name", type)
                    deviceInfo.putString("type", type)
                    if (type == selectedAudioRoute) {
                        deviceInfo.putBoolean("selected", true)
                    }
                    typeChecker.add(type)
                    devices.pushMap(deviceInfo)
                }
            }
            promise.resolve(devices)
        } catch (e: Exception) {
            promise.reject("GetAudioRoutes Error", e.message)
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

    private fun getSelectedAudioRoute(audioManager: AudioManager): String {
        if (audioManager.isBluetoothScoOn) {
            return "Bluetooth"
        }
        if (audioManager.isSpeakerphoneOn) {
            return "Speaker"
        }
        if (audioManager.isWiredHeadsetOn) {
            return "Headset"
        }
        return "Phone"
    }

    @ReactMethod
    fun startObserving() {
        val filter = IntentFilter()
        val actions = arrayOf(
            AudioManager.RINGER_MODE_CHANGED_ACTION,
            "android.media.VOLUME_CHANGED_ACTION"
        )

        for (action in actions) {
            filter.addAction(action)
        }

        reactContext.registerReceiver(receiver, filter)
    }

    @ReactMethod
    fun stopObserving() {
        reactContext.unregisterReceiver(receiver)
    }

    fun isSilentModeEnabled(audioManager: AudioManager): Boolean {
        val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
        return when (audioManager.ringerMode) {
            AudioManager.RINGER_MODE_SILENT -> true
            AudioManager.RINGER_MODE_VIBRATE -> true
            AudioManager.RINGER_MODE_NORMAL -> {
                currentVolume == 0
            }

            else -> false
        }
    }

    companion object {
        const val NAME: String = "AudioRoutingModule"
        lateinit var bluetoothAdapter: BluetoothAdapter
        private var audioManager: AudioManager? = null
        fun stopBluetoothDevice() {
            audioManager!!.stopBluetoothSco()
            audioManager!!.isBluetoothScoOn = false
        }

        fun getAudioRouteType(type: Int): String? {
            return when (type) {
                (AudioDeviceInfo.TYPE_BLUETOOTH_A2DP), (AudioDeviceInfo.TYPE_BLUETOOTH_SCO) -> "Bluetooth"
                (AudioDeviceInfo.TYPE_WIRED_HEADPHONES), (AudioDeviceInfo.TYPE_WIRED_HEADSET) -> "Headset"
                (AudioDeviceInfo.TYPE_BUILTIN_MIC) -> "Phone"
                (AudioDeviceInfo.TYPE_BUILTIN_SPEAKER) -> "Speaker"
                else -> null
            }
        }
    }
}


