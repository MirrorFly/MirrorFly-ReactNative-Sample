import React from 'react';
import RNFS from 'react-native-fs';
import { useDispatch } from 'react-redux';
import SDK from '../SDK/SDK';
import { uploadFileToSDK } from '../SDK/utils';
import { updateProgressNotification } from '../Service/PushNotify';
import { useNetworkStatus } from '../common/hooks';
import { getCurrentChatUser, getUserIdFromJid, showToast } from '../helpers/chatHelpers';
import { mediaStatusConstants } from '../helpers/constants';
import { updateMediaStatus } from '../redux/chatMessageDataSlice';
import { getMediaProgress, useChatMessage } from '../redux/reduxHook';

const generateUniqueFilePath = async (filePath, counter = 0) => {
   // Modify the file path if the counter is greater than 0
   const extension = filePath.substring(filePath.lastIndexOf('.') + 1);
   const baseName = filePath.substring(0, filePath.lastIndexOf('.'));
   const modifiedFilePath = counter > 0 ? `${baseName}(${counter}).${extension}` : filePath;

   // Check if the file exists
   const exists = await RNFS.exists(modifiedFilePath);
   // Return the modified file path if it does not exist, otherwise recurse
   return exists ? generateUniqueFilePath(filePath, counter + 1) : modifiedFilePath;
};

const useMediaProgress = ({ uploadStatus = 0, downloadStatus = 0, msgId }) => {
   const userId = getUserIdFromJid(getCurrentChatUser());
   const dispatch = useDispatch();
   const chatMessage = useChatMessage(userId, msgId);
   const networkState = useNetworkStatus();
   /** 'NOT_DOWNLOADED' | 'NOT_UPLOADED' | 'DOWNLOADING' | 'UPLOADING' | 'DOWNLOADED' | 'UPLOADED'  */
   const [mediaStatus, setMediaStatus] = React.useState('');

   React.useEffect(() => {
      if (downloadStatus === 1) {
         setMediaStatus(mediaStatusConstants.DOWNLOADING);
      }
      if (uploadStatus === 2 && downloadStatus === 0) {
         setMediaStatus(mediaStatusConstants.NOT_DOWNLOADED);
      }
      if (uploadStatus === 2 && downloadStatus === 2) {
         setMediaStatus(mediaStatusConstants.LOADED);
      }
      if (uploadStatus === 3 && downloadStatus === 2) {
         setMediaStatus(mediaStatusConstants.NOT_UPLOADED);
      }
      if (uploadStatus === 1 || uploadStatus === 0 || uploadStatus === 8) {
         setMediaStatus(mediaStatusConstants.UPLOADING);
      }
   }, [uploadStatus, downloadStatus]);

   const handleDownload = async () => {
      try {
         const { source = {}, downloadJobId = '' } = getMediaProgress(msgId) || {};
         setMediaStatus(mediaStatusConstants.DOWNLOADING);
         dispatch(
            updateMediaStatus({
               msgId,
               userId,
               is_downloaded: 1,
            }),
         );
         const downloadResponse = downloadJobId
            ? await source?.resume({ downloadJobId })
            : await SDK.downloadMedia(msgId);
         console.log('downloadResponse ==>', downloadJobId, downloadResponse);
         updateProgressNotification(msgId, 0, 'download', true);
         if (downloadResponse?.statusCode === 200 || downloadResponse?.statusCode === 304) {
            dispatch(
               updateMediaStatus({
                  msgId,
                  userId,
                  local_path: downloadResponse?.decryptedFilePath,
                  is_downloaded: 2,
               }),
            );
            setMediaStatus(mediaStatusConstants.LOADED);
         } else {
            dispatch(
               updateMediaStatus({
                  msgId,
                  userId,
                  local_path: downloadResponse?.decryptedFilePath,
                  is_downloaded: 0,
               }),
            );
            setMediaStatus(mediaStatusConstants.NOT_DOWNLOADED);
         }
      } catch (error) {
         console.log('Error in handleDownload:', error);
      }
   };
   const handleUpload = () => {
      if (!networkState) {
         showToast('Please check your internet connection');
         return;
      }
      const retryObj = {
         msgId,
         userId,
         is_uploading: 1,
      };
      const { msgId: _msgId, msgBody: { media = {}, media: { file = {} } = {} } = {} } = chatMessage;
      dispatch(updateMediaStatus(retryObj));
      uploadFileToSDK(file, getCurrentChatUser(), _msgId, media);
   };

   const cancelProgress = async () => {
      try {
         const { source = {}, downloadJobId = '', uploadJobId = '' } = getMediaProgress(msgId);
         if (source) {
            if (downloadJobId || uploadJobId) {
               const cancelRes = await source?.cancel?.(downloadJobId || uploadJobId);
               console.log('cancelRes ==>', cancelRes);
               updateProgressNotification(msgId, 0, 'download', true);
               const mediaStatusObj = {
                  msgId,
                  userId,
                  ...(downloadJobId && { is_downloaded: 0 }),
                  ...(uploadJobId && { uploadStatus: 3 }),
               };
               dispatch(updateMediaStatus(mediaStatusObj));
               setMediaStatus(uploadJobId ? mediaStatusConstants.NOT_UPLOADED : mediaStatusConstants.NOT_DOWNLOADED);
            } else {
               source?.cancel?.('User Cancelled!');
               const mediaStatusObj = {
                  msgId,
                  userId,
                  uploadStatus: 3,
               };
               dispatch(updateMediaStatus(mediaStatusObj));
            }
         }
         if (uploadStatus === 8) {
            return true;
         }
      } catch (error) {
         console.log('cancelProgress ==>', error);
      }
   };

   return {
      retryUploadMedia: handleUpload,
      cancelProgress,
      downloadMedia: handleDownload,
      mediaStatus: mediaStatus,
   };
};
export default useMediaProgress;
