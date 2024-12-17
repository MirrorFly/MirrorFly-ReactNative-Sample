import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import SDK from '../SDK/SDK';
import MarqueeText from '../common/MarqueeText';
import { useNetworkStatus } from '../common/hooks';
import { getLastseen } from '../common/timeStamp';
import { formatUserIdToJid, getUserIdFromJid } from '../helpers/chatHelpers';
import { USER_PRESENCE_STATUS_OFFLINE, USER_PRESENCE_STATUS_ONLINE } from '../helpers/constants';
import {
   useBlockedStatus,
   useIsBlockedMeStatus,
   usePresenceData,
   useTypingData,
   useXmppConnectionStatus,
} from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

const LastSeen = ({ userJid = '', style }) => {
   const userId = getUserIdFromJid(userJid);
   const isNetworkConnected = useNetworkStatus();
   const xmppConnection = useXmppConnectionStatus();
   const blockedStatus = useBlockedStatus(userId);
   const isBlockedMeStatus = useIsBlockedMeStatus(userId);

   const presenceData = usePresenceData(userId);
   const typingStatusData = useTypingData(userId) || {};

   const [lastSeenData, setLastSeenData] = useState({ lastSeen: '', userPresenceStatus: '' });
   const [isTyping, setIsTyping] = useState('');
   const marqueeRef = useRef(null);

   const config = { marqueeOnStart: true, speed: 2, loop: false, delay: 0, consecutive: true };

   const updateLastSeen = useCallback(async (updateUserJid, userPresenceStatus) => {
      const formattedJid = formatUserIdToJid(updateUserJid);
      const { data: { seconds: lastSeenSeconds = -1 } = {} } = await SDK.getLastSeen(formattedJid);
      const lastSeen = lastSeenSeconds !== -1 ? getLastseen(lastSeenSeconds) : '';
      userPresenceStatus =
         userPresenceStatus || (lastSeenSeconds > 0 ? USER_PRESENCE_STATUS_OFFLINE : USER_PRESENCE_STATUS_ONLINE);

      setLastSeenData({ lastSeen, userPresenceStatus });
   }, []);

   useFocusEffect(
      useCallback(() => {
         if (userJid) updateLastSeen(userJid);
      }, [userJid]),
   );

   useEffect(() => {
      if (blockedStatus || isBlockedMeStatus) {
         setLastSeenData({ lastSeen: '', userPresenceStatus: '' });
         return;
      }
      if (isNetworkConnected && xmppConnection === 'CONNECTED' && !lastSeenData.lastSeen) {
         updateLastSeen(userJid, presenceData?.status);
      }
   }, [isNetworkConnected, xmppConnection, blockedStatus, isBlockedMeStatus, presenceData]);

   useEffect(() => {
      if (typingStatusData.fromUserId) {
         setIsTyping('typing...');
      } else if (typingStatusData.groupId) {
         setIsTyping(`${getUserNameFromStore(typingStatusData.fromUserId)} typing...`);
      } else {
         setIsTyping('');
      }
   }, [typingStatusData]);

   if (isTyping) {
      return <Text style={[commonStyles.typingText, commonStyles.fontSize_11]}>{isTyping}</Text>;
   }

   return lastSeenData.lastSeen ? (
      <MarqueeText style={style} ref={marqueeRef} {...config}>
         {lastSeenData.lastSeen}
      </MarqueeText>
   ) : null;
};

export default LastSeen;
