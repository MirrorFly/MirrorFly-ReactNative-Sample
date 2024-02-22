package com.mirrorfly_rn;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.AppOpsManager;
import android.app.PictureInPictureParams;
import android.app.PictureInPictureUiState;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Process;
import android.util.Log;
import android.util.Rational;
import android.view.KeyEvent;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.OnLifecycleEvent;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.github.kevinejohn.keyevent.KeyEventModule;

public class CallScreenActivity extends ReactActivity {
    public Boolean onCall = false;
    public static Boolean isCallConnected = false;
    public static Boolean isActive = false;
    SharedPreferences sharedPreferences = null;
    SharedPreferences.Editor editor = null;

    public Context context;

    private String CallScreenStateActive = "active";
    private String CallScreenStateBackground = "background";


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.d("TAG", "onCreate: CallScreenActivityLL Creating");
        super.onCreate(null);
        this.context = this;
       getWindow().getDecorView().setBackgroundColor(Color.parseColor("#0D2852"));
        // Get SharedPreferences instance
        sharedPreferences = getSharedPreferences("MyPreferences", Context.MODE_PRIVATE);
        // Write to SharedPreferences
        editor = sharedPreferences.edit();
        onCall = sharedPreferences.getBoolean("onCall", false);
        
        // Register the activity with the ActivityManager
        ActivityManager.getInstance().addActivity(this);
        CallScreenActivity.isActive = true;
    }

    @Override
    protected void onResume() {
        CallScreenActivity.isActive = true;
        Log.d("TAG", "CallScreenActivity== CallScreenActivityOnResume: ");
        super.onResume();
        Integer permission = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO);
        boolean rational = ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.RECORD_AUDIO);
       if(onCall){
           getWindow().getDecorView().setBackgroundColor(Color.parseColor("#F2F2F2"));
       }
        if (permission == -1 && rational && !onCall) {
            onCall = true;
            editor.putBoolean("onCall", true);
            editor.commit();
        } else {
            if (permission != 0 && onCall && rational) {
                new android.os.Handler().postDelayed(
                        new Runnable() {
                            public void run() {
                                finish();
                            }
                        }, 100);
            } else {
                onCall = true;
                editor.putBoolean("onCall", true);
                editor.commit();
            }
        }
        ActivityModule.callScreenStateChanged(CallScreenStateActive);
    }

    @Override
    protected void onPause() {
        CallScreenActivity.isActive = false;
        super.onPause();
        Log.d("TAG", "callScreenStateChanged: CallScreenActivity== CallScreenActivityOnPause: ");
    }

    @Override
    protected void onStop() {
        CallScreenActivity.isActive = false;
        super.onStop();
        Log.d("TAG", "CallScreenActivity== CallScreenActivityOnStop: ");
    }

    @Override
    protected void onDestroy() {
        CallScreenActivity.isActive = false;
        Log.d("TAG", "onCreate: CallScreenActivityLL Destroying");
        // Unregister the activity from the ActivityManager
        ActivityManager.getInstance().removeActivity(this);

        super.onDestroy();
        editor.clear();
        editor.commit();
        Log.d("TAG", "CallScreenActivity== CallScreenActivityOnDestroy: ");
    }

    @Override
    protected void onUserLeaveHint() {
        Log.d("TAG", "CallScreenActivity==  onUserLeaveHint: Happening");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AppOpsManager appOpsManager;
            appOpsManager = (AppOpsManager) this.getSystemService(Context.APP_OPS_SERVICE);
            Boolean isPipAllowedInSystem = AppOpsManager.MODE_ALLOWED == appOpsManager.checkOpNoThrow(AppOpsManager.OPSTR_PICTURE_IN_PICTURE, Process.myUid(), this.getPackageName());
            Log.d("TAG", "isPipAllowed: before validation " + isPipAllowedInSystem);
            if (isPipAllowedInSystem) {
                try {
                    Log.d("TAG", "enterPipMode: before validation ");
                    if (!this.isInPictureInPictureMode() && CallScreenActivity.isCallConnected) {


                        Rational ratio
                                = new Rational(300, 500);
                        PictureInPictureParams.Builder
                                pip_Builder
                                = null;

                        pip_Builder = new PictureInPictureParams
                                .Builder();
                        pip_Builder.setAspectRatio(ratio).build();
                        CallScreenActivity.this.enterPictureInPictureMode(pip_Builder.build());
                        Log.d("TAG", "_enterPipMode: PIP Enabled from Android Java");
                    }
                } catch (Exception e) {
                    Log.d("TAG", "Error in CallScreenActivity enterPipMode method: " + e);
                }
            }
        }
//        ActivityModule.callScreenStateChanged(CallScreenStateBackground);
        super.onUserLeaveHint();
    }

    /**
     * Returns the name of the main component registered from JavaScript. This is
     * used to schedule
     * rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "CallScreen";
    }

    @Override // <--- Addding this method for keyDown events
    public boolean onKeyDown(int keyCode, KeyEvent event) {

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
        KeyEventModule.getInstance().onKeyDownEvent(keyCode, event);

        // There are 2 ways this can be done:
        // 1. Override the default keyboard event behavior
        // super.onKeyDown(keyCode, event);
        // return true;

        // 2. Keep default keyboard event behavior
        // return super.onKeyDown(keyCode, event);

        // Using method #1 without blocking multiple
        super.onKeyDown(keyCode, event);
        return true;
    }

    @Override // <--- Addding this method for keyUp event
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        KeyEventModule.getInstance().onKeyUpEvent(keyCode, event);

        // There are 2 ways this can be done:
        // 1. Override the default keyboard event behavior
        // super.onKeyUp(keyCode, event);
        // return true;

        // 2. Keep default keyboard event behavior
        // return super.onKeyUp(keyCode, event);

        // Using method #1
        super.onKeyUp(keyCode, event);
        return true;
    }

    @Override
    public boolean onKeyMultiple(int keyCode, int repeatCount, KeyEvent event) {
        KeyEventModule.getInstance().onKeyMultipleEvent(keyCode, repeatCount, event);
        return super.onKeyMultiple(keyCode, repeatCount, event);
    }

    @SuppressLint("MissingSuperCall")
    @Override
    public void onPictureInPictureModeChanged(boolean isInPictureInPictureMode, Configuration newConfig) {
        PipAndroidModule.pipModeChanged(isInPictureInPictureMode, getLifecycle().getCurrentState(), this);
    }

   //  @Override
   //  public void onPictureInPictureUiStateChanged(@NonNull PictureInPictureUiState pipState) {
   //      super.onPictureInPictureUiStateChanged(pipState);
   //  }

    // public static class MainActivityDelegate extends ReactActivityDelegate {
    //     public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
    //         super(activity, mainComponentName);
    //     }

    //     @Override
    //     protected ReactRootView createRootView() {
    //         Log.d("TAG", "createRootView: ");
    //         ReactRootView reactRootView = new ReactRootView(getContext());
    //         // If you opted-in for the New Architecture, we enable the Fabric Renderer.
    //         reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
    //         return reactRootView;
    //     }

    //     @Override
    //     protected boolean isConcurrentRootEnabled() {
    //         // If you opted-in for the New Architecture, we enable Concurrent Root (i.e.
    //         // React 18).
    //         // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
    //         return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
    //     }
    // }
}