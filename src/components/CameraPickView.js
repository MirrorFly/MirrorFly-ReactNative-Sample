import { HStack, Icon, IconButton, KeyboardAvoidingView, Spacer, Text, View } from 'native-base';
import React from 'react';
import { BackHandler, Image, Platform, StyleSheet, TextInput } from 'react-native';
import { useDispatch } from 'react-redux';
import { CHAT_TYPE_GROUP, CHAT_TYPE_SINGLE, MIX_BARE_JID } from '../Helper/Chat/Constant';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import Avathar from '../common/Avathar';
import { LeftArrowIcon, RightArrowIcon, SendBlueIcon } from '../common/Icons';
import { CHATCONVERSATION } from '../constant';
import useRosterData from '../hooks/useRosterData';
import { resetSafeArea, safeAreaBgColor } from '../redux/Actions/SafeAreaAction';
import VideoPlayer from './Media/VideoPlayer';
import { getType } from './chat/common/fileUploadValidation';

const CameraPickView = props => {
   const { chatUser, handleSendMsg, setLocalNav, setSelectedImages, selectedImages } = props;
   const type = MIX_BARE_JID.test(chatUser) ? CHAT_TYPE_GROUP : CHAT_TYPE_SINGLE;
   const chatUserId = getUserIdFromJid(chatUser);
   console.log('chatUserId ==>', JSON.stringify(chatUserId, null, 2));
   let { nickName, image: imageToken, colorCode } = useRosterData(chatUserId);
   // updating the default values
   nickName = nickName || chatUserId || '';
   imageToken = imageToken || '';

   const dispatch = useDispatch();

   const handleBackBtn = () => {
      setSelectedImages([]);
      setLocalNav('CAMERAVIEW');
      return true;
   };

   const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);

   React.useEffect(() => {
      return () => {
         backHandler.remove();
      };
   }, []);

   const handleSendMedia = () => {
      let message = {
         type: 'media',
         content: props.selectedImages,
      };
      handleSendMsg(message);
   };
   React.useLayoutEffect(() => {
      dispatch(safeAreaBgColor('#000'));
      return () => dispatch(resetSafeArea());
   }, []);

   return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
         <View style={styles.container}>
            <HStack mb={'2'} mt="5" alignItems={'center'}>
               <IconButton
                  _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
                  onPress={handleBackBtn}
                  icon={<Icon as={() => LeftArrowIcon('#fff')} name="emoji-happy" />}
                  borderRadius="full"
               />
               <Avathar
                  type={type}
                  width={30}
                  height={30}
                  fontsize={14}
                  backgroundColor={colorCode}
                  data={nickName}
                  profileImage={imageToken}
               />
               <Spacer />
            </HStack>
            {getType(selectedImages[0]?.fileDetails.type) === 'image' && (
               <Image
                  resizeMode="contain"
                  source={{ uri: selectedImages[0]?.fileDetails?.uri }}
                  style={styles.tabContainer}
               />
            )}
            {'video' === getType(selectedImages[0]?.fileDetails.type) && <VideoPlayer item={selectedImages[0]} />}
            <IconButton
               p="0"
               right="3"
               bottom="-15"
               alignSelf={'flex-end'}
               onPress={() => {
                  handleSendMedia();
                  setLocalNav(CHATCONVERSATION);
               }}
               _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
               icon={<Icon as={<SendBlueIcon color="#fff" />} name="emoji-happy" />}
               borderRadius="full"
            />
            <HStack ml="2" mb="1" alignItems={'center'}>
               <TextInput
                  style={{
                     flex: 1,
                     color: '#fff',
                     fontSize: 14,
                     minHeight: 20,
                     maxHeight: 100,
                  }}
                  defaultValue={props.selectedImages[0] ? props.selectedImages[0].caption : ''}
                  numberOfLines={1}
                  multiline={true}
                  onChangeText={text => {
                     selectedImages[0].caption = text;
                  }}
                  placeholderTextColor="#7f7f7f"
                  selectionColor={'#3276E2'}
                  placeholder="Add a caption..."
               />
            </HStack>
            <HStack alignItems={'center'} ml={3} mb={5}>
               <IconButton icon={<Icon as={() => RightArrowIcon('#fff')} name="emoji-happy" />} />
               <Text color="#7f7f7f">{nickName}</Text>
            </HStack>
         </View>
      </KeyboardAvoidingView>
   );
};

export default CameraPickView;

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: 'black',
   },
   imageContainer: {
      flex: 1,
      paddingHorizontal: 0,
   },
   tabContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
   tabImage: {
      width: 45,
      height: 45,
      borderColor: '#7f7f7f',
      borderWidth: 0.25,
   },
   tabButton: {
      paddingHorizontal: 2,
   },
   selectedTabImage: {
      width: 45,
      height: 45,
      borderColor: '#3276E2',
      borderWidth: 2,
   },
});
