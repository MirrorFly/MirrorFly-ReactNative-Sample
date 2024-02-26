import { Box, Text, useToast } from 'native-base';
import React from 'react';
import { Pressable, View } from 'react-native';
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
      <>
         <ScreenHeader title="Add New Status" onhandleBack={handleBackBtn} />
         <EmojiInput allowedMaxLimit={allowedMaxLimit} defaultContent={statusContent} setValue={setStatusContent}>
            <View style={commonStyles.flex1}>
               <View
                  style={[
                     commonStyles.hstack,
                     commonStyles.positionAbsolute,
                     commonStyles.alignItemsCenter,
                     {
                        left: 0,
                        bottom: 0,
                        right: 0,
                        borderTopColor: '#BFBFBF',
                        borderTopWidth: 1,
                     },
                  ]}>
                  <Pressable onPress={handleBackBtn}>
                     <Text style={{ paddingHorizontal: '19%', paddingVertical: '5%' }}>CANCEL</Text>
                  </Pressable>
                  <View style={[{ borderLeftWidth: 1, borderColor: '#BFBFBF', height: 48 }]} />
                  <Pressable onPress={handleStatus}>
                     <Text style={{ paddingHorizontal: '22%', paddingVertical: '5%' }}>OK</Text>
                  </Pressable>
               </View>
            </View>
         </EmojiInput>
      </>
   );
};

export default EditStatusPage;
