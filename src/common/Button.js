import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Chat_FABICON, MenuIcon } from './Icons';
import { Icon, IconButton, Pressable } from 'native-base';
import SendIcon from '../assets/send.png';
import LeftArrow from '../assets/leftArrow.png';
import { getImageSource } from './utils';

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

export const PrimaryPillBtn = props => {
  return (
    <Pressable style={styles.primarypilbtn} {...props}>
      <Text style={styles.primarypilbtntext}>{props.title}</Text>
    </Pressable>
  );
};

export const BackBtn = props => {
  return (
    <Pressable activeOpacity={1} {...props} style={{ padding: 10 }}>
      <Image source={getImageSource(LeftArrow)} style={{ width: 18.33, height: 15.32 }} />
    </Pressable>
  );
};

export const SendBtn = React.memo(props => {
  return (
    <Pressable {...props}>
      <Image
        source={getImageSource(SendIcon)}
        style={{ width: 24.33, height: 20.32 }}
      />
    </Pressable>
  );
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

export const MenuIconBtn = triggerProps => {
  return (
    <IconButton
      {...triggerProps}
      borderRadius="full"
      _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
      icon={<Icon px="3" as={MenuIcon} name="emoji-happy" />}
    />
  );
};
