import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import SendIcon from '../assets/send.png';
import { getImageSource } from '../helpers/chatHelpers';
import IconButton from './IconButton';
import { Chat_FABICON, MenuIcon } from './Icons';
import Pressable from './Pressable';

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
      backgroundColor: '#3276E2',
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
   return (
      <View style={styles.FloatingBtnContainer}>
         <Pressable activeOpacity={1} style={styles.FloatingBtn} {...props}>
            <Chat_FABICON />
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
         <Image source={getImageSource(SendIcon)} style={{ width: 24.33, height: 20.32 }} />
      </IconButton>
   );
});
