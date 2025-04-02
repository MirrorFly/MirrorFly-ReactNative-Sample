import React from 'react';
import { useDispatch } from 'react-redux';
import { useNetworkStatus } from '../common/hooks';
import {
   getCurrentChatUser,
   getUserIdFromJid,
   handleUpdateBlockUser,
   mediaObjContructor,
   showToast,
} from '../helpers/chatHelpers';
import { mediaStatusConstants } from '../helpers/constants';
import { setModalContent, toggleModalContent } from '../redux/alertModalSlice';
import { updateMediaStatus } from '../redux/chatMessageDataSlice';
import {
   getBlockedStatus,
   getMediaProgress,
   getUserNameFromStore,
   useBlockedStatus,
   useChatMessage,
} from '../redux/reduxHook';
import store from '../redux/store';
import SDK from '../SDK/SDK';
import { uploadFileToSDK } from '../SDK/utils';
import { updateProgressNotification } from '../Service/PushNotify';
import { mflog } from '../uikitMethods';

export const cancelMediaProgress = async (msgId, userId, mediaStatus, setMediaStatus, cancelUploadOnly = false) => {
   try {
      const { source, downloadJobId = '', uploadJobId = '' } = getMediaProgress(msgId) || {};

      if (source) {
         if (uploadJobId && cancelUploadOnly) {
            // Cancel only the upload process
            await source?.cancel?.(uploadJobId);

            const mediaStatusObj = {
               msgId,
               userId,
               is_uploading: 3, // Mark upload as canceled
            };
            store.dispatch(updateMediaStatus(mediaStatusObj));
            setMediaStatus?.(mediaStatusConstants.NOT_UPLOADED);
         } else if (downloadJobId || uploadJobId) {
            // Cancel both download and upload (if `cancelUploadOnly` is false)
            await source?.cancel?.(downloadJobId || uploadJobId);

            const mediaStatusObj = {
               msgId,
               userId,
               ...(downloadJobId && { is_downloaded: 0 }),
               ...(uploadJobId && { is_uploading: 3 }),
            };
            store.dispatch(updateMediaStatus(mediaStatusObj));
            setMediaStatus?.(uploadJobId ? mediaStatusConstants.NOT_UPLOADED : mediaStatusConstants.NOT_DOWNLOADED);
         } else {
            // Handle general cancellation
            source?.cancel?.('User Cancelled!');
            store.dispatch(updateMediaStatus({ msgId, userId, is_uploading: 3 }));
         }
      } else {
         updateProgressNotification({
            msgId,
            progress: 0,
            type: mediaStatus === mediaStatusConstants.DOWNLOADING ? 'download' : 'upload',
            isCanceled: true,
         });

         const mediaStatusObj = {
            msgId,
            userId,
            ...(mediaStatus === mediaStatusConstants.UPLOADING && { is_uploading: 3 }),
            ...(mediaStatus === mediaStatusConstants.DOWNLOADING && !cancelUploadOnly && { is_downloaded: 0 }),
         };
         store.dispatch(updateMediaStatus(mediaStatusObj));
      }
   } catch (error) {
      console.log('cancelProgress ==>', error);
   }
};
const useMediaProgress = ({ uploadStatus = 0, downloadStatus = 0, msgId }) => {
   const chatUser = getCurrentChatUser();
   const userId = getUserIdFromJid(chatUser);
   const dispatch = useDispatch();
   const chatMessage = useChatMessage(userId, msgId);
   const networkState = useNetworkStatus();
   const [mediaStatus, setMediaStatus] = React.useState('');
   const blockedStatus = useBlockedStatus(userId);

   // Effect to cancel any ongoing upload if the user is blocked
   React.useEffect(() => {
      if (blockedStatus) {
         cancelMediaProgress(msgId, userId, mediaStatus, setMediaStatus, true);
      }
   }, [blockedStatus]);

   React.useEffect(() => {
      if (downloadStatus === 1) {
         setMediaStatus(mediaStatusConstants.DOWNLOADING);
      } else if (uploadStatus === 2 && downloadStatus === 0) {
         setMediaStatus(mediaStatusConstants.NOT_DOWNLOADED);
      } else if (uploadStatus === 2 && downloadStatus === 2) {
         setMediaStatus(mediaStatusConstants.LOADED);
      } else if (uploadStatus === 3 && downloadStatus === 2) {
         setMediaStatus(mediaStatusConstants.NOT_UPLOADED);
      } else if ([1, 0, 8].includes(uploadStatus)) {
         setMediaStatus(mediaStatusConstants.UPLOADING);
      }
   }, [uploadStatus, downloadStatus]);

   const resetModalContent = () => {
      dispatch(toggleModalContent());
   };

   const handleModalYesAction = async () => {
      const res = await handleUpdateBlockUser(userId, 0, chatUser)();
      if (res.statusCode === 200) {
         return handleUpload();
      }
   };

   const promptUnblockModal = () => {
      dispatch(
         setModalContent({
            visible: true,
            onRequestClose: resetModalContent,
            title: `Unblock ${getUserNameFromStore(userId)}`,
            noButton: 'CANCEL',
            yesButton: 'UNBLOCK',
            yesAction: handleModalYesAction,
         }),
      );
   };

   const handleUpload = async () => {
      if (!networkState) {
         showToast('Please check your internet connection');
         return;
      }
      if (getBlockedStatus(userId)) {
         promptUnblockModal();
         return;
      }

      await updateProgressNotification({
         msgId,
         progress: 0,
         type: 'upload',
         isCanceled: false,
         foregroundStatus: false,
      });

      const retryObj = { msgId, userId, is_uploading: 1 };
      const { msgId: _msgId, msgBody: { media = {} } = {} } = chatMessage;
      const updatedFile = {
         ...media.file,
         fileDetails: mediaObjContructor('REDUX', media),
      };
      const _file = media.file || updatedFile;
      dispatch(updateMediaStatus(retryObj));

      uploadFileToSDK(_file, chatUser, _msgId, media);
   };

   const handleDownload = async () => {
      try {
         const { source = {}, downloadJobId = '' } = getMediaProgress(msgId) || {};
         setMediaStatus(mediaStatusConstants.DOWNLOADING);
         dispatch(updateMediaStatus({ msgId, userId, is_downloaded: 1 }));

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
               updateMediaStatus({ msgId, userId, local_path: downloadResponse.decryptedFilePath, is_downloaded: 2 }),
            );
            setMediaStatus(mediaStatusConstants.LOADED);
         } else {
            showToast(downloadResponse?.message || 'Failed to download media');
            dispatch(updateMediaStatus({ msgId, userId, is_downloaded: 0 }));
            setMediaStatus(mediaStatusConstants.NOT_DOWNLOADED);
         }
      } catch (error) {
         mflog('Error in handleDownload:', error);
      }
   };

   const cancelProgress = async () => {
      cancelMediaProgress(msgId, userId, mediaStatus, setMediaStatus);
   };

   return {
      retryUploadMedia: handleUpload,
      cancelProgress,
      downloadMedia: handleDownload,
      mediaStatus,
   };
};

export default useMediaProgress;
