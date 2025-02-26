import React from 'react';
import { useDispatch } from 'react-redux';
import { useNetworkStatus } from '../common/hooks';
import { getCurrentChatUser, getUserIdFromJid, mediaObjContructor, showToast } from '../helpers/chatHelpers';
import { mediaStatusConstants } from '../helpers/constants';
import { updateMediaStatus } from '../redux/chatMessageDataSlice';
import { getMediaProgress, useChatMessage } from '../redux/reduxHook';
import SDK from '../SDK/SDK';
import { uploadFileToSDK } from '../SDK/utils';
import { updateProgressNotification } from '../Service/PushNotify';
import { mflog } from '../uikitMethods';

const useMediaProgress = ({ uploadStatus = 0, downloadStatus = 0, msgId }) => {
   const chatUser = getCurrentChatUser();
   const userId = getUserIdFromJid(chatUser);
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
         console.log('chatMessage ==>', JSON.stringify(chatMessage, null, 2));

         const { source = {}, downloadJobId = '' } = getMediaProgress(msgId) || {};
         setMediaStatus(mediaStatusConstants.DOWNLOADING);
         dispatch(
            updateMediaStatus({
               msgId,
               userId,
               is_downloaded: 1,
            }),
         );
         await updateProgressNotification({
            msgId,
            progress: 0,
            type: 'download',
            isCanceled: false,
            foregroundStatus: false,
         });
         const downloadResponse = downloadJobId
            ? await source?.resume({ downloadJobId })
            : await SDK.downloadMedia(msgId);
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
            updateProgressNotification({
               msgId,
               progress: 0,
               type: 'download',
               isCanceled: true,
            });
            showToast(downloadResponse?.message || 'Failed to download media');
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
         mflog('Error in handleDownload:', error);
      }
   };

   const handleUpload = async () => {
      if (!networkState) {
         showToast('Please check your internet connection');
         return;
      }
      await updateProgressNotification({
         msgId,
         progress: 0,
         type: 'upload',
         isCanceled: false,
         foregroundStatus: false,
      });
      const retryObj = {
         msgId,
         userId,
         is_uploading: 1,
      };
      const { msgId: _msgId, msgBody: { media = {} } = {} } = chatMessage;
      const updatedFile = {
         ...media.file,
         fileDetails: mediaObjContructor('REDUX', media),
      };
      const _file = media.file || updatedFile;
      dispatch(updateMediaStatus(retryObj));
      uploadFileToSDK(_file, chatUser, _msgId, media);
   };

   const cancelProgress = async () => {
      try {
         const { source, downloadJobId = '', uploadJobId = '' } = getMediaProgress(msgId) || {};
         if (source) {
            if (downloadJobId || uploadJobId) {
               const cancelRes = await source?.cancel?.(downloadJobId || uploadJobId);
               console.log('cancelRes ==>', cancelRes);
               const mediaStatusObj = {
                  msgId,
                  userId,
                  ...(downloadJobId && { is_downloaded: 0 }),
                  ...(uploadJobId && { is_uploading: 3 }),
               };
               dispatch(updateMediaStatus(mediaStatusObj));
               setMediaStatus(uploadJobId ? mediaStatusConstants.NOT_UPLOADED : mediaStatusConstants.NOT_DOWNLOADED);
            } else {
               source?.cancel?.('User Cancelled!');
               const mediaStatusObj = {
                  msgId,
                  userId,
                  is_uploading: 3,
               };
               dispatch(updateMediaStatus(mediaStatusObj));
            }
         } else {
            console.log('mediaStatus ==> ', mediaStatus);
            updateProgressNotification({
               msgId,
               progress: 0,
               type: mediaStatus === mediaStatusConstants.DOWNLOADING ? 'download' : 'upload',
               isCanceled: true,
            });
            const mediaStatusObj = {
               msgId,
               userId,
               ...(mediaStatus === mediaStatusConstants.DOWNLOADING && { is_downloaded: 0 }),
               ...(mediaStatus === mediaStatusConstants.UPLOADING && { is_uploading: 3 }),
            };
            dispatch(updateMediaStatus(mediaStatusObj));
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
