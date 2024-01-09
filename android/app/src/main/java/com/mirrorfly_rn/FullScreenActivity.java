package com.mirrorfly_rn;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;

// KeyEvent
import android.view.KeyEvent;

import com.github.kevinejohn.keyevent.KeyEventModule;

public class FullScreenActivity extends ReactActivity {
    SharedPreferences sharedPreferences = null;
    SharedPreferences.Editor editor = null;
    public Boolean onCall = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(null);
        getWindow().getDecorView().setBackgroundColor(Color.parseColor("#0D2852"));
        // Get SharedPreferences instance
        sharedPreferences = getSharedPreferences("MyPreferences", Context.MODE_PRIVATE);
        // Write to SharedPreferences
        editor = sharedPreferences.edit();
        onCall = sharedPreferences.getBoolean("onCall", false);
    }

    @Override
    protected void onResume() {
        super.onResume();
        Integer permission = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO);
        boolean rational = ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.RECORD_AUDIO);
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
    }

    @Override
    protected void onPause() {
        super.onPause();
        Log.d("TAG", "FullScreenActivityonPause: ");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        editor.clear();
        editor.commit();
        Log.d("TAG", "FullScreenActivityonDestroy: ");
    }

    /**
     * Returns the name of the main component registered from JavaScript. This is
     * used to schedule
     * rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "IncomingCall";
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

    // @Override
    // protected ReactActivityDelegate createReactActivityDelegate() {
    // return new MainActivityDelegate(this, getMainComponentName());
    // }

    public static class MainActivityDelegate extends ReactActivityDelegate {
        public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
            super(activity, mainComponentName);
        }

        @Override
        protected ReactRootView createRootView() {
            Log.d("TAG", "createRootView: ");
            ReactRootView reactRootView = new ReactRootView(getContext());
            // If you opted-in for the New Architecture, we enable the Fabric Renderer.
            reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
            return reactRootView;
        }

        @Override
        protected boolean isConcurrentRootEnabled() {
            // If you opted-in for the New Architecture, we enable Concurrent Root (i.e.
            // React 18).
            // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
            return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }
    }
}