import React, { createRef } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { getHasNextChatPage } from '../SDK/utils';
import IconButton from '../common/IconButton';
import { DownArrowIcon, LeftArrowIcon, UpArrowIcon } from '../common/Icons';
import ApplicationColors from '../config/appColors';
import config from '../config/config';
import { calculateOffset, dispatchSearchLoading, getUserIdFromJid, showToast } from '../helpers/chatHelpers';
import { highlightMessage, setChatSearchText, toggleIsChatSearching } from '../redux/chatMessageDataSlice';
import { getChatMessages, getIsChatSearching, useChatSearchLoading, useChatSearchText } from '../redux/reduxHook';
import store from '../redux/store';
import { currentChatUser } from '../screens/ConversationScreen';
import { mflog } from '../uikitMethods';
import { conversationFlatListRef } from './ConversationList';

const searchInputTime = createRef();
searchInputTime.current = {};

let _filteredMsgIndices = [],
   currentMsgIndex = 0,
   hasDispatchedSearchLoading = false;

// Common function to reset or update search index
const updateSearchIndex = (resetCurrentIndex, updateCurrentIndex) => {
   if (resetCurrentIndex) {
      currentMsgIndex = 0;
   }
   if (updateCurrentIndex) {
      currentMsgIndex += updateCurrentIndex;
   }
};

// Handle Scrolling to Correct Offset
export const handleOffset = ({ userId, scrollIndex }) => {
   return new Promise((resolve, reject) => {
      try {
         const itemLayout = conversationFlatListRef.current.itemLayout;
         const itemLayoutKeys = Object.keys(itemLayout);

         if (itemLayoutKeys.length < scrollIndex) {
            const lastMessageIndex = getChatMessages(userId).length - 1;
            let offset = calculateOffset(itemLayout, lastMessageIndex);

            const handleScrollLoop = () => {
               conversationFlatListRef.current?.scrollToOffset({
                  offset,
                  animated: true,
               });

               const updatedItemLayoutKeys = Object.keys(conversationFlatListRef.current.itemLayout);
               if (updatedItemLayoutKeys.length >= scrollIndex) {
                  resolve(true);
               } else {
                  setTimeout(handleScrollLoop, 500);
               }
            };

            handleScrollLoop();
         } else {
            resolve(true);
         }
      } catch (error) {
         mflog('Failed to handle offset', error);
         reject(false);
      }
   });
};

// Highlight and Scroll to Message
export const highLightAndScrollToIndex = async ({ userId, msgId, scrollIndex }) => {
   try {
      const offset = await handleOffset({ userId, scrollIndex });
      if (!offset) {
         return showToast('Something went wrong');
      }
      if (scrollIndex < 0) {
         return showToast('No results found');
      }

      store.dispatch(highlightMessage({ userId, msgId, shouldHighlight: 1 }));
      conversationFlatListRef.current.scrollToIndex({
         index: scrollIndex,
         animated: true,
         viewPosition: 0.5,
      });

      setTimeout(() => {
         store.dispatch(highlightMessage({ userId, msgId, shouldHighlight: 0 }));
      }, 500);
   } catch (error) {
      mflog('Failed to highlight or scroll to message', error);
      store.dispatch(highlightMessage({ userId, msgId, shouldHighlight: 0 }));
   }
};
// Find and filter chat messages
export const findChatMessageAndUpdate = ({ userId, conversationSearchText, resetCurrentIndex }) => {
   try {
      if (resetCurrentIndex) {
         currentMsgIndex = 0;
      }
      _filteredMsgIndices = [];
      console.log('conversationSearchText ==>', conversationSearchText);
      const messageList = getChatMessages(userId);
      const searchText = conversationSearchText.trim().toLowerCase();

      if (!searchText) {
         return { message: 'No search Value' };
      }

      messageList.forEach((msg, index) => {
         const msgBody = msg?.msgBody || {};
         const messageType = msgBody?.message_type;
         const media = msgBody?.media || {};

         if (messageType === 'text' && msgBody.message?.toLowerCase().includes(searchText)) {
            _filteredMsgIndices.push({ index, msgId: msg.msgId, message: 'Text message found' });
         } else if (messageType === 'file' && media?.fileName?.toLowerCase().includes(searchText)) {
            _filteredMsgIndices.push({ index, msgId: msg.msgId, message: 'File message found' });
         } else if (['image', 'video'].includes(messageType) && media?.caption?.toLowerCase().includes(searchText)) {
            _filteredMsgIndices.push({ index, msgId: msg.msgId, message: `${messageType} message found` });
         }
      });
      if (resetCurrentIndex) {
         currentMsgIndex = 0;
      }
      console.log('_filteredMsgIndices[currentMsgIndex] ==>', currentMsgIndex, _filteredMsgIndices[currentMsgIndex]);
      return _filteredMsgIndices[currentMsgIndex] || { message: 'No message found' };
   } catch (error) {
      mflog('Failed to find message based on text', error);
      return { message: error };
   }
};

