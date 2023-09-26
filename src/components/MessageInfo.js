import { Divider, HStack, Text, View } from 'native-base';
import React from 'react';
import ScreenHeader from './ScreenHeader';
import { BackHandler, StyleSheet } from 'react-native';
import {
  change16TimeWithDateFormat,
  getConversationHistoryTime,
} from '../common/TimeStamp';
import { useSelector } from 'react-redux';
import SDK from '../SDK/SDK';
import { useNetworkStatus } from '../hooks';
import { SandTimer } from '../common/Icons';
import commonStyles from '../common/commonStyles';
import MapCard from './MapCard';
import ContactCard from './ContactCard';

function MessageInfo(props) {
  const messages = useSelector(state => state.chatConversationData.data);
  const [deliveredReport, setDeliveredReport] = React.useState();
  const [seenReport, setSeenReport] = React.useState();

  const handleBackBtn = () => {
    props.setLocalNav('CHATCONVERSATION');
    return true;
  };

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    handleBackBtn,
  );

  React.useEffect(() => {
    return () => {
      backHandler.remove();
    };
  }, []);

  React.useEffect(() => {
    (async () => {
      const dbValue = await SDK.getMessageInfo(props.isMessageInfo.msgId);
      setDeliveredReport(dbValue[0].receivedTime);
      setSeenReport(dbValue[0].seenTime);
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
        px="2"
        py="1.5"
        minWidth="30%"
        maxWidth="90%"
        bgColor={'#E2E8F7'}
        borderWidth={0}
        borderRadius={10}
        borderBottomRightRadius={0}
        borderColor="#959595">
        <Text
          fontSize={14}
          color="#313131"
          {...(isMedia ? { italic: true } : {})}>
          {_data}
        </Text>
        <HStack alignItems="center" alignSelf="flex-end">
          <View style={[styles?.msgStatus, statusVisible]} />
          <Text pl="1" color="#959595" fontSize="11">
            {getConversationHistoryTime(props?.isMessageInfo?.createdAt)}
          </Text>
        </HStack>
      </View>
    );
  };

  const doNothing = () => {};

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
        return renderDefaultMessageWithData(
          props?.isMessageInfo?.msgBody?.message,
        );
      case 'image':
      case 'video':
      case 'audio':
      case 'file':
        return renderDefaultMessageWithData(
          props?.isMessageInfo?.msgBody?.message_type,
          true,
        );
      case 'location':
        return renderMapCard();
      case 'contact':
        return renderContactCard();
    }
  };

  return (
    <View>
      <ScreenHeader onhandleBack={handleBackBtn} title="Message Info" />
      <View
        style={[
          commonStyles.paddingHorizontal_12,
          commonStyles.alignSelfFlexEnd,
        ]}>
        <View style={styles.messageContentWrapper}>
          <View style={[styles.messageContent]}>
            {renderMessageBasedOnType()}
          </View>
        </View>
      </View>
      <Divider my="5" />
      <View px="5">
        <Text fontWeight={'600'} fontSize={'lg'}>
          Delivered
        </Text>
        <Text color={'#959595'}>
          {deliveredReport
            ? change16TimeWithDateFormat(deliveredReport)
            : 'Message sent, not delivered yet'}
        </Text>
        <Divider my="5" />
        <Text fontWeight={'600'} fontSize={'lg'}>
          Read
        </Text>
        <Text color={'#959595'}>
          {seenReport
            ? change16TimeWithDateFormat(seenReport)
            : 'Your message is not read'}
        </Text>
        <Divider my="5" />
      </View>
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
});
