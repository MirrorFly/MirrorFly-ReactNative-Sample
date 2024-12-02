package com.mirrorfly_rn

import android.Manifest
import android.annotation.SuppressLint
import android.app.AppOpsManager
import android.app.KeyguardManager
import android.app.PictureInPictureParams
import android.content.Context
import android.content.SharedPreferences
import android.content.res.Configuration
import android.graphics.Color
import android.graphics.Rect
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.Process
import android.util.Log
import android.util.Rational
import android.view.KeyEvent
import androidx.annotation.RequiresApi
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.ReactActivity
import com.github.kevinejohn.keyevent.KeyEventModule

class CallScreenActivity : ReactActivity() {
    private val callScreenStateActive = "active"
    private var onCall: Boolean = false
    private var context: Context? = null
    private lateinit var sharedPreferences: SharedPreferences
    private var editor: SharedPreferences.Editor? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        Log.d("TAG", "onCreate: CallScreenActivityLL Creating")
        super.onCreate(null)
        this.context = this
        window.decorView.setBackgroundColor(Color.parseColor("#0D2852"))
        // Get SharedPreferences instance
        sharedPreferences = getSharedPreferences("MyPreferences", Context.MODE_PRIVATE)
        // Write to SharedPreferences
        editor = sharedPreferences.edit()
        onCall = sharedPreferences.getBoolean("onCall", false)

        // Register the activity with the ActivityManager
        ActivityManager.instance?.addActivity(this)
        isActive = true
    }

    override fun onResume() {
        isActive = true
        Log.d("TAG", "CallScreenActivity== CallScreenActivityOnResume: ")
        super.onResume()
        val permission = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
        val rational = ActivityCompat.shouldShowRequestPermissionRationale(
            this,
            Manifest.permission.RECORD_AUDIO
        )
        if (onCall) {
            window.decorView.setBackgroundColor(Color.parseColor("#F2F2F2"))
        }
        if (permission == -1 && rational && !onCall) {
            onCall = true
            editor?.putBoolean("onCall", true)
            editor?.commit()
        } else {
            if (permission != 0 && onCall && rational) {
                Handler(Looper.getMainLooper()).postDelayed({ finish() }, 100)
            } else {
                onCall = true
                editor?.putBoolean("onCall", true)
                editor?.commit()
            }
        }
        ActivityModule.callScreenStateChanged(callScreenStateActive)
    }

    override fun onPause() {
        isActive = false
        super.onPause()
        Log.d("TAG", "callScreenStateChanged: CallScreenActivity== CallScreenActivityOnPause: ")
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    override fun onStop() {
        isActive = false
        val isPip: Boolean = this.isInPictureInPictureMode
        Handler(Looper.getMainLooper()).postDelayed({
            val km: KeyguardManager =
                getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
            if (isPip && isCallConnected && !km.isDeviceLocked) {
                finish()
            }
        }, 130)
        super.onStop()
        Log.d("TAG", "CallScreenActivity== CallScreenActivityOnStop: ")
    }

    override fun onDestroy() {
        isActive = false
        Log.d("TAG", "onCreate: CallScreenActivityLL Destroying")
        // Unregister the activity from the ActivityManager
        ActivityManager.instance?.removeActivity(this)

        super.onDestroy()
        editor?.clear()
        editor?.commit()
        Log.d("TAG", "CallScreenActivity== CallScreenActivityOnDestroy: ")
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
                        window.decorView.getGlobalVisibleRect(sourceRectHint)
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


    override fun getMainComponentName(): String = "CallScreen"

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

    companion object {
        @JvmField
        var isCallConnected: Boolean = false
        var isActive: Boolean = false
    }
}