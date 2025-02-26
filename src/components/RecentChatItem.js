import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import NickName from '../common/NickName';
import Pressable from '../common/Pressable';
import Text from '../common/Text';
import { convertUTCTOLocalTimeStamp, formatChatDateTime } from '../common/timeStamp';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { toggleChatSelection } from '../redux/recentChatDataSlice';
import { getSelectedChats, useRecentChatSearchText, useThemeColorPalatte } from '../redux/reduxHook';
import { CONVERSATION_SCREEN, CONVERSATION_STACK } from '../screens/constants';
import commonStyles from '../styles/commonStyles';
import { getCurrentUserJid } from '../uikitMethods';
import { MuteChatRecentItem } from './MuteChat';
import RecentChatAvathar from './RecentChatAvathar';
import RecentChatMessage from './RecentChatMessage';

const RecentChatItem = React.memo(
   ({ item, index, component = 'recent-chat', stringSet }) => {
      const isRecentChatComponent = component === 'recent-chat';
      const {
         chatType,
         createdAt = '',
         userId = '',
         isSelected = 0,
         userJid,
         publisherJid,
         unreadCount,
         profileDetails = {},
      } = item;
      const dispatch = useDispatch();
      const navigation = useNavigation();
      const themeColorPalatte = useThemeColorPalatte();
      const searchText = useRecentChatSearchText();
      const isSender = getCurrentUserJid() === publisherJid;

      const handleSelectChat = jid => () => {
         dispatch(toggleChatSelection(jid));
      };

      const handleRoute = chatUser => {
         navigation.navigate(CONVERSATION_STACK, { screen: CONVERSATION_SCREEN, params: { jid: chatUser } });
      };

      // Memoized onPress function
      const onPress = chatUser => () => {
         if (getSelectedChats().length) {
            handleSelectChat(chatUser)();
         } else {
            handleRoute(chatUser);
         }
      };

      return (
         <>
            <Pressable
               delayLongPress={300}
               onPress={onPress(userJid)}
               contentContainerStyle={isSelected && commonStyles.pressedBg(themeColorPalatte.pressedBg)}
               onLongPress={searchText ? null : handleSelectChat(userJid)}>
               <View style={[styles.container, isSelected && commonStyles.pressedBg, styles.avatarContainer]}>
                  <View style={[commonStyles.positionRelative]}>
                     <RecentChatAvathar type={chatType} userId={userId} data={profileDetails} />
                     {unreadCount > 0 && (
                        <View style={[styles.unreadCountWrapper, { backgroundColor: themeColorPalatte.primaryColor }]}>
                           <Text style={[styles.unreadCountText, { color: themeColorPalatte.white }]}>
                              {unreadCount > 99 ? '99+' : unreadCount}
                           </Text>
                        </View>
                     )}
                  </View>
                  <View style={styles.contentContainer}>
                     <NickName
                        userId={userId}
                        style={[styles.userName, { color: themeColorPalatte.primaryTextColor }]}
                        searchValue={searchText}
                        index={index}
                        data={profileDetails}
                        ellipsizeMode="tail"
                     />
                     <RecentChatMessage
                        isSender={isSender}
                        userId={getUserIdFromJid(userJid)}
                        item={item}
                        index={index}
                        stringSet={stringSet}
                        themeColorPalatte={themeColorPalatte}
                     />
                  </View>
                  <View style={[commonStyles.justifyContentCenter, commonStyles.alignItemsCenter]}>
                     <Text
                        style={[
                           styles.time,
                           {
                              color:
                                 unreadCount > 0 ? themeColorPalatte.primaryColor : themeColorPalatte.primaryTextColor,
                           },
                        ]}>
                        {createdAt && formatChatDateTime(convertUTCTOLocalTimeStamp(createdAt), 'recent-chat')}
                     </Text>
                     <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                        <MuteChatRecentItem recentChatItem={item} isRecentChatComponent={isRecentChatComponent} />
                        {Boolean(item.archiveStatus) && isRecentChatComponent && (
                           <Text
                              style={[
                                 styles.archived,
                                 { borderColor: themeColorPalatte.primaryColor, color: themeColorPalatte.primaryColor },
                              ]}>
                              {stringSet.COMMON_TEXT.RECENT_ARCHIVED_LABEL}
                           </Text>
                        )}
                     </View>
                  </View>
               </View>
            </Pressable>
            <View style={[styles.divider, { backgroundColor: themeColorPalatte.dividerBg }]} />
         </>
      );
   },
   (prevProps, nextProps) => {
      return prevProps.item === nextProps.item;
   },
);

const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 18,
   },
   avatarContainer: {
      marginRight: 10,
   },
   contentContainer: {
      flex: 1,
      maxWidth: '90%',
      marginLeft: 10,
   },
   nickname: {
      fontWeight: 'bold',
      marginBottom: 5,
   },
   message: {
      color: '#555',
   },
   time: {
      fontSize: 10,
   },
   userName: {
      fontWeight: 'bold',
      maxWidth: '90%',
   },
   divider: {
      width: '83%',
      height: 0.5,
      alignSelf: 'flex-end',
   },
   unreadCountWrapper: {
      position: 'absolute',
      top: -3,
      left: 30,
      minWidth: 20,
      paddingVertical: 1,
      paddingHorizontal: 4,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
   },
   unreadCountText: {
      fontSize: 11,
   },
   archived: {
      marginTop: 2,
      padding: 2,
      borderWidth: 1,
      fontSize: 10,
      borderRadius: 5,
   },
});

export default React.memo(RecentChatItem);
