import { Pressable, TextInput } from 'react-native';
import React from 'react';
import { Text, HStack, Stack, useToast, Box } from 'native-base';
import ScreenHeader from '../components/ScreenHeader';
import { KeyboardIcon, SmileIcon } from '../common/Icons';
import { useNetworkStatus } from '../hooks';
import EmojiOverlay from './EmojiPicker';
import Graphemer from 'graphemer';
import SDK from '../SDK/SDK';

const EditStatusPage = props => {
   const splitter = new Graphemer();
   const statusInputRef = React.useRef();
   const isNetworkConnected = useNetworkStatus();
   const toast = useToast();
   const allowedMaxLimit = 139;
   const [isToastShowing, setIsToastShowing] = React.useState(false);
   const [statusContent, setStatusContent] = React.useState(props.profileInfo.status);
   const [isEmojiPickerShowing, setIsEmojiPickerShowing] = React.useState(false);
   const [pressedKey, setPressedKey] = React.useState('');

   const toastConfig = {
      duration: 100,
      avoidKeyboard: true,
      onCloseComplete: () => {
         setIsToastShowing(false);
      },
   };
   const handleBackBtn = () => {
      props.setNav('statusPage');
      return true;
   };

   const count = () => allowedMaxLimit - splitter.countGraphemes(statusContent);

   const handleEmojiSelect = (...emojis) => {
      if (count() > 0) {
         setStatusContent(prev => prev + emojis);
      }
   };

   const handleInput = text => {
      if (count() > 0 || pressedKey === 'Backspace') {
         setStatusContent(text);
      }
   };

   const handleOnKeyPress = ({ nativeEvent }) => {
      const { key } = nativeEvent;
      setPressedKey(key);
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
         <HStack pb="2" pt="3" px="4" borderBottomColor={'#f2f2f2'} borderBottomWidth="1" alignItems={'center'}>
            <TextInput
               ref={statusInputRef}
               style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: '400',
                  marginTop: 5,
               }}
               autoFocus={true}
               multiline={true}
               value={statusContent}
               onChangeText={text => {
                  handleInput(text);
               }}
               placeholderTextColor="#959595"
               keyboardType="default"
               onKeyPress={handleOnKeyPress}
            />
            <Text color={'black'} fontSize="15" fontWeight={'400'} px="4">
               {count()}
            </Text>
            <Pressable
               style={{ width: 25 }}
               onPress={() => {
                  if (isEmojiPickerShowing) statusInputRef.current.focus();
                  setIsEmojiPickerShowing(!isEmojiPickerShowing);
               }}>
               {!isEmojiPickerShowing ? <SmileIcon /> : <KeyboardIcon />}
            </Pressable>
         </HStack>
         <Stack flex="1">
            <HStack
               position={'absolute'}
               pb="4"
               left={'0'}
               right={'0'}
               bottom="0"
               alignItems={'center'}
               justifyContent={'space-evenly'}
               borderTopColor={'#BFBFBF'}
               borderTopWidth={statusContent.trim() ? '1' : '0'}>
               {statusContent.trim() && (
                  <>
                     <Pressable onPress={handleBackBtn}>
                        <Text color={'black'} fontSize="15" fontWeight={'400'} px="4">
                           CANCEL
                        </Text>
                     </Pressable>
                     <Stack h="12" borderLeftWidth="1" borderColor="#BFBFBF" />
                     <Pressable onPress={handleStatus}>
                        <Text color={'black'} fontSize="15" fontWeight={'400'} px="8">
                           OK
                        </Text>
                     </Pressable>
                  </>
               )}
            </HStack>
         </Stack>
         <EmojiOverlay
            state={statusContent}
            setState={setStatusContent}
            visible={isEmojiPickerShowing}
            onClose={() => setIsEmojiPickerShowing(false)}
            onSelect={handleEmojiSelect}
         />
      </>
   );
};

export default EditStatusPage;
