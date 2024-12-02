package com.mirrorfly_rn

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class MFModule : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        val modules: MutableList<NativeModule> = ArrayList()
        modules.add(ActivityModule(reactContext))
        modules.add(PipAndroidModule(reactContext))
        modules.add(AudioRoutingModule(reactContext))
        modules.add(BluetoothHeadsetDetectModule(reactContext))
        modules.add(RingtoneSilentKeyEventModule(reactContext))
        return modules
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}

