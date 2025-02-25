import { useEffect, useMemo, useState } from 'react';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { getMediaMessages, useMediaMessages } from '../redux/reduxHook';
import SDK from '../SDK/SDK';

const cache = {};

export const useMergedMediaMessages = (jid, mediaTypeArr = []) => {
   const userId = getUserIdFromJid(jid);
   const [fetchedMediaMessages, setFetchedMediaMessages] = useState([]);
   const [isLoading, setIsLoading] = useState(false);

   // Get media messages from Redux
   const stateMediaMessages = useMediaMessages(userId, mediaTypeArr);

   // Fetch media messages from SDK
   useEffect(() => {
      const cacheKey = `${jid}-${mediaTypeArr.join(',')}`;

      if (cache[cacheKey]) {
         setFetchedMediaMessages(cache[cacheKey]);
         return;
      }
      const getMediaMessage = async () => {
         if (!userId) {
            return;
         }
         setIsLoading(true);
         try {
            const fetchedData = await SDK.getMediaMessages({ jid, messageTypes: mediaTypeArr });
            const messages = fetchedData?.data || [];
            setFetchedMediaMessages(messages);
            cache[cacheKey] = messages;
         } catch (error) {
            console.log('Error fetching media messages:', error);
         }
         setIsLoading(false);
      };

      getMediaMessage();
   }, [userId]);

   const mergedMediaMessages = useMemo(() => {
      const fetchedMessagesMap = new Map();

      // Populate map with fetched messages
      fetchedMediaMessages.forEach(msg => {
         fetchedMessagesMap.set(msg.msgId, msg);
      });

      // Maintain stateMediaMessages order while merging
      const mergedMessages = stateMediaMessages.map(stateMsg => {
         if (fetchedMessagesMap.has(stateMsg.msgId)) {
            return {
               ...fetchedMessagesMap.get(stateMsg.msgId), // Keep fetched message properties
               ...stateMsg, // Override with state message properties
               msgBody: {
                  ...fetchedMessagesMap.get(stateMsg.msgId).msgBody,
                  ...stateMsg.msgBody,
                  media: {
                     ...fetchedMessagesMap.get(stateMsg.msgId).msgBody.media,
                     ...stateMsg.msgBody.media,
                  },
               },
            };
         } else {
            return stateMsg; // Keep state message if not in fetched messages
         }
      });

      // Append fetched messages that are NOT in stateMediaMessages
      fetchedMessagesMap.forEach((msg, msgId) => {
         if (!stateMediaMessages.some(stateMsg => stateMsg.msgId === msgId)) {
            mergedMessages.push(msg);
         }
      });

      // Sort by timestamp to ensure correct order
      return mergedMessages.sort((a, b) => a.timeStamp - b.timeStamp);
   }, [stateMediaMessages, fetchedMediaMessages]);

   return { mergedMediaMessages, isLoading };
};

export const getMergedMediaMessages = async (jid, mediaTypeArr = []) => {
   const userId = getUserIdFromJid(jid);
   const cacheKey = `${jid}-${mediaTypeArr.join(',')}`;

   // Get media messages from Redux
   const stateMediaMessages = getMediaMessages(userId, mediaTypeArr);
   const fetchedData = await SDK.getMediaMessages({ jid, messageTypes: mediaTypeArr });
   const fetchedMessagesMap = fetchedData?.data ? { ...fetchedData.data } : {};

   stateMediaMessages.forEach(stateMsg => {
      if (fetchedMessagesMap[stateMsg.msgId]) {
         fetchedMessagesMap[stateMsg.msgId] = {
            ...fetchedMessagesMap[stateMsg.msgId],
            ...stateMsg,
            msgBody: {
               ...fetchedMessagesMap[stateMsg.msgId].msgBody,
               ...stateMsg.msgBody,
               media: {
                  ...fetchedMessagesMap[stateMsg.msgId].msgBody?.media,
                  ...stateMsg.msgBody?.media,
               },
            },
         };
      } else {
         fetchedMessagesMap[stateMsg.msgId] = stateMsg;
      }
   });

   cache[cacheKey] = Object.values(fetchedMessagesMap);
};
