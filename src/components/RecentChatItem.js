import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import NickName from '../common/NickName';
import Pressable from '../common/Pressable';
import { convertUTCTOLocalTimeStamp, formatChatDateTime } from '../common/timeStamp';
import ApplicationColors from '../config/appColors';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { toggleChatSelection } from '../redux/recentChatDataSlice';
import { getSelectedChats, useRecentChatSearchText } from '../redux/reduxHook';
import { CONVERSATION_SCREEN, CONVERSATION_STACK } from '../screens/constants';
import commonStyles from '../styles/commonStyles';
import { getCurrentUserJid } from '../uikitMethods';
import { MuteChatRecentItem } from './MuteChat';
import RecentChatAvathar from './RecentChatAvathar';
import RecentChatMessage from './RecentChatMessage';

const RecentChatItem = React.memo(
   ({ item, index, component = 'recent-chat' }) => {
      const isRecentChatComponent = component === 'recent-chat';
      const { createdAt = '', userId = '', isSelected = 0, userJid, publisherJid } = item;
      const dispatch = useDispatch();
      const navigation = useNavigation();
      const searchText = useRecentChatSearchText();
      const isSender = getCurrentUserJid() === publisherJid;

      const handleSelectChat = userJid => () => {
         dispatch(toggleChatSelection(userJid));
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
               onPress={onPress(item.userJid)}
               onLongPress={searchText ? null : handleSelectChat(item.userJid)}>
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
                     <RecentChatMessage
                        isSender={isSender}
                        userId={getUserIdFromJid(userJid)}
                        item={item}
                        index={index}
                     />
                  </View>
                  <View style={[commonStyles.justifyContentCenter, commonStyles.alignItemsCenter]}>
                     <Text style={styles.time}>
                        {createdAt && formatChatDateTime(convertUTCTOLocalTimeStamp(createdAt), 'recent-chat')}
                     </Text>
                     <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                        <MuteChatRecentItem recentChatItem={item} isRecentChatComponent={isRecentChatComponent} />
                        {Boolean(item.archiveStatus) && isRecentChatComponent && (
                           <Text style={styles.archived}>Archived</Text>
                        )}
                     </View>
                  </View>
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
      fontSize: 11,
   },
   archived: {
      marginTop: 2,
      padding: 2,
      borderWidth: 1,
      borderColor: ApplicationColors.mainColor,
      color: ApplicationColors.mainColor,
      fontSize: 10,
      borderRadius: 5,
   },
});

export default React.memo(RecentChatItem);
