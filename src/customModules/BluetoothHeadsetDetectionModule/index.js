import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { useEffect, useState } from 'react';

const BluetoothHeadsetDetectModule = NativeModules.BluetoothHeadsetDetectModule;

class BluetoothHeadsetDetectionModule {
   bluetoothHeadsetDetectEmitter;
   device = null;
   listeners = [];

   constructor() {
      this.bluetoothHeadsetDetectEmitter =
         Platform.OS === 'android' ? new NativeEventEmitter(BluetoothHeadsetDetectModule) : null;
      this.bluetoothHeadsetDetectEmitter?.addListener('onChange', ({ devices }) => {
         this.device = devices.length ? devices[0] : null;
         this.listeners.forEach(listener => {
            listener(this.device);
         });
      });
   }

   // Events
   getHeadset = () => this.device;
   addBluetoothHeadsetListener = listener => {
      this.listeners.push(listener);
   };
   removeListener = listener => {
      const idx = this.listeners.indexOf(listener);
      if (idx === -1) {
         return;
      }
      this.listeners.splice(idx, 1);
   };

   removeAllListeners = () => {
      this.listeners = [];
   };

   // React hook
   useBluetoothHeadsetDetection = () => {
      const [headset, setHeadset] = useState(null);
      useEffect(() => {
         setHeadset(this.device);
         addBluetoothHeadsetListener(setHeadset);
         return () => {
            removeListener(setHeadset);
         };
      }, []);

      return headset;
   };
}

export default new BluetoothHeadsetDetectionModule();