// Handle message search
export const handleFindMessageSearch = async ({ text, resetCurrentIndex = false, updateCurrentIndex }) => {
   try {
      const chatUser = currentChatUser;
      const userId = getUserIdFromJid(chatUser);
      const searchText = text?.trim();
      if (!searchText) {
         return;
      } // Early return for empty search

      updateSearchIndex(resetCurrentIndex, updateCurrentIndex);
      _filteredMsgIndices = [];

      // Dispatch loading state once
      if (!hasDispatchedSearchLoading) {
         dispatchSearchLoading(userId, 'search');
      }

      // Search for the message
      const { index: scrollIndex = -1, msgId = '' } = findChatMessageAndUpdate({
         userId,
         conversationSearchText: searchText,
         resetCurrentIndex,
      });
      console.log('msgId ==>', msgId);
      console.log('scrollIndex ==>', scrollIndex);
      if (scrollIndex < 0) {
         // if (getHasNextChatPage(userId)) {
         //    return fetchMessagesFromSDK(chatUser, true).then(() => handleFindMessageSearch({ text }));
         // } else {
         // }
         dispatchSearchLoading(userId); // Close search loading
         return showToast('No results found');
      }

      dispatchSearchLoading(userId); // Close search loading
      highLightAndScrollToIndex({ userId, msgId, scrollIndex });
   } catch (error) {
      mflog('Failed to find message', error);
   }
};

// Handle navigation to next or previous message
export const handleFindNextMessage = async ({ direction }) => {
   try {
      const chatUser = currentChatUser;
      const userId = getUserIdFromJid(chatUser);
      const updateCurrentIndex = direction === 'upward' ? 1 : -1;

      // Dispatch loading state if not already dispatched
      if (!hasDispatchedSearchLoading) {
         dispatchSearchLoading(userId, direction);
      }

      const { index: scrollIndex = -1, msgId = '' } = _filteredMsgIndices?.[currentMsgIndex + updateCurrentIndex] || {};

      if (scrollIndex < 0) {
         if (getHasNextChatPage(userId) && getIsChatSearching()) {
            return showToast('Need to fetch');
            // return handleFindMessageSearch({ text: getChatSearchText(), updateCurrentIndex });
         } else {
            dispatchSearchLoading(userId); // Close search loading
            return showToast('No results found');
         }
      }
      if (scrollIndex > -1) {
         dispatchSearchLoading(userId); // Close search loading
         currentMsgIndex += updateCurrentIndex;
         highLightAndScrollToIndex({ userId, msgId, scrollIndex });
      }
   } catch (error) {
      mflog(`Failed to find ${direction} message`, error);
   }
};

function ChatHeaderSearch({ userId }) {
   const dispatch = useDispatch();
   const searchText = useChatSearchText('');
   const isSearchLoading = useChatSearchLoading(userId);

   const toggleSearch = () => {
      dispatch(setChatSearchText(''));
      dispatch(toggleIsChatSearching(!getIsChatSearching()));
   };

   const handleMessageSearch = text => {
      dispatch(setChatSearchText(text));
      clearTimeout(searchInputTime.current);
      searchInputTime.current = setTimeout(() => {
         findChatMessageAndUpdate({ userId, conversationSearchText: text, resetCurrentIndex: true });
      }, config.typingStatusGoneWaitTime);
   };

   const handleFindNext = () => {
      handleFindNextMessage({ direction: 'upward' });
   };

   const handleFindPrevious = () => {
      handleFindNextMessage({ direction: 'downward' });
   };

   return (
      <View style={[styles.headerContainer]}>
         <IconButton onPress={toggleSearch}>
            <LeftArrowIcon />
         </IconButton>
         <TextInput
            placeholderTextColor="#d3d3d3"
            style={styles.textInput}
            placeholder=" Search..."
            cursorColor={ApplicationColors.mainColor}
            returnKeyType="done"
            autoFocus={true}
            value={searchText}
            onChangeText={handleMessageSearch}
            selectionColor={ApplicationColors.mainColor}
            returnKeyLabel="Search"
            onSubmitEditing={() => handleFindMessageSearch({ text: searchText, resetCurrentIndex: true })}
         />
         <IconButton onPress={handleFindNext} disabled={isSearchLoading === 'upward'}>
            {isSearchLoading === 'upward' ? <ActivityIndicator /> : <UpArrowIcon />}
         </IconButton>
         <IconButton onPress={handleFindPrevious} disabled={isSearchLoading === 'downward'}>
            {isSearchLoading === 'downward' ? <ActivityIndicator /> : <DownArrowIcon />}
         </IconButton>
      </View>
   );
}

export default ChatHeaderSearch;

const styles = StyleSheet.create({
   headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      height: 60,
      backgroundColor: ApplicationColors.headerBg,
      borderBottomWidth: 1,
      borderBottomColor: ApplicationColors.mainBorderColor,
      elevation: 2,
      shadowColor: '#181818',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      paddingHorizontal: 10,
   },
   textInput: {
      flex: 1,
      color: 'black',
      fontSize: 16,
      height: 35,
      borderBottomColor: ApplicationColors.mainColor,
      borderBottomWidth: 1,
   },
});
