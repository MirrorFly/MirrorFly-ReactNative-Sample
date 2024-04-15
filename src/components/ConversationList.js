import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { fetchMessagesFromSDK } from '../Helper/Chat/ChatHelper';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { DoubleDownArrow } from '../common/Icons';
import Pressable from '../common/Pressable';
import ApplicationColors from '../config/appColors';
import { conversationFlatListRef, conversationFlatListScrollPositionRef } from '../hooks/useConversation';
import ChatMessage from './ChatMessage';
import config from '../config';

function ConversationList({ chatUserJid }) {
   const { data: messages } = useSelector(state => state.chatConversationData);
   const messageListRef = React.useRef([]);
   const chatUserId = getUserIdFromJid(chatUserJid);
   const messageList = React.useMemo(() => {
      if (chatUserId) {
         const _previousMessageList = messageListRef.current;
         const data = messages[chatUserId]?.messages ? Object.values(messages[chatUserId]?.messages) : [];
         data.reverse();
         // if (
         //    data.length > _previousMessageList.length && // to check if there is any new msg
         //    data[0]?.fromUserId === id && // to check if the new msg is received from the other user
         //    flatListScrollPositionRef.current.y > listBottomYaxisLimit // to check if the list scroll position is not in the bottom
         // ) {
         //    setNewMsgCount(val => val + 1);
         // }
         messageListRef.current = data; // updating the ref to track the previously calculated data like the total message count
         return data;
      }
      return [];
   }, [messages, chatUserId]);

   React.useEffect(() => {
      fetchMessagesFromSDK(chatUserJid);
   }, []);

   const chatMessageRender = React.useCallback(
      ({ item }) => {
         return (
            <ChatMessage
               // handleRecoverMessage={handleRecoverMessage}
               // handleReplyPress={handleReplyPress}
               // setLocalNav={setLocalNav}
               // handleMsgSelect={handleMsgSelect}
               // shouldSelectMessage={selectedMsgsIdRef?.current?.[msgId]}
               // showContactInviteModal={handleShowContactInviteModal}
               item={item}
            />
         );
      },
      [messageList],
   );

   const handleConversationScoll = ({ nativeEvent }) => {
      const { contentOffset } = nativeEvent;
      conversationFlatListScrollPositionRef.current = { ...contentOffset };
      // if (contentOffset.y > config.conversationListBottomYaxisLimit) {
      //    !showScrollToBottomIcon && setShowScrollToBottomIcon(true);
      // } else {
      //    newMsgCount > 0 && setNewMsgCount(0);
      //    showScrollToBottomIcon && setShowScrollToBottomIcon(false);
      // }
   };

   const doNothing = () => null;

   return (
      <>
         <FlatList
            keyboardShouldPersistTaps={'always'}
            ref={conversationFlatListRef}
            data={messageList}
            inverted
            renderItem={chatMessageRender}
            keyExtractor={item => item.msgId.toString()}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            onScrollToIndexFailed={doNothing}
            onScroll={handleConversationScoll}
            scrollEventThrottle={1000}
            windowSize={15}
            // onEndReached={handleLoadMore}
            // ListFooterComponent={renderChatFooter}
            onEndReachedThreshold={1}
         />
         {/* {showScrollToBottomIcon && (
            <Pressable
               style={styles.floatingScrollToBottomIconWrapper}
               contentContainerStyle={styles.floatingScrollToBottomIconContent}
               pressedStyle={styles.floatingScrollToBottomIconPressed}
               onPress={handleScollToBottomPress}>
               {newMsgCount > 0 && (
                  <View
                     style={[
                        styles.newMessgesCountBadgeWrapper,
                        newMsgCount > 99 && styles.newMessgesCountBadgeWrapperWith3Chars,
                     ]}>
                     <Text style={styles.newMessgesCountBadgeText}>{newMsgCount > 99 ? '99+' : newMsgCount}</Text>
                  </View>
               )}
               <DoubleDownArrow width={15} height={15} />
            </Pressable>
         )} */}
      </>
   );
}

export default ConversationList;

const styles = StyleSheet.create({
   floatingScrollToBottomIconWrapper: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: ApplicationColors.mainBorderColor,
      opacity: 0.8,
      zIndex: 100,
   },
   floatingScrollToBottomIconContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
   floatingScrollToBottomIconPressed: {
      backgroundColor: ApplicationColors.pressedBg,
      borderRadius: 15,
   },
   newMessgesCountBadgeWrapper: {
      position: 'absolute',
      right: '100%',
      marginRight: 2,
      minWidth: 20,
      paddingVertical: 1,
      paddingHorizontal: 5,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ApplicationColors.mainColor,
      borderRadius: 50,
   },
   newMessgesCountBadgeWrapperWith3Chars: {
      width: 33,
      paddingHorizontal: 0,
   },
   newMessgesCountBadgeText: {
      color: ApplicationColors.white,
   },
   inviteFriendModalContentContainer: {
      maxWidth: 500,
      width: '80%',
      backgroundColor: ApplicationColors.mainbg,
      borderRadius: 5,
      paddingVertical: 10,
   },
   modalTitle: {
      fontSize: 19,
      color: '#3c3c3c',
      fontWeight: '500',
      marginVertical: 15,
      paddingHorizontal: 25,
   },
   modalOption: {
      paddingHorizontal: 25,
      paddingVertical: 20,
      fontSize: 17,
   },
});
