import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { escapeRegExpReservedChars } from '../Helper';
import { THIS_MESSAGE_WAS_DELETED, YOU_DELETED_THIS_MESSAGE } from '../Helper/Chat/Constant';
import Avathar from '../common/Avathar';
import { SandTimer, VideoSmallIcon } from '../common/Icons';
import { convertUTCTOLocalTimeStamp, formatChatDateTime } from '../common/TimeStamp';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';
import useRosterData from '../hooks/useRosterData';

const VideoSmallIconComponent = () => VideoSmallIcon('#767676');

const RecentChatItem = React.memo(({ item, index, isSame, statusVisible, searchValue, isTyping }) => {
   const { profileDetails = {} } = item;
   console.log('userId');
   let { nickName, userId = '', image, colorCode } = useRosterData(item?.fromUserId);
   // updating default values
   nickName = nickName || profileDetails.nickName || item?.fromUserId || '';
   image = image || '';
   userId = userId || item?.fromUserId || '';
   colorCode = colorCode || profileDetails?.colorCode;

   const renderLastSentMessageBasedOnType = () => {
      const audioType = item?.msgBody?.media?.audioType;
      switch (item?.msgBody?.message_type) {
         case 'text':
            return <HighlightedMessage text={item?.msgBody?.message} searchValue={searchValue} index={index} />;
         // case 'auto_text':
         //    return <HighlightedMessage text={item?.msgBody?.message} searchValue={searchValue} index={index} />;
         // case 'image':
         //    return (
         //       <View style={[styles.lastSentMessageWrapper, commonStyles.paddingLeft_4]}>
         //          <ImageIcon />
         //          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.lastSentMessageTypeText}>
         //             Image
         //          </Text>
         //       </View>
         //    );
         // case 'video':
         //    return (
         //       <View style={[styles.lastSentMessageWrapper, commonStyles.paddingLeft_4]}>
         //          <VideoSmallIconComponent />
         //          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.lastSentMessageTypeText}>
         //             Video
         //          </Text>
         //       </View>
         //    );
         // case 'file':
         //    return (
         //       <View style={[styles.lastSentMessageWrapper, commonStyles.paddingLeft_4]}>
         //          <DocumentChatIcon />
         //          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.lastSentMessageTypeText}>
         //             File
         //          </Text>
         //       </View>
         //    );
         // case 'audio':
         //    return (
         //       <View style={[styles.lastSentMessageWrapper, commonStyles.paddingLeft_4]}>
         //          {Boolean(audioType) ? (
         //             <AudioMicIcon width="14" height="14" fill={'#767676'} />
         //          ) : (
         //             <AudioMusicIcon width="14" height="14" color={'#767676'} />
         //          )}

         //          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.lastSentMessageTypeText}>
         //             Audio
         //          </Text>
         //       </View>
         //    );
         // case 'location':
         //    return (
         //       <View style={styles.lastSentMessageWrapper}>
         //          <LocationMarkerIcon width="23" height="23" color={'#000'} />
         //          <Text
         //             numberOfLines={1}
         //             ellipsizeMode="tail"
         //             style={[styles.lastSentMessageTypeText, commonStyles.paddingLeft_0]}>
         //             Location
         //          </Text>
         //       </View>
         //    );
         // case 'contact':
         //    return (
         //       <View style={styles.lastSentMessageWrapper}>
         //          <ContactChatIcon />
         //          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.lastSentMessageTypeText]}>
         //             Contact
         //          </Text>
         //       </View>
         //    );
         default:
            return null;
      }
   };
   const renderLastMessage = () => {
      if (isTyping) {
         return <Text style={commonStyles.typingText}>typing...</Text>;
      }
      if (item?.msgBody?.message_type === 'notification') {
         return (
            <View style={styles.lastSentMessageWrapper}>
               <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.lastSentMessageTypeText]}>
                  {item?.msgBody?.notificationContent}
               </Text>
            </View>
         );
      }
      return item?.recallStatus === 1 ? (
         <View style={styles.lastSentDeletedMessageContainer}>
            <Text style={styles.deletedMessageText}>
               {isSame ? YOU_DELETED_THIS_MESSAGE : THIS_MESSAGE_WAS_DELETED}
            </Text>
         </View>
      ) : (
         <View style={styles.lastSentMessageContainer}>
            {isSame && item?.msgStatus !== 3 ? (
               <View style={[styles.msgStatus, isSame && Object.keys(item.msgBody).length ? statusVisible : '']} />
            ) : (
               isSame && item?.msgStatus === 3 && Object.keys(item.msgBody).length > 0 && <SandTimer />
            )}
            {renderLastSentMessageBasedOnType()}
         </View>
      );
   };

   return (
      <View key={item.msgId}>
         <View
            style={[
               commonStyles.hstack,
               item.msgBody.message_type ? commonStyles.alignItemsCenter : commonStyles.alignItemsFlexStart,
            ]}>
            <View style={commonStyles.positionRelative}>
               <Avathar type={item.chatType} data={nickName} backgroundColor={colorCode} profileImage={image} />
               {item.unreadCount > 0 && (
                  <View style={styles.unreadCountWrapper}>
                     <Text style={styles.unreadCountText}>{item.unreadCount > 99 ? '99+' : item.unreadCount}</Text>
                  </View>
               )}
            </View>
            <View style={[commonStyles.flex1, commonStyles.marginLeft_20]}>
               <HighlightedText text={nickName || userId} searchValue={searchValue} index={index} />
               {renderLastMessage()}
            </View>
            <Text style={[styles.lastMessageTimestamp, item.unreadCount > 0 && styles.mainColoredText]}>
               {item?.createdAt && formatChatDateTime(convertUTCTOLocalTimeStamp(item?.createdAt), 'recent-chat')}
            </Text>
         </View>
         <View style={styles.divider} />
      </View>
   );
});

