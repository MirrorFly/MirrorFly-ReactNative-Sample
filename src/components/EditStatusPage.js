import { Box, Text, useToast } from 'native-base';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import SDK from '../SDK/SDK';
import commonStyles from '../common/commonStyles';
import ScreenHeader from '../components/ScreenHeader';
import { useNetworkStatus } from '../hooks';
import EmojiInput from './EmojiInput';

const EditStatusPage = props => {
   const isNetworkConnected = useNetworkStatus();
   const toast = useToast();
   const allowedMaxLimit = 139;
   const [isToastShowing, setIsToastShowing] = React.useState(false);
   const [statusContent, setStatusContent] = React.useState(props.profileInfo.status);
   const [toggleEmojiWindow, setToggleEmojiWindow] = React.useState(false);

   const toastConfig = {
      duration: 100,
      avoidKeyboard: true,
      onCloseComplete: () => {
         setIsToastShowing(false);
      },
   };
   const handleBackBtn = () => {
      props.setNav('statusPage');
   };

   const handleStatus = async () => {
      setIsToastShowing(true);
      if (!isNetworkConnected && !isToastShowing) {
         return toast.show({
            ...toastConfig,
            render: () => {
               return (
                  <Box bg="black" px="2" py="1" rounded="sm">
                     <Text style={{ color: '#fff', padding: 5 }}>Please check your internet connectivity</Text>
                  </Box>
               );
            },
         });
      }
      if (isNetworkConnected) {
         let statusRes = await SDK.setUserProfile(
            props?.profileInfo?.nickName,
            props.profileInfo.image,
            statusContent.trim(),
            props.profileInfo?.mobileNumber,
            props.profileInfo?.email,
         );
         if (statusRes.statusCode === 200) {
            props.setProfileInfo({
               ...props.profileInfo,
               status: statusContent.trim(),
            });
            props.setNav('statusPage');
            toast.show({
               ...toastConfig,
               render: () => {
                  return (
                     <Box bg="black" px="2" py="1" rounded="sm">
                        <Text style={{ color: '#fff', padding: 5 }}>Status updated successfully </Text>
                     </Box>
                  );
               },
            });
         } else {
            if (!isToastShowing)
               toast.show({
                  ...toastConfig,
                  render: () => {
                     return (
                        <Box bg="black" px="2" py="1" rounded="sm">
                           <Text style={{ color: '#fff', padding: 5 }}>{statusRes.message}</Text>
                        </Box>
                     );
                  },
               });
         }
      }
   };

   return (
      <View style={[commonStyles.bg_white, commonStyles.flex1]}>
         <ScreenHeader title="Add New Status" onhandleBack={handleBackBtn} />
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
                  <Pressable onPress={handleStatus}>
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
