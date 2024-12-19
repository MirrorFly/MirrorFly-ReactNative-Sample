import React, { createRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useDispatch } from 'react-redux';
import IconButton from '../common/IconButton';
import { LeftArrowIcon } from '../common/Icons';
import ApplicationColors from '../config/appColors';
import config from '../config/config';
import { setChatSearchText } from '../redux/chatMessageDataSlice';
import { useChatSearchLoading, useChatSearchText } from '../redux/reduxHook';

const searchInputTime = createRef();
searchInputTime.current = {};

function ChatHeaderSearch({ userId }) {
   const dispatch = useDispatch();
   const searchText = useChatSearchText('');
   const isSearchLoading = useChatSearchLoading(userId);

   const toggleSearch = () => {};

   const handleMessageSearch = text => {
      dispatch(setChatSearchText(text));
      clearTimeout(searchInputTime.current);
      searchInputTime.current = setTimeout(() => {
         // findChatMessageAndUpdate({ userId, conversationSearchText: text, resetCurrentIndex: true });
      }, config.typingStatusGoneWaitTime);
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
            // onSubmitEditing={() => handleFindMessageSearch({ text: searchText, resetCurrentIndex: true })}
         />
         <IconButton onPress={handleFindNext} disabled={isSearchLoading === 'upward'}>
            {isSearchLoading === 'upward' ? <ActivityIndicator /> : <UpArrowIcon color={themeColorPalatte.iconColor} />}
         </IconButton>
         <IconButton onPress={handleFindPrevious} disabled={isSearchLoading === 'downward'}>
            {isSearchLoading === 'downward' ? (
               <ActivityIndicator />
            ) : (
               <DownArrowIcon color={themeColorPalatte.iconColor} />
            )}
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
   },
});
