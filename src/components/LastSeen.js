import React from 'react';
import { Text } from 'react-native';
import { useSelector } from 'react-redux';
import { formatUserIdToJid } from '../Helper/Chat/ChatHelper';
import { MIX_BARE_JID, USER_PRESENCE_STATUS_OFFLINE, USER_PRESENCE_STATUS_ONLINE } from '../Helper/Chat/Constant';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import SDK from '../SDK/SDK';
import MarqueeText from '../common/MarqueeText';
import { getLastseen } from '../common/TimeStamp';
import commonStyles from '../common/commonStyles';
import { useNetworkStatus } from '../hooks';

const LastSeen = props => {
   const isNetworkConnected = useNetworkStatus();
   const xmppConnection = useSelector(state => state.connection.xmppStatus);
   const [lastSeenData, setLastSeenData] = React.useState({
      seconds: -1,
      lastSeen: '',
      userPresenceStatus: '',
   });
   let timer = 0;
   const [config] = React.useState({
      marqueeOnStart: true,
      speed: 0.3,
      loop: true,
      delay: 0,
      consecutive: false,
   });
   const [isTyping, setIsTyping] = React.useState(false);
   const marqueeRef = React.useRef(null);
   const presenseData = useSelector(state => state.user.userPresence);
   const typingStatusData = useSelector(state => state.typingStatusData?.data) || {};
   const { fromUserJid, status } = presenseData;
   const userJid = props.jid;

   const getGrpParticipants = async () => {
      console.log('userJid ==>', userJid);
      if (MIX_BARE_JID.test(userJid)) {
         const grpList = await SDK.getGroupParticipants(userJid);
         console.log('getGroupParticipants ==>', JSON.stringify(grpList, null, 2));
      }
   };

   React.useEffect(() => {
      if (userJid) {
         getGrpParticipants();
         updateLastSeen(userJid);
      }
      return () => clearTimeout(timer);
   }, []);

   React.useEffect(() => {
      if (isNetworkConnected && xmppConnection === 'CONNECTED') {
         if (!lastSeenData.lastSeen) updateLastSeen(userJid, status);
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
      const _isTyping = Boolean(typingStatusData[getUserIdFromJid(userJid)]);
      isTyping !== _isTyping && setIsTyping(_isTyping);
   }, [typingStatusData]);

   const getLastSeenSeconds = async user_Jid => {
      if (!user_Jid) return -1;
      const lastSeenRes = await SDK.getLastSeen(user_Jid);
      if (lastSeenRes && lastSeenRes.statusCode === 200) {
         return lastSeenRes?.data?.seconds;
      }
      return -1;
   };

   const updateLastSeen = async (updateUserJid, userPresenceStatus, lastSeenSeconds) => {
      if (!updateUserJid) return;
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
      return <Text style={[commonStyles.typingText, commonStyles.fontSize_11]}>typing...</Text>;
   }

   return (
      <>
         {lastSeenData.lastSeen ? (
            <MarqueeText key={JSON.stringify(config)} ref={marqueeRef} {...config}>
               {lastSeenData.lastSeen}
            </MarqueeText>
         ) : null}
      </>
   );
};

export default LastSeen;
