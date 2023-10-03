import React from 'react';
import { BlockedIcon } from '../common/Icons';
import {
  THIS_MESSAGE_WAS_DELETED,
  YOU_DELETED_THIS_MESSAGE,
} from '../Helper/Chat/Constant';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { getSenderIdFromMsgObj } from '../Helper/Chat/Utility';
import { getConversationHistoryTime } from '../common/TimeStamp';
import commonStyles from '../common/commonStyles';
import MessagePressable from '../common/MessagePressable';
import ApplicationColors from '../config/appColors';

const DeletedMessage = (props = {}) => {
  const {
    messageObject,
    handleMsgSelect,
    selectedMsgs,
    messageObject: { msgId = '', createdAt = '', msgType = '' } = {},
    currentUserJID,
  } = props;
  const messageFrom = getSenderIdFromMsgObj(messageObject);
  const isReceiver =
    msgType !== 'acknowledge' &&
    messageFrom &&
    messageFrom.indexOf(currentUserJID) === -1;

  const isSender = !isReceiver;

  const handlePress = () => {
    Keyboard.dismiss();
    if (selectedMsgs.length > 0) {
      handleMsgSelect(messageObject, true);
    }
  };

  const handleLongPress = () => {
    Keyboard.dismiss();
    handleMsgSelect(messageObject, true);
  };

  return (
    <Pressable
      delayLongPress={300}
      pressedStyle={commonStyles.bg_transparent}
      onPress={handlePress}
      onLongPress={handleLongPress}>
      {({ pressed }) => (
        <View
          style={[
            styles.messageContainer,
            selectedMsgs.find(msg => msg.msgId === msgId)
              ? styles.highlightMessage
              : undefined,
          ]}>
          <MessagePressable
            forcePress={pressed}
            style={[
              commonStyles.paddingHorizontal_12,
              isSender
                ? commonStyles.alignSelfFlexEnd
                : commonStyles.alignSelfFlexStart,
            ]}
            contentContainerStyle={[
              styles.messageCommonStyle,
              isSender ? styles.sentMessage : styles.receivedMessage,
            ]}
            delayLongPress={300}
            onPress={handlePress}
            onLongPress={handleLongPress}>
            <View style={styles.messageWrapper}>
              <BlockedIcon />
              <Text style={styles.message(isSender)}>
                {isSender ? THIS_MESSAGE_WAS_DELETED : YOU_DELETED_THIS_MESSAGE}
              </Text>
            </View>
            <View style={styles.timeStamp}>
              <Text style={styles.timeStampText}>
                {getConversationHistoryTime(createdAt)}
              </Text>
            </View>
          </MessagePressable>
        </View>
      )}
    </Pressable>
  );
};

export default DeletedMessage;

const styles = StyleSheet.create({
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  message: isSender => ({
    marginLeft: 5,
    fontSize: 13,
    fontStyle: 'italic',
    paddingHorizontal: 3,
    paddingVertical: 4,
    color: isSender ? '#767676' : '#313131',
  }),
  timeStamp: {
    padding: 2,
    marginBottom: 4,
    alignSelf: 'flex-end',
  },
  timeStampText: {
    paddingLeft: 4,
    color: '#455E93',
    fontSize: 10,
    fontWeight: '400',
  },
  messageContainer: {
    marginBottom: 6,
  },
  highlightMessage: {
    backgroundColor: ApplicationColors.highlighedMessageBg,
  },
  messageCommonStyle: {
    borderRadius: 10,
    overflow: 'hidden',
    borderColor: '#DDE3E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    width: '100%',
  },
  sentMessage: {
    backgroundColor: '#E2E8F7',
    borderWidth: 0,
    borderBottomRightRadius: 0,
  },
  receivedMessage: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderBottomLeftRadius: 0,
  },
});
