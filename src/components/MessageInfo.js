import { Divider } from 'native-base';
import React from 'react';
import ScreenHeader from './ScreenHeader';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { change16TimeWithDateFormat, getConversationHistoryTime } from '../common/TimeStamp';
import { useSelector } from 'react-redux';
import SDK from '../SDK/SDK';
import { SandTimer } from '../common/Icons';
import commonStyles from '../common/commonStyles';
import MapCard from './MapCard';
import ContactCard from './ContactCard';
import { CHAT_TYPE_GROUP } from '../Helper/Chat/Constant';
import GroupChatMessageInfo from './GroupChatMessageInfo';

function MessageInfo(props) {
   const messages = useSelector(state => state.chatConversationData.data);
   const [dbValue, setDbValue] = React.useState([]);
   const [deliveredReport, setDeliveredReport] = React.useState();
   const [seenReport, setSeenReport] = React.useState();

   const handleBackBtn = () => {
      props.setLocalNav('CHATCONVERSATION');
      return true;
   };

   const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);

   React.useEffect(() => {
      return () => {
         backHandler.remove();
      };
   }, []);

   React.useEffect(() => {
      (async () => {
         const _dbValue = await SDK.getMessageInfo(props.isMessageInfo.msgId);
         setDeliveredReport(_dbValue[0].receivedTime);
         setSeenReport(_dbValue[0].seenTime);
         setDbValue(_dbValue);
      })();
   }, [messages]);

   let statusVisible;
   switch (props?.isMessageInfo?.msgStatus) {
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
               <Text style={styles.timeStampText}>{getConversationHistoryTime(props?.isMessageInfo?.createdAt)}</Text>
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
      const _message = props?.isMessageInfo;
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
      const _message = props?.isMessageInfo;
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
      switch (props?.isMessageInfo?.msgBody?.message_type) {
         case 'text':
            return renderDefaultMessageWithData(props?.isMessageInfo?.msgBody?.message);
         case 'image':
         case 'video':
         case 'audio':
         case 'file':
            return renderDefaultMessageWithData(props?.isMessageInfo?.msgBody?.message_type, true);
         case 'location':
            return renderMapCard();
         case 'contact':
            return renderContactCard();
      }
   };

   const renderMessageBasedOnChatType = () => {
      const chatType = props?.isMessageInfo?.chatType;
      if (chatType === CHAT_TYPE_GROUP) {
         return <GroupChatMessageInfo chatUser={props.chatUser} dbValue={dbValue} />;
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
               <Text style={[{ color: '#959595' }, commonStyles.marginBottom_8]}>
                  {deliveredReport ? change16TimeWithDateFormat(deliveredReport) : 'Message sent, not delivered yet'}
               </Text>
               <View style={commonStyles.dividerLine} />
               <Text
                  style={[
                     commonStyles.fw_600,
                     commonStyles.fontSize_18,
                     commonStyles.colorBlack,
                     commonStyles.marginBottom_8,
                  ]}>
                  Read
               </Text>
               <Text style={[{ color: '#959595' }, commonStyles.marginBottom_8]}>
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
         <View style={[commonStyles.paddingHorizontal_12, commonStyles.alignSelfFlexEnd, commonStyles.mt_20]}>
            <View style={styles.messageContentWrapper}>
               <View style={[styles.messageContent]}>{renderMessageBasedOnType()}</View>
            </View>
         </View>
         <Divider my="5" />
         {renderMessageBasedOnChatType()}
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
      maxWidth: '80%',
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
});
