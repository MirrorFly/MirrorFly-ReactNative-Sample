import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import SDK from '../SDK/SDK';
import IconButton from '../common/IconButton';
import { LeftArrowIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import Text from '../common/Text';
import { useNetworkStatus } from '../common/hooks';
import EmojiInput from '../components/EmojiInput';
import { calculateKeyboardVerticalOffset, getUserIdFromJid, showToast } from '../helpers/chatHelpers';
import { getStringSet } from '../localization/stringSet';
import { getUserImage, getUserNameFromStore, useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

const EditName = () => {
   const stringSet = getStringSet();
   const {
      params: { jid = '' },
   } = useRoute();
   const chatUserId = getUserIdFromJid(jid);
   const themeColorPalatte = useThemeColorPalatte();
   const title = getUserNameFromStore(chatUserId);
   const imageToken = getUserImage(chatUserId);
   const navigation = useNavigation();
   const isConnected = useNetworkStatus();
   const [toggleEmojiWindow, setToggleEmojiWindow] = React.useState(false);
   const [value, setValue] = React.useState(title);
   const [okClicked, setOkClicked] = React.useState(false);
   const togglOkCLick = () => {
      setOkClicked(!okClicked);
   };

   const hanldeOkBtn = async () => {
      if (!isConnected) {
         showToast(stringSet.COMMON_TEXT.NO_INTERNET_CONNECTION);
         return;
      }
      if (!value.trim()) {
         showToast(stringSet.TOAST_MESSAGES.GROUP_NAME_EMPTY);
         return;
      }
      togglOkCLick();
      if (isConnected && value.trim()) {
         const { statusCode, message } = await SDK.setGroupProfile(jid, value, imageToken);
         if (statusCode === 200) {
            navigation.goBack();
         } else {
            showToast(message);
         }
      }
      togglOkCLick();
   };

   const handleBackBtn = () => {
      navigation.goBack();
      return true;
   };

   return (
      <KeyboardAvoidingView
         style={[commonStyles.bg_color(themeColorPalatte.screenBgColor), commonStyles.flex1]}
         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
         keyboardVerticalOffset={Platform.OS === 'ios' ? calculateKeyboardVerticalOffset() : 0}>
         <View style={[styles.editNameContainer, commonStyles.hstack, commonStyles.bg_color(themeColorPalatte.appBarColor)]}>
            <View
               style={[
                  commonStyles.hstack,
                  commonStyles.alignItemsCenter,
                  commonStyles.flex1,
                  commonStyles.marginLeft_10,
               ]}>
               <IconButton onPress={handleBackBtn}>
                  <LeftArrowIcon color={themeColorPalatte.iconColor} />
               </IconButton>
               <Text style={[styles.editNameTitleText, commonStyles.textColor(themeColorPalatte.headerPrimaryTextColor)]}>
                  {stringSet.INFO_SCREEN.ENTER_NAME}
               </Text>
            </View>
         </View>
         <EmojiInput
            allowedMaxLimit={25}
            defaultContent={title}
            setValue={setValue}
            onEmojiWindowToggle={setToggleEmojiWindow}>
            <View style={commonStyles.flex1}>
               <View
                  style={[
                     commonStyles.hstack,
                     commonStyles.positionAbsolute,
                     commonStyles.alignItemsCenter,
                     styles.cancelContainer,
                     { bottom: toggleEmojiWindow ? '47%' : 0 },
                  ]}>
                  <Pressable onPress={handleBackBtn}>
                     <Text style={[styles.cancelBtn, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}>
                        {stringSet.BUTTON_LABEL.CANCEL_BUTTON}
                     </Text>
                  </Pressable>
                  <View style={styles.okContainer} />
                  <Pressable disabled={okClicked} onPress={hanldeOkBtn}>
                     <Text style={[styles.okBtn, commonStyles.textColor(themeColorPalatte.primaryColor)]}>
                        {stringSet.BUTTON_LABEL.OK_BUTTON}
                     </Text>
                  </Pressable>
               </View>
            </View>
         </EmojiInput>
      </KeyboardAvoidingView>
   );
};

export default EditName;

const styles = StyleSheet.create({
   editNameContainer: {
      height: 60,
   },
   editNameTitleText: {
      fontSize: 18,
      paddingHorizontal: 12,
      fontWeight: '500',
   },
   cancelContainer: {
      left: 0,
      right: 0,
      borderTopColor: '#BFBFBF',
      borderTopWidth: 1,
   },
   cancelBtn: {
      paddingHorizontal: '19%',
      paddingVertical: '5%',
      fontSize: 15,
   },
   okContainer: { borderLeftWidth: 1, borderColor: '#BFBFBF', height: 48 },
   okBtn: { paddingHorizontal: '22%', paddingVertical: '5%', fontSize: 15 },
});
