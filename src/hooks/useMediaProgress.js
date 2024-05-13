import { Box, Text, Toast } from 'native-base';
import React from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';
import { showToast } from '../Helper';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import SDK from '../SDK/SDK';
import config from '../config';
import { mediaStatusConstants } from '../constant';
import { useNetworkStatus } from '../hooks';
import { CancelMediaUpload, RetryMediaUpload, updateUploadStatus } from '../redux/Actions/ConversationAction';
import Store from '../redux/store';
import { cancelDownloadData } from '../redux/Actions/MediaDownloadAction';
import { cancelMediaUploadData } from '../redux/Actions/MediaUploadAction';

const toastId = 'network-error-upload-download';
const toastRef = React.createRef(false);

const getMediaProgressSource = msgId =>
   Store.getState().mediaDownloadData?.data?.[msgId] || Store.getState().mediaUploadData?.data?.[msgId];

const useMediaProgress = ({ isSender, mediaUrl, uploadStatus = 0, downloadStatus = 0, msgId, media, msgStatus }) => {
   const dispatch = useDispatch();
   const networkState = useNetworkStatus();
   /** 'NOT_DOWNLOADED' | 'NOT_UPLOADED' | 'DOWNLOADING' | 'UPLOADING' | 'DOWNLOADED' | 'UPLOADED'  */
   const [mediaStatus, setMediaStatus] = React.useState('');

   const fromUserJId = useSelector(state => state.navigation.fromUserJid);

   const toastConfig = {
      duration: 2500,
      avoidKeyboard: true,
      onCloseComplete: () => {
         toastRef.current = false;
      },
   };

   React.useEffect(() => {
      if (isSender) {
         const isUploading = uploadStatus === 1 || uploadStatus === 0 || uploadStatus === 8;
         const isUploaded =
            uploadStatus === 2 && mediaUrl ? mediaStatusConstants.UPLOADED : mediaStatusConstants.NOT_UPLOADED;
         setMediaStatus(isUploading ? mediaStatusConstants.UPLOADING : isUploaded);
      } else {
         const isDonwloadingStatus =
            downloadStatus === 1 ? mediaStatusConstants.DOWNLOADING : mediaStatusConstants.NOT_DOWNLOADED;
         setMediaStatus(downloadStatus === 2 ? mediaStatusConstants.DOWNLOADED : isDonwloadingStatus);
      }
   }, [msgStatus, isSender, mediaUrl, uploadStatus, msgId, media, downloadStatus]);

   const { file_url = '', thumb_image = '' } = media;

   const handleDownload = async () => {
      if (!networkState && !toastRef.current) {
         toastRef.current = true;
         return Toast.show({
            id: toastId,
            ...toastConfig,
            render: () => {
               return (
                  <Box bg="black" px="2" py="1" rounded="sm">
                     <Text style={{ color: '#fff', padding: 5 }}>{config.internetErrorMessage}</Text>
                  </Box>
               );
            },
         });
      }
      if (networkState) {
         setMediaStatus(mediaStatusConstants.DOWNLOADING);
         let downloadData = {
            msgId,
            statusCode: 200,
            fromUserId: getUserIdFromJid(fromUserJId),
            local_path: '',
            is_downloaded: 1,
            fileToken: file_url,
            thumbImage: thumb_image,
         };
         dispatch(updateUploadStatus(downloadData));
         const response = await SDK.downloadMedia(msgId);
         if (response.statusCode !== 200) {
            const cancelObj = {
               msgId,
               fromUserId: getUserIdFromJid(fromUserJId),
               uploadStatus: 7,
               downloadStatus: 7,
            };
            batch(() => {
               dispatch(CancelMediaUpload(cancelObj));
               dispatch(cancelDownloadData(cancelObj));
            });
         }
      }
   };
   const handleUpload = () => {
      if (!networkState) {
         showToast('Please check your internet connection', { id: 'MEDIA_RETRY' });
         return;
      }
      const retryObj = {
         msgId,
         fromUserId: getUserIdFromJid(fromUserJId),
         uploadStatus: 1,
      };
      dispatch(RetryMediaUpload(retryObj));
   };

   const handleCancelUpload = () => {
      if (getMediaProgressSource(msgId)?.source) {
         if (getMediaProgressSource(msgId)?.downloadJobId) {
            getMediaProgressSource(msgId).source?.cancel?.(getMediaProgressSource(msgId)?.downloadJobId);
         } else {
            getMediaProgressSource(msgId).source?.cancel?.('User Cancelled!');
         }
      }
      const cancelObj = {
         msgId,
         fromUserId: fromUserJId,
         uploadStatus: 7,
         downloadStatus: 7,
      };
      batch(() => {
         dispatch(CancelMediaUpload(cancelObj));
         dispatch(cancelDownloadData(cancelObj));
         dispatch(cancelMediaUploadData(cancelObj));
      });
      if (uploadStatus === 8) {
         return true;
      }
   };

   return {
      retryUploadMedia: handleUpload,
      cancelUploadMedia: handleCancelUpload,
      downloadMedia: handleDownload,
      mediaStatus: mediaStatus,
   };
};
export default useMediaProgress;
