import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSelector } from 'react-redux';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import IconButton from '../common/IconButton';
import { BackArrowIcon } from '../common/Icons';
import commonStyles from '../common/commonStyles';
import ImageInfo from './ImageInfo';
import VideoInfo from './VideoInfo';

const PostPreViewPage = () => {
   const { params: { jid = '', msgId = '' } = {} } = useRoute();
   const navigation = useNavigation();
   const currentUserJID = useSelector(state => state.auth.currentUserJID);
   const chatUserId = getUserIdFromJid(jid);
   const { messages } = useSelector(state => state.chatConversationData?.data?.[chatUserId] || []);

   const [title, setTitle] = React.useState('');
   const [mediaForcePause, setMediaForcePause] = React.useState();
   const [currentIndex, setCurrentIndex] = React.useState(0);

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
      };
   }, []);

   const handleBackBtn = () => {
      navigation.goBack();
      return true;
   };

   React.useEffect(() => {
      const isSender = currentUserJID === messageList[currentIndex]?.publisherJid;
      setTitle(isSender ? 'Sent' : 'Received');
   }, [currentIndex]);

   const handlePageSelected = event => {
      setMediaForcePause(true);
      setCurrentIndex(event.nativeEvent.position);
   };

   const messageList = React.useMemo(() => {
      const data = Object.values(messages) || [];
      const filteredMessages = data.filter(message => {
         const { deleteStatus, recallStatus } = message;
         const { media, message_type } = message.msgBody;
         return (
            ['image', 'video', 'audio'].includes(message_type) &&
            media &&
            media.is_downloaded === 2 &&
            media.is_uploading === 2 &&
            deleteStatus === 0 &&
            recallStatus === 0
         );
      });
      return filteredMessages;
   }, [messages, jid]);

   const initialPage = React.useMemo(() => {
      const selectedMsgIndex = messageList.findIndex(message => message.msgId === msgId);
      setCurrentIndex(selectedMsgIndex);
      return selectedMsgIndex === -1 ? messageList.length - 1 : selectedMsgIndex;
   }, []);

   const renderMediaPages = React.useMemo(() => {
      return (
         <PagerView style={commonStyles.flex1} initialPage={initialPage} onPageScroll={handlePageSelected}>
            {messageList.map(item => (
               <View key={item.msgId}>
                  {
                     {
                        image: <ImageInfo selectedMedia={item.msgBody} />,
                        audio: (
                           <VideoInfo
                              forcePause={{ mediaForcePause, setMediaForcePause }}
                              audioOnly={true}
                              selectedMedia={item.msgBody}
                           />
                        ),
                        video: (
                           <VideoInfo
                              forcePause={{ mediaForcePause, setMediaForcePause }}
                              selectedMedia={item.msgBody}
                           />
                        ),
                     }[item.msgBody.message_type]
                  }
               </View>
            ))}
         </PagerView>
      );
   }, [messageList, mediaForcePause]);

   return (
      <View style={commonStyles.flex1}>
         <View style={styles.header}>
            <IconButton onPress={handleBackBtn}>
               <BackArrowIcon />
            </IconButton>
            <Text style={styles.titleText}>{title} Media</Text>
         </View>
         {renderMediaPages}
      </View>
   );
};

const styles = StyleSheet.create({
   header: { flexDirection: 'row', alignItems: 'center', height: 65 },
   titleText: {
      color: '#000',
      fontSize: 20,
      fontWeight: '500',
      marginLeft: 20,
   },
});

export default PostPreViewPage;
