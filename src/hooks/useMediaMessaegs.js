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
