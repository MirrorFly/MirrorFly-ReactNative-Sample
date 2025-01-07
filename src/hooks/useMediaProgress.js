import React from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import RNFS from 'react-native-fs';
import { useDispatch } from 'react-redux';
import { uploadFileToSDK } from '../SDK/utils';
import { useNetworkStatus } from '../common/hooks';
import { getCurrentChatUser, getExtension, getUserIdFromJid, showToast } from '../helpers/chatHelpers';
import { mediaStatusConstants } from '../helpers/constants';
import { updateMediaStatus } from '../redux/chatMessageDataSlice';
import { deleteProgress } from '../redux/progressDataSlice';
import { getMediaProgress, useChatMessage } from '../redux/reduxHook';

const { MediaService } = NativeModules;
const eventEmitter = new NativeEventEmitter(MediaService);

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
      }
      if (uploadStatus === 3 && downloadStatus === 2) {
         setMediaStatus(mediaStatusConstants.NOT_UPLOADED);
      }
      if (uploadStatus === 1 || uploadStatus === 0 || uploadStatus === 8) {
         setMediaStatus(mediaStatusConstants.UPLOADING);
      }
   }, [uploadStatus, downloadStatus]);

   const handleDownload = async () => {
      const {
         msgBody: {
            media,
            media: {
               is_downloaded,
               local_path,
               fileKey,
               fileName = '',
               file_size = '',
               isLargeFile = false,
               file_url,
            } = {},
         } = {},
      } = chatMessage;

      if (is_downloaded === 2) {
         const decryptFileRes = await MediaService.decryptFile(local_path, fileKey, 'ddc0f15cc2c90fca');
         console.log('decryptFileRes ==>', decryptFileRes);
         if (!decryptFileRes?.success) return;
         let mediaStatusObj = {
            msgId,
            statusCode: 200,
            userId,
            local_path: 'file://' + decryptFileRes.decryptedFilePath,
            is_downloaded: 2,
         };
         console.log('mediaStatusObj ==>', mediaStatusObj);
         dispatch(updateMediaStatus(mediaStatusObj));
         setMediaStatus(mediaStatusConstants.LOADED);
         return;
      }

      // Listen for progress updates
      const downloadProgressSubscription = eventEmitter?.addListener?.('downloadProgress', progress => {
         console.log('downloadProgressSubscription ==>', downloadProgressSubscription);
         console.log('handleNativeFileDownload downloadProgress', progress);
         console.log('progress.downloadedBytes === fileSize ==>', file_size, progress.downloadedBytes === file_size);
         if (progress.downloadedBytes === file_size) {
            downloadProgressSubscription.remove();
         }
      });

      console.log('fileKey ==>', file_size, fileKey, isLargeFile);
      const extn = getExtension(file_url, false);

      const { status, data, message } = await SDK.getMediaDownloadURL(file_url);
      const cachePath = await generateUniqueFilePath(
         `${RNFS.CachesDirectoryPath}/DEC_${fileName}_${Date.now()}.${extn}`,
      );
      console.log('status cachePath ==>', status, cachePath);
      const nativedownloadRes = await MediaService?.downloadFileInChunks(data, file_size, cachePath);
      console.log('nativedownloadRes ==>', nativedownloadRes);
      let mediaStatusObj = {
         msgId,
         statusCode: 200,
         userId,
         local_path: 'file://' + cachePath,
         is_downloaded: 2,
      };
      console.log('mediaStatusObj ==>', mediaStatusObj);
      dispatch(updateMediaStatus(mediaStatusObj));
      !fileKey && setMediaStatus(mediaStatusConstants.LOADED);
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
