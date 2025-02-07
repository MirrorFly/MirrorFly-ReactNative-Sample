import { useEffect, useMemo, useState } from 'react';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { useMediaMessages } from '../redux/reduxHook';
import SDK from '../SDK/SDK';

export const useMergedMediaMessages = (jid, mediaTypeArr = []) => {
   const userId = getUserIdFromJid(jid);
   const [fetchedMediaMessages, setFetchedMediaMessages] = useState([]);
   const [isLoading, setIsLoading] = useState(false);

   // Get media messages from Redux
   const stateMediaMessages = useMediaMessages(userId, mediaTypeArr);

   // Fetch media messages from SDK
   useEffect(() => {
      const getMediaMessages = async () => {
         if (!userId) {
            return;
         }
         setIsLoading(true);
         try {
            const fetchedData = await SDK.getMediaMessages({ jid, messageTypes: mediaTypeArr });
            setFetchedMediaMessages(fetchedData?.data || []);
         } catch (error) {
            console.log('Error fetching media messages:', error);
         }
         setIsLoading(false);
      };

      getMediaMessages();
   }, [userId]);

   // Memoized merged media messages
   const mergedMediaMessages = useMemo(() => {
      const fetchedMessagesMap = {};

      // Populate map with fetched messages
      fetchedMediaMessages.forEach(msg => {
         fetchedMessagesMap[msg.msgId] = msg;
      });

      // Merge state messages, prioritizing state data
      stateMediaMessages.forEach(stateMsg => {
         if (fetchedMessagesMap[stateMsg.msgId]) {
            fetchedMessagesMap[stateMsg.msgId] = {
               ...fetchedMessagesMap[stateMsg.msgId],
               ...stateMsg,
               msgBody: {
                  ...fetchedMessagesMap[stateMsg.msgId].msgBody,
                  ...stateMsg.msgBody,
                  media: {
                     ...fetchedMessagesMap[stateMsg.msgId].msgBody.media,
                     ...stateMsg.msgBody.media,
                  },
               },
            };
         } else {
            fetchedMessagesMap[stateMsg.msgId] = stateMsg;
         }
      });

      return Object.values(fetchedMessagesMap);
   }, [stateMediaMessages, fetchedMediaMessages]);

   return { mergedMediaMessages, isLoading };
};
