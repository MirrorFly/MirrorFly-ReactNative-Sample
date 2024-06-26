import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const AudioRoutingNativeModule = NativeModules.AudioRoutingModule;

/**
 * @typedef {'Headset'|'Bluetooth'} HeadsetRoute
 */

class AudioRoutingModule {
   silentModeDetectorEventEmitter;
   constructor() {
      this.silentModeDetectorEventEmitter =
         Platform.OS === 'android' ? new NativeEventEmitter(AudioRoutingNativeModule) : null;
   }

   /**
    * @param {HeadsetRoute} routeName - route to be navigated to
    * @returns {Promise<boolean>} return true if the routing has successfully done else returns false
    */
   routeAudioTo = routeName => {
      if (Platform.OS === 'android') {
         return AudioRoutingNativeModule?.routeAudioTo(routeName);
      }
   };

   /**
    *
    * @returns {routes} return true if the routing has successfully done else returns false
    */
   getAudioRoutes = () => {
      if (Platform.OS === 'android') {
         return AudioRoutingNativeModule?.getAudioRoutes();
      }
   };

   startVibrateEvent = callback => {
      if (Platform.OS === 'android') {
         AudioRoutingNativeModule.startObserving();
      }
      this.silentModeDetectorEventEmitter.addListener('onSilentModeStatusChange', callback);
      return this.removeAllListeners;
   };

   removeAllListeners = () => {
      if (Platform.OS === 'android') {
         AudioRoutingNativeModule.stopObserving();
      }
      this.silentModeDetectorEventEmitter.removeAllListeners('onSilentModeStatusChange');
   };
}

export default new AudioRoutingModule();
