import React from 'react';
import SDK from '../SDK/SDK';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { batch, useDispatch, useSelector } from 'react-redux';
import { updateDownloadData } from '../redux/Actions/MediaDownloadAction';
import {
  CancelMediaUpload,
  RetryMediaUpload,
  updateUploadStatus,
} from '../redux/Actions/ConversationAction';
import { mediaStatusConstants } from '../constant';
import { useNetworkStatus } from '../hooks';
import config from '../components/chat/common/config';
import { Box, Text, Toast } from 'native-base';
import { showToast } from '../Helper';

const toastId = 'network-error-upload-download';
const toastRef = React.createRef(false);

const useMediaProgress = ({
  isSender,
  mediaUrl,
  uploadStatus = 0,
  downloadStatus = 0,
  msgId,
  media,
}) => {
  const dispatch = useDispatch();
  const networkState = useNetworkStatus();
  /** 'NOT_DOWNLOADED' | 'NOT_UPLOADED' | 'DOWNLOADING' | 'UPLOADING' | 'DOWNLOADED' | 'UPLOADED'  */
  const [mediaStatus, setMediaStatus] = React.useState('');

  const fromUserJId = useSelector(state => state.navigation.fromUserJid);

  const { data: mediaDownloadData = {} } = useSelector(
    state => state.mediaDownloadData,
  );

  const { data: mediaUploadData = {} } = useSelector(
    state => state.mediaUploadData,
  );

  React.useEffect(() => {
    if (
      mediaDownloadData[msgId]?.progress > 0 &&
      mediaDownloadData[msgId]?.progress < 100
    ) {
      setMediaStatus(mediaStatusConstants.DOWNLOADING);
    }
    if (mediaDownloadData[msgId]?.progress === 100) {
      setMediaStatus(mediaStatusConstants.DOWNLOADED);
    }
    if (mediaDownloadData[msgId]?.message) {
      setMediaStatus(mediaStatusConstants.NOT_DOWNLOADED);
      handleCancelUpload();
    }
  }, [mediaDownloadData[msgId]]);

  React.useEffect(() => {
    if (
      mediaUploadData[msgId]?.progress > 0 &&
      mediaUploadData[msgId]?.progress < 100
    ) {
      setMediaStatus(mediaStatusConstants.UPLOADING);
    }
    if (mediaUploadData[msgId]?.progress === 100) {
      setMediaStatus(mediaStatusConstants.UPLOADED);
    }
    if (mediaUploadData[msgId]?.message) {
      setMediaStatus(mediaStatusConstants.NOT_UPLOADED);
      handleCancelUpload();
    }
  }, [mediaUploadData[msgId]]);

  const toastConfig = {
    duration: 2500,
    avoidKeyboard: true,
    onCloseComplete: () => {
      toastRef.current = false;
    },
  };

  React.useEffect(() => {
    if (isSender) {
      const isUploading =
        uploadStatus === 1 || uploadStatus === 0 || uploadStatus === 8;
      const isUploaded =
        uploadStatus === 2 && mediaUrl
          ? mediaStatusConstants.UPLOADED
          : mediaStatusConstants.NOT_UPLOADED;
      setMediaStatus(isUploading ? mediaStatusConstants.UPLOADING : isUploaded);
    } else {
      const isDonwloadingStatus =
        downloadStatus === 1
          ? mediaStatusConstants.DOWNLOADING
          : mediaStatusConstants.NOT_DOWNLOADED;
      setMediaStatus(
        mediaUrl ? mediaStatusConstants.DOWNLOADED : isDonwloadingStatus,
      );
    }
  }, [isSender, mediaUrl, uploadStatus, msgId, media]);

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
              <Text style={{ color: '#fff', padding: 5 }}>
                {config.internetErrorMessage}
              </Text>
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
      if (response.statusCode === 200) {
        let updateObj = {
          msgId,
          statusCode: response.statusCode,
          fromUserId: getUserIdFromJid(fromUserJId),
          local_path: response.data.local_path,
          is_downloaded: 2,
          fileToken: file_url,
          thumbImage: thumb_image,
        };
        batch(() => {
          dispatch(updateDownloadData(response.data));
          dispatch(updateUploadStatus(updateObj));
        });
        toastRef.current = false;
      } else {
        const cancelObj = {
          msgId,
          fromUserId: fromUserJId,
          uploadStatus: 7,
          downloadStatus: 7,
        };
        dispatch(CancelMediaUpload(cancelObj));
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
    const cancelObj = {
      msgId,
      fromUserId: fromUserJId,
      uploadStatus: 7,
      downloadStatus: 7,
    };
    dispatch(CancelMediaUpload(cancelObj));
    if (uploadStatus === 8) {
      return true;
    }
    if (mediaDownloadData[msgId]?.source) {
      mediaDownloadData[msgId].source?.cancel?.('User Cancelled!');
    }
    if (mediaUploadData[msgId]) {
      mediaUploadData[msgId].source?.cancel?.('User Cancelled!');
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
