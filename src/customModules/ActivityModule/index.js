import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const nativeActivityModule = NativeModules.ActivityModule;

class ActivityModule {
   EventEmitter;

   constructor() {
      this.EventEmitter = Platform.OS === 'android' ? new NativeEventEmitter(nativeActivityModule) : null;
   }

   onCallScreenStateChange = listener => {
      return this?.EventEmitter?.addListener('CALL_SCREEN_ACTIVITY_STATE_CHANGE', listener);
   };
}

export default new ActivityModule();
