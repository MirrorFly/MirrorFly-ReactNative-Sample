import { useNavigation, useRoute } from '@react-navigation/native';
import { Divider } from 'native-base';
import React from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CHAT_TYPE_GROUP } from '../Helper/Chat/Constant';
import { getThumbBase64URL } from '../Helper/Chat/Utility';
import SDK from '../SDK/SDK';
import { SandTimer } from '../common/Icons';
import { change16TimeWithDateFormat, getConversationHistoryTime } from '../common/TimeStamp';
import commonStyles from '../common/commonStyles';
import { useChatMessage } from '../hooks/useChatMessage';
import ContactCard from './ContactCard';
import GroupChatMessageInfo from './GroupChatMessageInfo';
import ImageCard from './ImageCard';
import MapCard from './MapCard';
import ScreenHeader from './ScreenHeader';
import VideoCard from './VideoCard';
import AudioCard from './AudioCard';
import DocumentMessageCard from './DocumentMessageCard';

function MessageInfo() {
   const {
      params: { chatUser = '', msgId = '' },
   } = useRoute();
   const navigation = useNavigation();
   const messageObject = useChatMessage(msgId);
   const {
      chatType,
      createdAt,
      msgStatus,
      msgBody: {
         message_type = '',
         message,
         media: { file_size, file = {}, androidWidth, thumb_image = '', local_path = '' } = {},
      } = {},
   } = messageObject;
   const imageUrl = local_path || file?.fileDetails?.uri;
   const messageWidth = androidWidth || '80%';
   const [dbValue, setDbValue] = React.useState([]);
   const [deliveredReport, setDeliveredReport] = React.useState();
   const [seenReport, setSeenReport] = React.useState();

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => backHandler.remove();
   }, []);

   React.useEffect(() => {
      (async () => {
         const _dbValue = await SDK.getMessageInfo(msgId);
         setDeliveredReport(_dbValue[0].receivedTime);
         setSeenReport(_dbValue[0].seenTime);
         setDbValue(_dbValue);
      })();
   }, [messageObject]);

   const handleBackBtn = () => {
      navigation.goBack();
      return true;
   };

   let statusVisible;
   switch (msgStatus) {
      case 3:
         statusVisible = styles.notSent;
         break;
      case 0:
         statusVisible = styles.notDelivered;
         break;
      case 1:
         statusVisible = styles.delivered;
         break;
      case 2:
         statusVisible = styles.seen;
         break;
   }

   const renderDefaultMessageWithData = (_data, isMedia) => {
      return (
         <View
            style={[
               commonStyles.px_8,
               commonStyles.py_2,
               commonStyles.minWidth_30per,
               commonStyles.maxWidth_90per,
               styles.textMessage,
            ]}>
            <Text style={[styles.textMessage, { fontStyle: isMedia ? 'italic' : 'normal' }]}>{_data}</Text>
            <View style={[commonStyles.hstack, commonStyles.alignItemsCenter, commonStyles.alignSelfFlexEnd]}>
               <View style={[styles?.msgStatus, statusVisible]} />
               <Text style={styles.timeStampText}>{getConversationHistoryTime(createdAt)}</Text>
            </View>
         </View>
      );
   };

   const doNothing = () => {}; // NOSONAR

   const getMessageStatus = currentStatus => {
      if (currentStatus === 3) {
         return (
            <View style={commonStyles.paddingHorizontal_12}>
               <SandTimer />
            </View>
         );
      }
      return <View style={[styles.currentStatus, statusVisible]} />;
   };

   const renderMapCard = () => {
      const _message = messageObject;
      return (
         <MapCard
            message={_message}
            status={getMessageStatus(_message?.msgStatus)}
            timeStamp={getConversationHistoryTime(_message?.createdAt)}
            isSender={true}
            handleReplyPress={doNothing}
            showReply={false}
         />
      );
   };

   const renderContactCard = () => {
      const _message = messageObject;
      return (
         <ContactCard
            message={_message}
            status={getMessageStatus(_message?.msgStatus)}
            timeStamp={getConversationHistoryTime(_message?.createdAt)}
            isSender={true}
            handleReplyPress={doNothing}
         />
      );
   };

   const renderMessageBasedOnType = () => {
      switch (message_type) {
         case 'text':
            return renderDefaultMessageWithData(message);
         case 'image':
            return (
               <ImageCard
                  messageObject={messageObject}
                  imgSrc={local_path}
                  status={getMessageStatus(msgStatus)}
                  timeStamp={getConversationHistoryTime(createdAt)}
               />
            );
         case 'video':
            return (
               <VideoCard
                  messageObject={messageObject}
                  imgSrc={getThumbBase64URL(thumb_image)}
                  status={getMessageStatus(msgStatus)}
                  timeStamp={getConversationHistoryTime(createdAt)}
               />
            );
         case 'audio':
            return (
               <AudioCard
                  messageObject={messageObject}
                  mediaUrl={imageUrl}
                  status={getMessageStatus(msgStatus)}
                  fileSize={file_size}
                  timeStamp={getConversationHistoryTime(createdAt)}
               />
            );
         case 'file':
            return (
               <DocumentMessageCard
                  message={messageObject}
                  status={getMessageStatus(msgStatus)}
                  timeStamp={getConversationHistoryTime(createdAt)}
                  fileSize={file_size}
                  mediaUrl={imageUrl}
               />
            );
         case 'location':
            return renderMapCard();
         case 'contact':
            return renderContactCard();
      }
   };

   const renderMessageBasedOnChatType = () => {
      const _chatType = chatType;
      if (_chatType === CHAT_TYPE_GROUP) {
         return <GroupChatMessageInfo chatUser={chatUser} dbValue={dbValue} />;
      } else {
         return (
            <View style={[commonStyles.paddingHorizontal_16]}>
               <Text
                  style={[
                     commonStyles.fw_600,
                     commonStyles.fontSize_18,
                     commonStyles.colorBlack,
                     commonStyles.marginBottom_8,
                  ]}>
                  Delivered
               </Text>
               <Text style={[styles.stautsText, commonStyles.marginBottom_8]}>
                  {deliveredReport ? change16TimeWithDateFormat(deliveredReport) : 'Message sent, not delivered yet'}
               </Text>
               <View style={commonStyles.dividerLine} />
               <Text
                  style={[
                     commonStyles.fw_600,
                     commonStyles.fontSize_18,
                     commonStyles.colorBlack,
                     commonStyles.marginTop_5,
                     commonStyles.marginBottom_8,
                  ]}>
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
                  <View style={[styles.messageContent]}>{renderMessageBasedOnType()}</View>
               </View>
            </View>
            <Divider my="5" />
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
