package com.mirrorfly_rn

import android.app.AppOpsManager
import android.app.PictureInPictureParams
import android.content.Context
import android.content.Intent
import android.graphics.Rect
import android.net.Uri
import android.os.Build
import android.os.Process
import android.util.Log
import android.util.Rational
import androidx.lifecycle.Lifecycle
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.common.LifecycleState
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.mirrorfly_rn.PipAndroidModule
import java.util.Locale

@ReactModule(name = PipAndroidModule.NAME)
class PipAndroidModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    private var reactApplicationContext: ReactApplicationContext

    override fun canOverrideExistingModule(): Boolean {
        return true
    }

    init {
        Log.d("PIP", "Got the context")
        this.reactApplicationContext = reactContext
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    override fun getName(): String {
        return NAME
    }

    override fun initialize() {
        super.initialize()

        eventEmitter = getReactApplicationContext().getJSModule(
            DeviceEventManagerModule.RCTDeviceEventEmitter::class.java
        )
    }

    @ReactMethod
    fun enterPipMode(width: Int, height: Int, shouldOpenPermissionScreenIfPipNotAllowed: Boolean) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && currentActivity != null) {
                val appOpsManager =
                    currentActivity!!.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
                val isPipAllowedInSystem =
                    AppOpsManager.MODE_ALLOWED == appOpsManager.checkOpNoThrow(
                        AppOpsManager.OPSTR_PICTURE_IN_PICTURE,
                        Process.myUid(),
                        currentActivity!!.packageName
                    )
                if (isPipAllowedInSystem) {
                    if (currentActivity.toString().lowercase(Locale.getDefault())
                            .contains("callscreenactivity")
                        && !currentActivity!!.isInPictureInPictureMode && CallScreenActivity.isCallConnected
                    ) {
                        val ratWidth = if (width > 0) width else 380
                        val ratHeight = if (height > 0) height else 214

                        val ratio = Rational(ratWidth, ratHeight)
                        var pipBuilder: PictureInPictureParams.Builder? = null

                        pipBuilder = PictureInPictureParams.Builder()
                        val sourceRectHint = Rect()
                        this.currentActivity!!.window.decorView.getGlobalVisibleRect(sourceRectHint)
                        pipBuilder.setAspectRatio(ratio).build()
                        pipBuilder.setSourceRectHint(sourceRectHint)
                        reactApplicationContext.currentActivity!!.enterPictureInPictureMode(
                            pipBuilder.build()
                        )
                    }
                } else if (shouldOpenPermissionScreenIfPipNotAllowed) {
                    openPipSettings(reactApplicationContext)
                }
            }
        } catch (e: Exception) {
            Log.d("TAG", "Error in CallScreenActivity enterPipMode method: $e")
        }
    }

    companion object {
        const val NAME: String = "PipAndroid"
        const val PIP_MODE_CHANGE: String = "PIP_MODE_CHANGE"
        private var eventEmitter: DeviceEventManagerModule.RCTDeviceEventEmitter? = null

        fun pipModeChanged(
            isInPictureInPictureMode: Boolean?, currentState: Lifecycle.State,
            callScreenActivity: CallScreenActivity?
        ) {
            eventEmitter!!.emit(PIP_MODE_CHANGE, isInPictureInPictureMode)
        }

        fun openPipSettings(context: Context) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    Log.d("TAG", "openPipSettings: true opening settings")
                    val intent = Intent(
                        "android.settings.PICTURE_IN_PICTURE_SETTINGS",
                        Uri.parse("package:" + context.packageName)
                    )
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(intent)
                }
            } catch (ex: Exception) {
                Log.d("TAG", "openPipSettings: Error opening PIP settings$ex")
            }
        }
    }
}
