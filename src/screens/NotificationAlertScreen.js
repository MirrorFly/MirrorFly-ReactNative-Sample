import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { sendNotificationData } from '../SDK/utils';
import CustomRadio from '../common/CustomRadio';
import Pressable from '../common/Pressable';
import ScreenHeader from '../common/ScreenHeader';
import ApplicationColors from '../config/appColors';
import { useNotificationDisable, useNotificationSound, useNotificationVibration } from '../redux/reduxHook';
import {
   toggleNotificationDisabled,
   toggleNotificationSound,
   toggleNotificationVibrate,
} from '../redux/settingDataSlice';
import commonStyles from '../styles/commonStyles';

const NotificationSound = () => {
   const notificationSound = useNotificationSound();
   const dispatch = useDispatch();

   const handlePress = async () => {
      dispatch(toggleNotificationSound(!notificationSound));
      sendNotificationData();
   };

   return (
      <>
         <Pressable
            onPress={handlePress}
            contentContainerStyle={[styles.pressable, commonStyles.hstack, commonStyles.justifyContentSpaceBetween]}>
            <View
               style={[
                  styles.textContainer,
                  commonStyles.vstack,
                  commonStyles.marginLeft_5,
                  commonStyles.marginBottom_6,
               ]}>
               <Text style={styles.titleText}>Notification Sound</Text>
               <Text style={styles.descriptionText} numberOfLines={2}>
                  Play sounds for incoming messages
               </Text>
            </View>
            <CustomRadio value={notificationSound} disabled={true} />
         </Pressable>
         <View style={[styles.divider, commonStyles.maxWidth_90per]} />
      </>
   );
};

const NotificationVibration = () => {
   const notificationVibration = useNotificationVibration();
   const dispatch = useDispatch();

   const handlePress = async () => {
      dispatch(toggleNotificationVibrate(!notificationVibration));
      sendNotificationData();
   };

   return (
      <>
         <Pressable
            onPress={handlePress}
            contentContainerStyle={[styles.pressable, commonStyles.hstack, commonStyles.justifyContentSpaceBetween]}>
            <View
               style={[
                  styles.textContainer,
                  commonStyles.vstack,
                  commonStyles.marginLeft_5,
                  commonStyles.marginBottom_6,
               ]}>
               <Text style={styles.titleText}>Vibration</Text>
               <Text style={styles.descriptionText} numberOfLines={2}>
                  Vibrate when a new message arrives while application is running
               </Text>
            </View>
            <CustomRadio value={notificationVibration} disabled={true} />
         </Pressable>
         <View style={[styles.divider, commonStyles.maxWidth_90per]} />
      </>
   );
};

const NotificationMute = () => {
   const notificationDisable = useNotificationDisable();
   const dispatch = useDispatch();

   const handlePress = async () => {
      dispatch(toggleNotificationDisabled(!notificationDisable));
      sendNotificationData();
   };

   return (
      <>
         <Pressable
            onPress={handlePress}
            contentContainerStyle={[styles.pressable, commonStyles.hstack, commonStyles.justifyContentSpaceBetween]}>
            <View
               style={[
                  styles.textContainer,
                  commonStyles.vstack,
                  commonStyles.marginLeft_5,
                  commonStyles.marginBottom_6,
               ]}>
               <Text style={styles.titleText}>Mute Notification</Text>
               <Text style={styles.descriptionText} numberOfLines={2}>
                  This will mute all notification alerts for incoming messages
               </Text>
            </View>
            <CustomRadio value={notificationDisable} disabled={true} />
         </Pressable>
         <View style={[styles.divider, commonStyles.maxWidth_90per]} />
      </>
   );
};

function NotificationAlertScreen() {
   return (
      <>
         <ScreenHeader isSearchable={false} title="Notifications Alert" />
         <View style={[commonStyles.flex1, commonStyles.bg_white]}>
            <NotificationSound />
            <NotificationVibration />
            <NotificationMute />
         </View>
      </>
   );
}

export default NotificationAlertScreen;

const styles = StyleSheet.create({
   contentContainer: {
      maxWidth: '90%',
   },
   pressable: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      width: '100%', // Ensure it takes the full width of the parent
   },
   textContainer: {
      flex: 1, // Allow the text container to take up remaining space
   },
   titleText: {
      color: ApplicationColors.black,
      fontWeight: '400',
      fontSize: 14,
      paddingBottom: 4,
   },
   descriptionText: {
      fontSize: 12.5,
   },
   divider: {
      width: '90%',
      height: 0.5,
      alignSelf: 'center',
      backgroundColor: ApplicationColors.dividerBg,
   },
});
