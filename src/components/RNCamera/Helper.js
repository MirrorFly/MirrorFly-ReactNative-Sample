import { Platform } from 'react-native';
import { getUserIdFromJid } from '../../Helper/Chat/Utility';
import {
  CALL_BACK,
  NOTIFICATION,
  audioEmoji,
  contactEmoji,
  fileEmoji,
  imageEmoji,
  locationEmoji,
  videoEmoji,
} from '../../constant';

export const orientationCheck = orientation => {
  if (Platform.OS === 'ios') {
    return false;
  } else {
    return orientation === 1 || orientation === 2;
  }
};

export const getNotifyNickName = (res, type) => {
  if (type === CALL_BACK) {
    return (
      res?.msgBody?.nickName ||
      res?.profileDetails?.nickName ||
      res?.profileDetails?.userId ||
      getUserIdFromJid(res?.publisherJid)
    );
  }
  if (type === NOTIFICATION) {
    return (
      res?.vcardDetails?.nickname ||
      res?.vcardDetails?.lnickname ||
      res?.vcardDetails?.username
    );
  }
};

export const getNotifyMessage = res => {
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
