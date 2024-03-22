import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const RingtoneSilentKeyEventNativeModule = NativeModules.RingtoneSilentKeyEventModule;

class RingtoneSilentKeyEventModule {
   EventEmitter;

   constructor() {
      this.EventEmitter = Platform.OS === 'android' ? new NativeEventEmitter(RingtoneSilentKeyEventNativeModule) : null;
   }

   addEventListener = (listener) => {
      if(Platform.OS === 'android') {
         RingtoneSilentKeyEventNativeModule?.startListening();
         this.EventEmitter?.addListener('SILENT_BUTTON_PRESSED', listener);
      }
   }

   removeAllListeners = () => {
      if(Platform.OS === 'android') {
         RingtoneSilentKeyEventNativeModule?.stopListening();
         this.EventEmitter?.removeAllListeners('SILENT_BUTTON_PRESSED');
      }
   }
}

export default new RingtoneSilentKeyEventModule();
