import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon, IconButton } from 'native-base';
import React from 'react';
import { BackHandler, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSelector } from 'react-redux';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { BackArrowIcon } from '../common/Icons';
import commonStyles from '../common/commonStyles';
import AudioCard from './AudioCard';
import ImageInfo from './ImageInfo';
import VideoInfo from './VideoInfo';

const PostPreViewPage = () => {
   const { params: { chatUser = '', msgId = '' } = {} } = useRoute();
   console.log('msgId ==>', msgId);
   const chatSelectedMediaImage = useSelector(state => state.chatSelectedMedia.data);
   const navigation = useNavigation();
   const currentUserJID = useSelector(state => state.auth.currentUserJID);
   const isSender = currentUserJID === chatSelectedMediaImage?.publisherJid;
   const { data: messages } = useSelector(state => state.chatConversationData);

   const handleBackBtn = () => {
      navigation.goBack();
   };

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);

      return () => {
         backHandler.remove();
      };
   }, []);

   const messageList = React.useMemo(() => {
      const id = getUserIdFromJid(chatUser);
      if (id) {
         const data = messages[id]?.messages ? Object.values(messages[id]?.messages) : [];
         const filteredMessages = data.filter(message => {
            const { media, message_type } = message.msgBody;
            return (
               ['image', 'video', 'audio'].includes(message_type) &&
               media &&
               media.is_downloaded === 2 &&
               media.is_uploading === 2
            );
         });
         filteredMessages.reverse();
         return filteredMessages;
      }
      return [];
   }, [messages, chatUser]);

   const renderMediaPages = React.useMemo(() => {
      return (
         <PagerView style={{ flex: 1 }}>
            {messageList.map(item => (
               <View key={item.msgId}>
                  {
                     {
                        image: <ImageInfo selectedMedia={item.msgBody} />,
                        audio: <AudioCard messageObject={item} />,
                        video: <VideoInfo selectedMedia={item.msgBody} />,
                     }[item.msgBody.message_type]
                  }
               </View>
            ))}
         </PagerView>
      );
   }, [messageList]);

   return (
      <View style={commonStyles.flex1}>
         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
               onPress={handleBackBtn}
               _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
               borderRadius="full"
               icon={<Icon as={BackArrowIcon} name="emoji-happy" />}
            />
            <Text
               style={{
                  color: '#000',
                  fontSize: 20,
                  fontWeight: '500',
                  marginLeft: 20,
               }}>
               {isSender ? 'Sent' : 'Received'} Media
            </Text>
         </View>
         {renderMediaPages}
      </View>
   );
};

export default PostPreViewPage;
