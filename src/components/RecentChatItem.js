import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import NickName from '../common/NickName';
import Pressable from '../common/Pressable';
import { convertUTCTOLocalTimeStamp, formatChatDateTime } from '../common/timeStamp';
import ApplicationColors from '../config/appColors';
import { getMessageStatus, getUserIdFromJid } from '../helpers/chatHelpers';
import { toggleArchiveChatSelection, toggleChatSelection } from '../redux/recentChatDataSlice';
import { getSelectedChats, useRecentChatSearchText } from '../redux/reduxHook';
import { CONVERSATION_SCREEN, CONVERSATION_STACK } from '../screens/constants';
import commonStyles from '../styles/commonStyles';
import { getCurrentUserJid } from '../uikitMethods';
import RecentChatAvathar from './RecentChatAvathar';
import RecentChatMessage from './RecentChatMessage';

const RecentChatItem = React.memo(
   ({ item, index, component = 'recent-chat' }) => {
      const { msgStatus, createdAt = '', userId = '', isSelected = 0, userJid, publisherJid, recallStatus } = item;
      const dispatch = useDispatch();
      const navigation = useNavigation();
      const searchText = useRecentChatSearchText();
      const isSender = getCurrentUserJid() === publisherJid;
      console.log('RecentChatItem userJid ==>', userJid);

      const handleSelectChat = userJid => () => {
         if (component === 'recent-chat') {
            dispatch(toggleChatSelection(getUserIdFromJid(userJid)));
         } else {
            dispatch(toggleArchiveChatSelection(getUserIdFromJid(userJid)));
         }
      };

      const handleRoute = chatUser => {
         navigation.navigate(CONVERSATION_STACK, { screen: CONVERSATION_SCREEN, params: { jid: chatUser } });
      };

      // Memoized onPress function
      const onPress = chatUser => () => {
         if (getSelectedChats().length) {
            handleSelectChat(getUserIdFromJid(chatUser))();
         } else {
            handleRoute(chatUser);
         }
      };

      return (
         <>
            <Pressable
               delayLongPress={300}
               onPress={onPress(item.userJid)}
               onLongPress={handleSelectChat(item.userJid)}>
               <View style={[styles.container, isSelected && commonStyles.pressedBg, styles.avatarContainer]}>
                  <View style={[commonStyles.positionRelative]}>
                     <RecentChatAvathar type={item.chatType} userId={userId} data={item?.profileDetails} />
                     {item.unreadCount > 0 && (
                        <View style={styles.unreadCountWrapper}>
                           <Text style={styles.unreadCountText}>
                              {item.unreadCount > 99 ? '99+' : item.unreadCount}
                           </Text>
                        </View>
                     )}
                  </View>
                  <View style={styles.contentContainer}>
                     <NickName
                        userId={userId}
                        style={styles.userName}
                        searchValue={searchText}
                        index={index}
                        data={item?.profileDetails}
                        ellipsizeMode="tail"
                     />
                     <View style={styles.lastSentMessageContainer}>
                        {isSender &&
                           item?.msgBody?.message_type !== 'notification' &&
                           !recallStatus &&
                           getMessageStatus(msgStatus, 8)}
                        <View style={commonStyles.p_1} />
                        <RecentChatMessage
                           isSender={isSender}
                           userId={getUserIdFromJid(userJid)}
                           item={item}
                           index={index}
                        />
                     </View>
                  </View>
                  <Text style={styles.time}>
                     {createdAt && formatChatDateTime(convertUTCTOLocalTimeStamp(createdAt), 'recent-chat')}
                  </Text>
               </View>
            </Pressable>
            <View style={styles.divider} />
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
      color: '#1f2937',
   },
   userName: {
      color: '#1f2937',
      fontWeight: 'bold',
      maxWidth: '90%',
   },
   divider: {
      width: '83%',
      height: 0.5,
      alignSelf: 'flex-end',
      backgroundColor: ApplicationColors.dividerBg,
   },
   lastSentMessageWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      maxWidth: '95%',
   },
   lastSentMessageTypeText: {
      paddingHorizontal: 5,
      color: '#767676',
   },
   lastSentMessageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   unreadCountWrapper: {
      position: 'absolute',
      top: -3,
      left: 30,
      backgroundColor: ApplicationColors.mainColor,
      minWidth: 20,
      paddingVertical: 1,
      paddingHorizontal: 4,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
   },
   unreadCountText: {
      color: ApplicationColors.white,
      fontSize: 13,
   },
});

export default React.memo(RecentChatItem);
