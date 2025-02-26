import React from 'react';
import { I18nManager, Image, StyleSheet, View } from 'react-native';
import SendIcon from '../assets/send.png';
import { getImageSource } from '../helpers/chatHelpers';
import { useThemeColorPalatte } from '../redux/reduxHook';
import IconButton from './IconButton';
import { MenuIcon } from './Icons';
import Pressable from './Pressable';

const isRTL = I18nManager.isRTL;
const styles = StyleSheet.create({
   primarypilbtn: {
      height: 40,
      minHeight: 4,
      backgroundColor: '#3276E2',
      borderRadius: 25,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
   },
   primarypilbtntext: {
      color: '#fff',
      fontSize: 16,
      paddingHorizontal: 25,
   },
   FloatingBtnContainer: {
      position: 'absolute',
      bottom: 16,
      right: 16,
   },
   FloatingBtn: {
      borderRadius: 50,
      width: 64,
      height: 64,
      justifyContent: 'center',
      alignItems: 'center',
   },
   FloatingBtnText: {
      color: '#fff',
      fontSize: 20,
   },
});

export const FloatingBtn = props => {
   const themeColorPalatte = useThemeColorPalatte();
   return (
      <View style={styles.FloatingBtnContainer}>
         <Pressable
            activeOpacity={1}
            style={[styles.FloatingBtn, { backgroundColor: themeColorPalatte.primaryColor }]}
            {...props}>
            {props.icon}
         </Pressable>
      </View>
   );
};

export const MenuIconBtn = ({ color, onPress }) => {
   return (
      <IconButton onPress={onPress}>
         <MenuIcon color={color} />
      </IconButton>
   );
};

export const SendBtn = React.memo(props => {
   return (
      <IconButton {...props}>
         <Image
            source={getImageSource(SendIcon)}
            style={{ width: 24.33, height: 20.32, transform: [{ scaleX: isRTL ? -1 : 1 }] }}
         />
      </IconButton>
   );
});
