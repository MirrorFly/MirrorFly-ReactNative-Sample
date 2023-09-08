import React from 'react';
import { BlockedIcon } from '../common/Icons';
import {
  THIS_MESSAGE_WAS_DELETED,
  YOU_DELETED_THIS_MESSAGE,
} from '../Helper/Chat/Constant';
import { Box, HStack, Pressable, Text, View } from 'native-base';
import { Keyboard, StyleSheet } from 'react-native';
import { getSenderIdFromMsgObj } from '../Helper/Chat/Utility';
import { getConversationHistoryTime } from '../common/TimeStamp';

const DeletedMessage = (props = {}) => {
  const {
    messageObject,
    handleMsgSelect,
    selectedMsgs,
    messageObject: { msgId = '', createdAt = '', msgType = '' } = {},
    currentUserJID,
  } = props;
  const messageFrom = getSenderIdFromMsgObj(messageObject);
  const isSender =
    msgType !== 'acknowledge' &&
    messageFrom &&
    messageFrom.indexOf(currentUserJID) === -1;

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
    <Pressable mb="1.5" onPress={handlePress} onLongPress={handleLongPress}>
      <Box
        width={'100%'}
        bg={
          selectedMsgs.find(msg => msg.msgId === msgId)
            ? 'rgba(0,0,0,0.2)'
            : 'transparent'
        }>
        <HStack alignSelf={isSender ? 'flex-start' : 'flex-end'} px="3">
          <View
            bgColor={isSender ? '#fff' : '#E2E8F7'}
            borderRadius={10}
            ml={isSender ? 0 : 3}
            minWidth="30%"
            width="78%"
            overflow={'hidden'}
            borderWidth={isSender ? 1 : 0}
            borderBottomLeftRadius={isSender ? 0 : 10}
            borderBottomRightRadius={isSender ? 10 : 0}
            borderColor="#DDE3E5">
            <HStack position={'relative'} alignItems={'center'} py={'1.5'}>
              <HStack ml={3}>
                <BlockedIcon />
              </HStack>
              <Text
                ml={1}
                style={styles.message}
                fontStyle={'italic'}
                fontSize={12}
                color={isSender ? '#767676' : '#313131'}>
                {isSender ? THIS_MESSAGE_WAS_DELETED : YOU_DELETED_THIS_MESSAGE}
              </Text>
              <View
                style={styles.timeStamp}
                position={'absolute'}
                right={2}
                bottom={1}>
                <Text
                  px={1}
                  textAlign={'right'}
                  color={isSender ? '#000' : '#455E93'}
                  fontWeight={'300'}
                  fontSize="12">
                  {getConversationHistoryTime(createdAt)}
                </Text>
              </View>
            </HStack>
          </View>
        </HStack>
      </Box>
    </Pressable>
  );
};

export default DeletedMessage;

const styles = StyleSheet.create({
  message: {
    fontSize: 14,
    paddingHorizontal: 3,
    paddingVertical: 4,
  },
  timeStamp: {
    flexDirection: 'row',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
