import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import IconButton from '../common/IconButton';
import { BackArrowIcon } from '../common/Icons';
import PostView from '../components/PostView';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { useChatMessages } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { getCurrentUserJid } from '../uikitMethods';

const PostPreViewPage = () => {
   const { params: { jid = '', msgId = '' } = {} } = useRoute();
   const navigation = useNavigation();
   const currentUserJID = getCurrentUserJid();
   const chatUserId = getUserIdFromJid(jid);
   const messages = useChatMessages(chatUserId);

   const [title, setTitle] = React.useState('');
   const [currentIndex, setCurrentIndex] = React.useState(0);

   const messageList = React.useMemo(() => {
      const filteredMessages = messages.filter(message => {
         const { msgBody: { message_type = '' } = {} } = message || {};
         return ['image', 'video', 'audio'].includes(message_type);
      });
      return filteredMessages;
   }, [messages, jid]);

   React.useEffect(() => {
      const isSender = currentUserJID === messageList[currentIndex]?.publisherJid;
      setTitle(isSender ? 'Sent' : 'Received');
   }, [currentIndex]);

   const handleBackBtn = () => {
      navigation.goBack();
   };

   const handlePageSelected = event => {
      setCurrentIndex(event.nativeEvent.position);
   };

   const initialPage = React.useMemo(() => {
      const selectedMsgIndex = messageList.findIndex(message => message.msgId === msgId);
      setCurrentIndex(selectedMsgIndex);
      return selectedMsgIndex === -1 ? messageList.length - 1 : selectedMsgIndex;
   }, []);

   const renderMediaPages = React.useMemo(() => {
      return (
         <PagerView style={commonStyles.flex1} initialPage={initialPage} onPageScroll={handlePageSelected}>
            {messageList.map(item => (
               <PostView key={item.msgId} item={item} />
            ))}
         </PagerView>
      );
   }, [messageList]);

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