export default RecentChatItem;

export const HighlightedMessage = ({ text, searchValue = '', index }) => {
   const parts = searchValue ? text.split(new RegExp(`(${escapeRegExpReservedChars(searchValue)})`, 'gi')) : [text];

   return (
      <View style={commonStyles.hstack}>
         {parts.map((part, i) => {
            const isSearchMatch = part?.toLowerCase() === searchValue.toLowerCase() ? styles.highlight : {};
            return (
               <Text
                  numberOfLines={1}
                  key={++i + '-' + index}
                  ellipsizeMode="tail"
                  style={[styles.highlightedMessageText, isSearchMatch]}>
                  {part}
               </Text>
            );
         })}
      </View>
   );
};

export const HighlightedText = ({ text, searchValue = '', index = '' }) => {
   const parts = searchValue ? text.split(new RegExp(`(${escapeRegExpReservedChars(searchValue)})`, 'gi')) : [text];

   return (
      <View style={commonStyles.hstack}>
         {parts.map((part, i) => {
            const isSearchMatch = part?.toLowerCase() === searchValue.toLowerCase() ? styles.highlight : {};
            return (
               <Text
                  numberOfLines={1}
                  key={++i + '-' + index}
                  ellipsizeMode="tail"
                  style={[styles.highlightedText, isSearchMatch]}>
                  {part}
               </Text>
            );
         })}
      </View>
   );
};

const styles = StyleSheet.create({
   msgStatus: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 4,
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
   highlight: {
      color: '#3276E2',
      fontWeight: 'bold',
   },
   lastSentDeletedMessageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
   },
   lastSentMessageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   deletedMessageText: {
      marginBottom: 2,
      fontStyle: 'italic',
      fontSize: 14,
      color: '#313131',
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
   lastMessageTimestamp: {
      fontSize: 10,
      color: '#1f2937',
      alignSelf: 'flex-start',
   },
   divider: {
      width: '83%',
      height: 1,
      alignSelf: 'flex-end',
      backgroundColor: ApplicationColors.dividerBg,
   },
   imageView: {
      flex: 0.72,
      alignItems: 'center',
      justifyContent: 'center',
   },
   image: {
      width: 200,
      height: 200,
   },
   noMsg: {
      color: '#181818',
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 8,
   },
   emptyChatView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ApplicationColors.white,
   },
   scrollView: {
      padding: 0,
      flex: 1,
      backgroundColor: ApplicationColors.white,
   },
   chatsSearchSubHeader: {
      flexDirection: 'row',
      width: '100%',
      paddingVertical: 10,
      backgroundColor: '#E5E5E5',
   },
   chatsSearchSubHeaderText: {
      marginLeft: 8,
      color: '#181818',
      fontSize: 16,
      fontWeight: '500',
   },
   chatsSearchSubHeaderCountText: {
      color: '#181818',
      marginLeft: 2,
      fontSize: 16,
      fontWeight: '800',
   },
   recentChatItemContainer: {
      width: '100%',
      paddingVertical: 16,
      paddingLeft: 16,
      paddingRight: 20,
   },
   highlightedText: {
      color: '#1f2937',
      fontWeight: 'bold',
      maxWidth: '90%',
   },
   highlightedMessageText: {
      color: '#767676',
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
   mainColoredText: {
      color: ApplicationColors.mainColor,
   },
});
