import { NativeModules, Platform } from 'react-native';

const AudioRoutingNativeModule = NativeModules.AudioRoutingModule;

/**
 * @typedef {'Headset'|'Bluetooth'} HeadsetRoute
 */

class AudioRoutingModule {
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
}

export default new AudioRoutingModule();
