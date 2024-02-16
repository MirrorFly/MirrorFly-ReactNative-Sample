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

const LeftArrowComponent = () => LeftArrowIcon();

const EditName = () => {
   const {
      params: { title = '' },
   } = useRoute();
   const navigation = useNavigation();
   const isConnected = useNetworkStatus();
   const headerBg = useSelector(state => state.safeArea.color);
   const [emojiWindow, setEmojiWindow] = React.useState(false);
   const [value, setValue] = React.useState('');

   const hanldeOkBtn = () => {
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
      if (isConnected && value.trim()) {
         navigation.goBack();
      }
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
         <EmojiInput defaultContent={title} setEmojiWindow={setEmojiWindow} setValue={setValue} />
         <View style={commonStyles.flex1}>
            <View
               style={[
                  commonStyles.hstack,
                  commonStyles.positionAbsolute,
                  commonStyles.alignItemsCenter,
                  {
                     left: 0,
                     bottom: emojiWindow ? '60%' : 0,
                     right: 0,
                     borderTopColor: '#BFBFBF',
                     borderTopWidth: 1,
                  },
               ]}>
               <Pressable onPress={handleBackBtn}>
                  <Text style={{ paddingHorizontal: '19%', paddingVertical: '5%' }}>CANCEL</Text>
               </Pressable>
               <View style={[{ borderLeftWidth: 1, borderColor: '#BFBFBF', height: 48 }]} />
               <Pressable onPress={hanldeOkBtn}>
                  <Text style={{ paddingHorizontal: '22%', paddingVertical: '5%' }}>OK</Text>
               </Pressable>
            </View>
         </View>
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
});
