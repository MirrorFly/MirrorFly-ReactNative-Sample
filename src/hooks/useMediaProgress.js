import React from 'react';
import { useDispatch } from 'react-redux';
import { uploadFileToSDK } from '../SDK/utils';
import { useNetworkStatus } from '../common/hooks';
import config from '../config/config';
import { getUserIdFromJid, showToast } from '../helpers/chatHelpers';
import { mediaStatusConstants } from '../helpers/constants';
import { updateMediaStatus } from '../redux/chatMessageDataSlice';
import { deleteProgress } from '../redux/progressDataSlice';
import { getMediaProgress, useChatMessage } from '../redux/reduxHook';
import { currentChatUser } from '../screens/ConversationScreen';

const useMediaProgress = ({ uploadStatus = 0, downloadStatus = 0, msgId }) => {
   const userId = getUserIdFromJid(currentChatUser);
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
      if (!networkState) {
         showToast(config.internetErrorMessage);
         return;
      }
      if (networkState) {
         setMediaStatus(mediaStatusConstants.DOWNLOADING);
         let mediaStatusObj = {
            msgId,
            statusCode: 200,
            fromUserId: userId,
            local_path: '',
            is_downloaded: 1,
         };
         dispatch(updateMediaStatus(mediaStatusObj));
         const response = await SDK.downloadMedia(msgId);
         if (response?.statusCode !== 200) {
            const mediaStatusObj = {
               msgId,
               fromUserId: userId,
               downloadStatus: 0,
               local_path: '',
            };
            dispatch(updateMediaStatus(mediaStatusObj));
         }
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
      uploadFileToSDK(file, currentChatUser, _msgId, media);
   };

   const cancelProgress = () => {
      if (getMediaProgress(msgId)?.source) {
         if (getMediaProgress(msgId)?.downloadJobId) {
            getMediaProgress(msgId).source?.cancel?.(getMediaProgress(msgId)?.downloadJobId);
            const mediaStatusObj = {
               msgId,
               userId,
               is_downloaded: 0,
            };
            dispatch(updateMediaStatus(mediaStatusObj));
            dispatch(deleteProgress({ msgId }));
            setMediaStatus(mediaStatusConstants.NOT_DOWNLOADED);
         } else {
            getMediaProgress(msgId).source?.cancel?.('User Cancelled!');
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
   };

   return {
      retryUploadMedia: handleUpload,
      cancelProgress,
      downloadMedia: handleDownload,
      mediaStatus: mediaStatus,
   };
};
export default useMediaProgress;
