import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { useNetworkStatus } from '../common/hooks';
import Text from '../common/Text';
import { getLastseen } from '../common/timeStamp';
import { formatUserIdToJid, getUserIdFromJid } from '../helpers/chatHelpers';
import { USER_PRESENCE_STATUS_OFFLINE, USER_PRESENCE_STATUS_ONLINE } from '../helpers/constants';
import {
   getUserNameFromStore,
   usePresenceData,
   useThemeColorPalatte,
   useTypingData,
   useXmppConnectionStatus,
} from '../redux/reduxHook';
import SDK from '../SDK/SDK';
import commonStyles from '../styles/commonStyles';

const LastSeen = ({ userJid = '', style }) => {
   const userId = getUserIdFromJid(userJid);
   const isNetworkConnected = useNetworkStatus();
   const themeColorPalatte = useThemeColorPalatte();
   const xmppConnection = useXmppConnectionStatus();
   const [lastSeenData, setLastSeenData] = React.useState({
      seconds: -1,
      lastSeen: '',
      userPresenceStatus: '',
   });
   let timer = 0;
   const [config] = React.useState({
      marqueeOnStart: true,
      speed: 2,
      loop: false,
      delay: 0,
      consecutive: true,
   });
   const [isTyping, setIsTyping] = React.useState('');
   const marqueeRef = React.useRef(null);
   const presenseData = usePresenceData(userId) || {};
   const typingStatusData = useTypingData(userId) || {};

   const memoizedTypingStatusData = React.useMemo(() => typingStatusData, [typingStatusData]);
   const { fromUserJid = '', status = '' } = presenseData;

   useFocusEffect(
      React.useCallback(() => {
         if (userJid) {
            updateLastSeen(userJid);
         }
         return () => clearTimeout(timer);
      }, [userJid]),
   );

   React.useEffect(() => {
      if (isNetworkConnected && xmppConnection === 'CONNECTED') {
         if (!lastSeenData.lastSeen) {
            updateLastSeen(userJid, status);
         }
      } else
         setLastSeenData({
            ...lastSeenData,
            lastSeen: '',
         });
   }, [isNetworkConnected, xmppConnection]);

   React.useEffect(() => {
      if (fromUserJid === userJid && status !== lastSeenData.userPresenceStatus) {
         if (status === USER_PRESENCE_STATUS_OFFLINE) {
            timer = setTimeout(async () => {
               updateLastSeen(userJid, status);
            }, 500);
         } else {
            updateLastSeen(userJid, status);
         }
      }
   }, [presenseData]);

   React.useEffect(() => {
      if (typingStatusData.groupId) {
         setIsTyping(`${getUserNameFromStore(typingStatusData.fromUserId)} typing...`);
      } else if (typingStatusData.fromUserId) {
         setIsTyping('typing...');
      } else {
         setIsTyping('');
      }
   }, [memoizedTypingStatusData]);

   const getLastSeenSeconds = async user_Jid => {
      if (!user_Jid) {
         return -1;
      }
      const lastSeenRes = await SDK.getLastSeen(user_Jid);
      if (lastSeenRes && lastSeenRes.statusCode === 200) {
         return lastSeenRes?.data?.seconds;
      }
      return -1;
   };

   const updateLastSeen = async (updateUserJid, userPresenceStatus, lastSeenSeconds) => {
      if (!updateUserJid) {
         return;
      }
      updateUserJid = formatUserIdToJid(updateUserJid);
      let seconds = '';
      let lastSeen = '';
      seconds = lastSeenSeconds || (await getLastSeenSeconds(updateUserJid));
      lastSeen = seconds != -1 ? getLastseen(seconds) : '';
      userPresenceStatus =
         userPresenceStatus || (seconds > 0 ? USER_PRESENCE_STATUS_OFFLINE : USER_PRESENCE_STATUS_ONLINE);
      setLastSeenData({
         ...lastSeenData,
         seconds,
         lastSeen,
         userPresenceStatus,
      });
   };

   if (isTyping) {
      return (
         <Text style={[commonStyles.textColor(themeColorPalatte.primaryColor), commonStyles.fontSize_11]}>
            {isTyping}
         </Text>
      );
   }

   return (
      <>
         {lastSeenData.lastSeen ? (
            <Text
               key={JSON.stringify(config)}
               ref={marqueeRef}
               {...config}
               style={{ color: themeColorPalatte.headerSecondaryTextColor, fontWeight: '700', fontSize: 11 }}>
               {lastSeenData.lastSeen}
            </Text>
         ) : null}
      </>
   );
};

export default LastSeen;
