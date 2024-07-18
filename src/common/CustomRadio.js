import React from 'react';
import { StyleSheet, View } from 'react-native';
import ApplicationColors from '../config/appColors';
import { showNetWorkToast } from '../helpers/chatHelpers';
import IconButton from './IconButton';
import { TickIcon } from './Icons';
import { useNetworkStatus } from './hooks';

function CustomRadio({ value = false, onToggle, disabled = false }) {
   const isNetWorkConnected = useNetworkStatus();

   const toggleSwitch = () => {
      if (!isNetWorkConnected) {
         showNetWorkToast();
         return;
      }
      onToggle?.(!value);
   };

   return (
      <IconButton onPress={toggleSwitch} disabled={disabled}>
         <View style={[styles.switchContainer, value ? styles.switchBackgroundOn : styles.switchBackgroundOff]}>
            <TickIcon width={11} height={10} />
         </View>
      </IconButton>
   );
}

const styles = StyleSheet.create({
   switchContainer: {
      width: 20.5,
      height: 20.5,
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
   },
   switchBackgroundOn: {
      backgroundColor: ApplicationColors.mainColor,
   },
   switchBackgroundOff: {
      backgroundColor: '#767577',
   },
});

export default CustomRadio;
