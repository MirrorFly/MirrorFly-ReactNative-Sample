// import { Box, Text, useToast } from 'native-base';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenHeader from '../common/ScreenHeader';
import { useNetworkStatus } from '../common/hooks';
import EmojiInput from '../components/EmojiInput';
import { showNetWorkToast, showToast } from '../helpers/chatHelpers';
import { useRoasterData } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { mirrorflyProfileUpdate } from '../uikitMethods';

const EditStatusPage = () => {
   const { params: { userId } = {} } = useRoute();
   const profile = useRoasterData(userId) || {};
   const isNetworkConnected = useNetworkStatus();
   const navigaiton = useNavigation();
   const allowedMaxLimit = 139;
   const [statusContent, setStatusContent] = React.useState(profile.status || '');
   const [clicked, setClicked] = React.useState(false);
   const [toggleEmojiWindow, setToggleEmojiWindow] = React.useState(false);

   const handleBackBtn = () => {
      navigaiton.goBack();
   };

   const handleStatus = async () => {
      setClicked(true);
      if (!isNetworkConnected) {
         setClicked(false);
         showNetWorkToast();
         return;
      }
      if (isNetworkConnected) {
         let statusRes = await mirrorflyProfileUpdate({ status: statusContent.trim() });
         setClicked(false);
         if (statusRes.statusCode === 200) {
            navigaiton.goBack();
            showToast('Status updated successfully');
         } else {
            showToast(statusRes.message);
         }
      }
   };

   return (
      <View style={[commonStyles.bg_white, commonStyles.flex1]}>
         <ScreenHeader title="Add New Status" isSearchable={false} />
         <EmojiInput
            allowedMaxLimit={allowedMaxLimit}
            defaultContent={statusContent}
            setValue={setStatusContent}
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
                  <Pressable disabled={clicked} onPress={handleStatus}>
                     <Text style={styles.okBtn}>OK</Text>
                  </Pressable>
               </View>
            </View>
         </EmojiInput>
      </View>
   );
};

export default EditStatusPage;

const styles = StyleSheet.create({
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
