import { Platform } from 'react-native';
import { getUserIdFromJid } from '../../Helper/Chat/Utility';
import { audioEmoji, contactEmoji, fileEmoji, imageEmoji, locationEmoji, videoEmoji } from '../../constant';
import { THIS_MESSAGE_WAS_DELETED } from '../../Helper/Chat/Constant';

export const orientationCheck = orientation => {
   if (Platform.OS === 'ios') {
      return false;
   } else {
      return orientation === 1 || orientation === 2;
   }
};

export const getNotifyNickName = res => {
   return (
      res?.msgBody?.nickName ||
      res?.profileDetails?.nickName ||
      res?.profileDetails?.userId ||
      getUserIdFromJid(res?.publisherJid)
   );
};

export const getNotifyMessage = res => {
   switch (true) {
      case res.recallStatus === 1:
         return THIS_MESSAGE_WAS_DELETED;
      case res.msgBody.message_type === 'text':
         return res?.msgBody?.message;
      case res.msgBody.message_type === 'image':
         return imageEmoji + ' Image';
      case res.msgBody.message_type === 'video':
         return videoEmoji + ' Video';
      case res.msgBody.message_type === 'audio':
         return audioEmoji + ' Audio';
      case res.msgBody.message_type === 'file':
         return fileEmoji + ' File';
      case res.msgBody.message_type === 'location':
         return locationEmoji + ' Location';
      case res.msgBody.message_type === 'contact':
         return contactEmoji + ' Contact';
   }
};

export const getCallNotifyMessage = res => {
   switch (res.msgBody.message_type) {
      case 'text':
         return res?.msgBody?.message;
      case 'image':
         return imageEmoji + ' Image';
      case 'video':
         return videoEmoji + ' Video';
      case 'audio':
         return audioEmoji + ' Audio';
      case 'file':
         return fileEmoji + ' File';
      case 'location':
         return locationEmoji + ' Location';
      case 'contact':
         return contactEmoji + ' Contact';
   }
};
