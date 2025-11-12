import { useEffect, useMemo, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

const isAndroidEdgeToEdge = Platform.OS === 'android' && Platform.Version >= 35;

export default function useAndroidKeyboardPadding() {
   const [keyboardHeight, setKeyboardHeight] = useState(0);

   useEffect(() => {
      if (!isAndroidEdgeToEdge) {
         return;
      }

      const show = Keyboard.addListener('keyboardDidShow', event => {
         setKeyboardHeight(event.endCoordinates.height);
      });

      const hide = Keyboard.addListener('keyboardDidHide', () => {
         setTimeout(()=>{
            setKeyboardHeight(0);
         },50);
      });

      return () => {
         show.remove();
         hide.remove();
      };
   }, []);

   const keyboardPadding = useMemo(() => {
      if (!isAndroidEdgeToEdge || keyboardHeight <= 0) {
         return 0;
      }

      return keyboardHeight;
   }, [keyboardHeight]);

   return keyboardPadding;
}
