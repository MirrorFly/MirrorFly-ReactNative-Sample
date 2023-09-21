import { Platform } from 'react-native';
import { getUserIdFromJid } from '../../Helper/Chat/Utility';

export const orientationCheck = orientation => {
  if (Platform.OS === 'ios') {
    return false;
  } else {
    return orientation === 1 || orientation === 2;
  }
};

export const getNotifyNickName = res =>
  res?.msgBody?.nickName ||
  res?.profileDetails?.nickName ||
  res?.profileDetails?.userId ||
  getUserIdFromJid(res?.publisherJid);

export const getNotifyMessage = res => {
  if (res.msgBody.message_type === 'text') return res?.msgBody?.message;
  if (res.msgBody.message_type === 'image') return 'Image';
  if (res.msgBody.message_type === 'video') return 'Video';
  if (res.msgBody.message_type === 'audio') return 'Audio';
  if (res.msgBody.message_type === 'file') return 'File';
  if (res.msgBody.message_type === 'location') return 'Location';
  if (res.msgBody.message_type === 'contact') return 'Contact';

  else return res.msgBody.message_type;
};
