package com.mirrorfly_rn;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
/** Add this */
import android.os.Bundle;
import android.view.KeyEvent;
import com.github.kevinejohn.keyevent.KeyEventModule;

public class MainActivity extends ReactActivity {
  /**
   * Add this for fixing crash issue https://stackoverflow.com/a/57712204
   */
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is
   * used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "mirrorfly_rn";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util
   * class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and
   * Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }

  @Override // <--- Add this method for keyDown events
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

  @Override // <--- Add this method for keyUp event
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

  @Override // <--- Add this method for multiple key event
  public boolean onKeyMultiple(int keyCode, int repeatCount, KeyEvent event) {
    KeyEventModule.getInstance().onKeyMultipleEvent(keyCode, repeatCount, event);
    return super.onKeyMultiple(keyCode, repeatCount, event);
  }
}
