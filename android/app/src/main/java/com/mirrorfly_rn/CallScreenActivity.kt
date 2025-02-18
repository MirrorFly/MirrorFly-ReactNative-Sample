package com.mirrorfly_rn

import android.annotation.SuppressLint
import android.app.AppOpsManager
import android.app.KeyguardManager
import android.app.PictureInPictureParams
import android.content.Context
import android.content.Intent
import android.content.res.Configuration
import android.graphics.Color
import android.graphics.Rect
import android.os.Build
import android.os.Bundle
import android.os.Process
import android.util.Log
import android.util.Rational
import android.view.KeyEvent
import androidx.annotation.RequiresApi
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.github.kevinejohn.keyevent.KeyEventModule
import com.mirrorfly_rn.ActivityModule.Companion.reactModuleContext

class CallScreenActivity : ReactActivity(), LifecycleEventListener {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
        Log.d("TAG", "onCreate: CallScreenActivity Create")
        reactModuleContext?.addLifecycleEventListener(this)
        this.window.decorView.setBackgroundColor(Color.parseColor("#0D2852"))
        // Register the activity with the ActivityManager
        ActivityManager.instance?.addActivity(this)
    }

    override fun getMainComponentName(): String = "CallScreen"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
    }

    override fun onResume() {
        Log.d("TAG", "onResume: CallScreenActivity Resume")
        super.onResume()
    }

    override fun onPause() {
        Log.d("TAG", "onPause: CallScreenActivity Pause")
        super.onPause()
    }

    override fun onStop() {
        Log.d("TAG", "onStop: CallScreenActivity OnStop")
        super.onStop()
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d("TAG", "onDestroy: CallScreenActivity Destroy")
        // Unregister the activity from the ActivityManager
        reactInstanceManager.onHostDestroy(this)
        ActivityManager.instance?.removeActivity(this)
    }

    override fun onUserLeaveHint() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val appOpsManager: AppOpsManager =
                this.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val isPipAllowedInSystem = AppOpsManager.MODE_ALLOWED == appOpsManager.checkOpNoThrow(
                AppOpsManager.OPSTR_PICTURE_IN_PICTURE, Process.myUid(),
                this.packageName
            )
            if (isPipAllowedInSystem) {
                try {
                    if (!this.isInPictureInPictureMode && isCallConnected) {
                        val ratio = Rational(300, 500)
                        var pipBuilder: PictureInPictureParams.Builder? = null

                        pipBuilder = PictureInPictureParams.Builder()
                        val sourceRectHint = Rect()
                        this.window.decorView.getGlobalVisibleRect(sourceRectHint)
                        pipBuilder.setAspectRatio(ratio).build()
                        pipBuilder.setSourceRectHint(sourceRectHint)
                        this@CallScreenActivity.enterPictureInPictureMode(pipBuilder.build())
                    }
                } catch (e: Exception) {
                    Log.d("TAG", "Error in CallScreenActivity enterPipMode method: $e")
                }
            }
        }
        super.onUserLeaveHint()
    }

    // <--- Addding this method for keyDown events
    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        // A. Prevent multiple events on long button press
        // In the default behavior multiple events are fired if a button
        // is pressed for a while. You can prevent this behavior if you
        // forward only the first event:
        // if (event.getRepeatCount() == 0) {
        // KeyEventModule.getInstance().onKeyDownEvent(keyCode, event);
        // }
        //
        // B. If multiple Events shall be fired when the button is pressed
        // for a while use this code:
        // KeyEventModule.getInstance().onKeyDownEvent(keyCode, event);
        //
        // Using B.

        KeyEventModule.getInstance().onKeyDownEvent(keyCode, event)

        // There are 2 ways this can be done:
        // 1. Override the default keyboard event behavior
        // super.onKeyDown(keyCode, event);
        // return true;

        // 2. Keep default keyboard event behavior
        // return super.onKeyDown(keyCode, event);

        // Using method #1 without blocking multiple
        super.onKeyDown(keyCode, event)
        return true
    }

    // <--- Addding this method for keyUp event
    override fun onKeyUp(keyCode: Int, event: KeyEvent): Boolean {
        KeyEventModule.getInstance().onKeyUpEvent(keyCode, event)

        // There are 2 ways this can be done:
        // 1. Override the default keyboard event behavior
        // super.onKeyUp(keyCode, event);
        // return true;

        // 2. Keep default keyboard event behavior
        // return super.onKeyUp(keyCode, event);

        // Using method #1
        super.onKeyUp(keyCode, event)
        return true
    }

    override fun onKeyMultiple(keyCode: Int, repeatCount: Int, event: KeyEvent): Boolean {
        KeyEventModule.getInstance().onKeyMultipleEvent(keyCode, repeatCount, event)
        return super.onKeyMultiple(keyCode, repeatCount, event)
    }

    @SuppressLint("MissingSuperCall")
    override fun onPictureInPictureModeChanged(
        isInPictureInPictureMode: Boolean,
        newConfig: Configuration
    ) {
        PipAndroidModule.pipModeChanged(
            isInPictureInPictureMode, lifecycle.currentState,
            this
        )
    }

    override fun onHostDestroy() {}

    @RequiresApi(Build.VERSION_CODES.N)
    override fun onHostPause() {
        val km: KeyguardManager =
            getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        if (isInPictureInPictureMode && !km.isKeyguardLocked) {
            reactInstanceManager.onHostResume(this)
        }
    }

    override fun onHostResume() {}

    companion object {
        @JvmField
        var isCallConnected: Boolean = false
    }
}