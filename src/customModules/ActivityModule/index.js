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

   updateCallConnectedStatus = isConnected => {
      if (Platform.OS === 'android') {
         nativeActivityModule?.updateCallConnectedStatus?.(isConnected);
      }
   };

   closeActivity = () => {
      if (Platform.OS === 'android') {
         nativeActivityModule?.closeActivity?.();
      }
   };

   openActivity = () => {
      if (Platform.OS === 'android') {
         nativeActivityModule?.openActivity?.();
      }
   };

   getActivity = () => {
      if (Platform.OS === 'android') {
         return nativeActivityModule?.getActivity?.();
      }
   };

   isLocked = () => {
      if (Platform.OS === 'android') {
         return nativeActivityModule?.isLocked?.();
      }
   };

   getCallActivity = () =>{
      if (Platform.OS === 'android') {
         return nativeActivityModule?.getCallActivity?.();
      }
   }
}

export default new ActivityModule();
