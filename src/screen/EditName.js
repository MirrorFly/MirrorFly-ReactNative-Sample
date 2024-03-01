import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import IconButton from '../common/IconButton';
import { LeftArrowIcon } from '../common/Icons';
import commonStyles from '../common/commonStyles';
import EmojiInput from '../components/EmojiInput';
import ApplicationColors from '../config/appColors';
import Pressable from '../common/Pressable';
import { showToast } from '../Helper';
import { useNetworkStatus } from '../hooks';
import { SDK } from '../SDK';

const LeftArrowComponent = () => LeftArrowIcon();

const EditName = () => {
   const {
      params: { chatUser = '', title = '', imageToken = '' },
   } = useRoute();
   const navigation = useNavigation();
   const isConnected = useNetworkStatus();
   const [toggleEmojiWindow, setToggleEmojiWindow] = React.useState(false);
   const headerBg = useSelector(state => state.safeArea.color);
   const [value, setValue] = React.useState(title);
   const [okClicked, setOkClicked] = React.useState(false);

   const togglOkCLick = () => {
      setOkClicked(!okClicked);
   };

   const hanldeOkBtn = async () => {
      if (!isConnected) {
         showToast('Please check your internet connection', {
            id: 'internet-connection-toast',
         });
         return;
      }
      if (!value.trim()) {
         showToast('Group name cannot be empty', { id: 'Group name cannot be empty' });
         return;
      }
      togglOkCLick();
      if (isConnected && value.trim()) {
         const { statusCode, message } = await SDK.setGroupProfile(chatUser, value, imageToken);
         if (statusCode === 200) {
            navigation.goBack();
         } else {
            showToast(message, { id: message });
         }
      }
      togglOkCLick();
   };

   const handleBackBtn = () => {
      navigation.goBack();
      return true;
   };

   return (
      <View style={[commonStyles.bg_white, commonStyles.flex1]}>
         <View style={[styles.container, commonStyles.hstack, { backgroundColor: headerBg }]}>
            <View
               style={[
                  commonStyles.hstack,
                  commonStyles.alignItemsCenter,
                  commonStyles.flex1,
                  commonStyles.marginLeft_10,
               ]}>
               <IconButton onPress={handleBackBtn}>
                  <LeftArrowComponent />
               </IconButton>
               <Text style={styles.titleText}>Enter New Name</Text>
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
                     { bottom: toggleEmojiWindow ? '50%' : 0 },
                  ]}>
                  <Pressable onPress={handleBackBtn}>
                     <Text style={styles.cancelBtn}>CANCEL</Text>
                  </Pressable>
                  <View style={styles.okContainer} />
                  <Pressable disabled={okClicked} onPress={hanldeOkBtn}>
                     <Text style={styles.okBtn}>OK</Text>
                  </Pressable>
               </View>
            </View>
         </EmojiInput>
      </View>
   );
};

export default EditName;

const styles = StyleSheet.create({
   container: {
      height: 60,
   },
   titleText: {
      fontSize: 18,
      paddingHorizontal: 12,
      fontWeight: '500',
      color: ApplicationColors.black,
   },
   subText: {
      fontSize: 14,
      paddingHorizontal: 12,
      color: ApplicationColors.black,
   },
   cameraImage: {
      height: 42,
      width: 42,
      padding: 10,
   },
   nameTextView: {
      borderBottomWidth: 1,
      borderBottomColor: '#f2f2f2',
   },
   nameTextInput: {
      flex: 1,
      fontSize: 15,
      fontWeight: '400',
      marginTop: 5,
      paddingLeft: 40,
   },
   cancelContainer: {
      left: 0,
      right: 0,
      borderTopColor: '#BFBFBF',
      borderTopWidth: 1,
   },
   cancelBtn: { paddingHorizontal: '19%', paddingVertical: '5%' },
   okContainer: { borderLeftWidth: 1, borderColor: '#BFBFBF', height: 48 },
   okBtn: { paddingHorizontal: '22%', paddingVertical: '5%' },
});
