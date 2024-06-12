import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenHeader from '../common/ScreenHeader';
import { change16TimeWithDateFormat } from '../common/timeStamp';
import GroupChatMessageInfo from '../components/GroupChatMessageInfo';
import Message from '../components/Message';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { CHAT_TYPE_GROUP } from '../helpers/constants';
import { useChatMessages } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

function MessageInfo() {
   const { params: { chatUser = '', msgId = '' } = {} } = useRoute();
   const navigation = useNavigation();
   const userId = getUserIdFromJid(chatUser);
   const chatMessageList = useChatMessages(userId);
   const messageObject = chatMessageList.find(item => item.msgId === msgId);

   const { chatType = '', msgStatus = '', msgBody: { media: { androidWidth = '' } = {} } = {} } = messageObject || {};

   const messageWidth = androidWidth || '80%';
   const [dbValue, setDbValue] = React.useState([]);
   const [deliveredReport, setDeliveredReport] = React.useState();
   const [seenReport, setSeenReport] = React.useState();

   React.useEffect(() => {
      const fetchMessageInfo = async () => {
         try {
            const _dbValue = await SDK.getMessageInfo(msgId);
            setDeliveredReport(_dbValue[0].receivedTime);
            setSeenReport(_dbValue[0].seenTime);
            setDbValue(_dbValue);
         } catch (error) {
            console.error('Error fetching message info:', error);
         }
      };

      fetchMessageInfo();
   }, [msgId, msgStatus]);

   const handleBackBtn = () => {
      navigation.goBack();
      return true;
   };

   const renderMessageBasedOnChatType = () => {
      const _chatType = chatType;
      if (_chatType === CHAT_TYPE_GROUP) {
         return <GroupChatMessageInfo chatUser={chatUser} dbValue={dbValue} />;
      } else {
         return (
            <View style={[commonStyles.paddingHorizontal_16]}>
               <Text
                  style={[commonStyles.fw_600, commonStyles.fontSize_18, commonStyles.colorBlack, commonStyles.my_15]}>
                  Delivered
               </Text>
               <Text style={[styles.stautsText, commonStyles.marginBottom_8]}>
                  {deliveredReport ? change16TimeWithDateFormat(deliveredReport) : 'Message sent, not delivered yet'}
               </Text>
               <View style={commonStyles.dividerLine} />
               <View style={{ padding: 10 }}></View>
               <Text
                  style={[commonStyles.fw_600, commonStyles.fontSize_18, commonStyles.colorBlack, commonStyles.my_15]}>
                  Read
               </Text>
               <Text style={[styles.stautsText, commonStyles.marginBottom_8]}>
                  {seenReport ? change16TimeWithDateFormat(seenReport) : 'Your message is not read'}
               </Text>
               <View style={commonStyles.dividerLine} />
            </View>
         );
      }
   };

   return (
      <View style={[commonStyles.bg_white, commonStyles.flex1]}>
         <ScreenHeader onhandleBack={handleBackBtn} title="Message Info" />
         <ScrollView>
            <View style={[commonStyles.paddingHorizontal_12, commonStyles.alignSelfFlexEnd, commonStyles.mt_20]}>
               <View style={[styles.messageContentWrapper, { maxWidth: messageWidth }]}>
                  <View style={[styles.messageContent]}>
                     <Message chatUser={chatUser} isSender={true} item={messageObject} />
                  </View>
               </View>
            </View>
            <View style={commonStyles.mt_20} />
            <View style={commonStyles.dividerLine} />
            {renderMessageBasedOnChatType()}
         </ScrollView>
      </View>
   );
}

export default MessageInfo;

const styles = StyleSheet.create({
   msgStatus: {
      marginStart: 15,
      width: 6,
      height: 6,
      borderRadius: 3,
   },
   bgClr: {
      backgroundColor: 'red',
   },
   notDelivered: {
      backgroundColor: '#818181',
   },
   delivered: {
      backgroundColor: '#FFA500',
   },
   seen: {
      backgroundColor: '#66E824',
   },
   mapImage: {
      width: 195,
      height: 170,
      resizeMode: 'contain',
      borderRadius: 8,
   },
   messageContentWrapper: {
      minWidth: '30%',
   },
   messageContent: {
      borderRadius: 10,
      overflow: 'hidden',
      borderColor: '#DDE3E5',
      backgroundColor: '#E2E8F7',
      borderWidth: 0,
      borderBottomRightRadius: 0,
   },
   currentStatus: {
      marginStart: 15,
      width: 6,
      height: 6,
      borderRadius: 3,
   },
   textMessageContainer: {
      backgroundColor: 'E2E8F7',
      borderWidth: 0,
      borderRadius: 10,
      borderBottomRightRadius: 0,
      borderColor: '#959595',
   },
   textMessage: { fontSize: 14, color: '#313131' },
   timeStampText: { paddingLeft: 4, color: '#959595', fontSize: 11 },
   stautsText: {
      color: '#4b5563',
      marginVertical: 2,
   },
});
