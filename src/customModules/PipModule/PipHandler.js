import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

class PipHandler {
   EventEmitter;

   constructor() {
      this.EventEmitter = Platform.OS === 'android' ? new NativeEventEmitter(NativeModules.PipAndroid) : null;
   }

   onPipModeChanged(listener) {
      return this?.EventEmitter?.addListener('PIP_MODE_CHANGE', listener);
   }

   /**
    * Call this method from any component to enter the pip mode.
    * This method accepts two integers, width and height, which have default values,
    * when invoked without passing them
    *
    * @param width
    * @param height
    * @param shouldOpenPermissionScreenIfPipNotAllowed - Should open PIP permission screen if PIP is disabled in the  premission settings
    * @example
    * ```js
    * import PipHandler, { usePipModeListener } from 'customModules/PipModule';
    *
    * const isInPipMode = usePipModeListener();
    *
    * function enterPipMode() {
    *
    *   if (!isInPipMode)
    *     PipHandler.enterPipMode(300, 214, true);
    * }
    * ```
    */
   enterPipMode(width, height, shouldOpenPermissionScreenIfPipNotAllowed = false) {
      return NativeModules?.PipAndroid?.enterPipMode(
         width ? Math.floor(width) : 0,
         height ? Math.floor(height) : 0,
         shouldOpenPermissionScreenIfPipNotAllowed,
      );
   }
}

export default new PipHandler();
