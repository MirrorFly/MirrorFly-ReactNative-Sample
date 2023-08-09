import React, { createRef, useEffect, useState } from 'react';
import SDK from '../SDK/SDK';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { batch, useDispatch, useSelector } from 'react-redux';
import { updateDownloadData } from '../redux/Actions/MediaDownloadAction';
import {
  RetryMediaUpload,
  updateUploadStatus,
} from '../redux/Actions/ConversationAction';
import { mediaStatusConstants } from '../constant';
import { useNetworkStatus } from '../hooks';
import config from 'components/chat/common/config';
import { Box, Text, Toast } from 'native-base';

const toastId = 'network-error-upload-download';
const toastRef = createRef(false);

const useMediaProgress = ({
  isSender,
  mediaUrl,
  uploadStatus = 0,
  msgId,
  media,
}) => {
  // 'NOT_DOWNLOADED' | 'NOT_UPLOADED' | 'DOWNLOADING' | 'UPLOADING' | 'DOWNLOADED' | 'UPLOADED'
  const [mediaStatus, setMediaStatus] = useState('');
  const networkState = useNetworkStatus();

  const toastConfig = {
    duration: 2500,
    avoidKeyboard: true,
    onCloseComplete: () => {
      toastRef.current = false;
    },
  };

  useEffect(() => {
    if (isSender) {
      const isUploading =
        uploadStatus === 1 || uploadStatus === 0 || uploadStatus === 8;
      const isUploaded = mediaUrl
        ? mediaStatusConstants.UPLOADED
        : mediaStatusConstants.NOT_UPLOADED;
      setMediaStatus(isUploading ? mediaStatusConstants.UPLOADING : isUploaded);
    } else {
      setMediaStatus(
        mediaUrl
          ? mediaStatusConstants.DOWNLOADED
          : mediaStatusConstants.NOT_DOWNLOADED,
      );
    }
  }, [isSender, mediaUrl, uploadStatus, msgId, media]);

  const dispatch = useDispatch();
  const fromUserJId = useSelector(state => state.navigation.fromUserJid);

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
      const response = await SDK.downloadMedia(msgId);
      if (response.statusCode === 200) {
        let updateObj = {
          msgId,
          statusCode: response.statusCode,
          fromUserId: getUserIdFromJid(fromUserJId),
          local_path: response.data.local_path,
          fileToken: file_url,
          thumbImage: thumb_image,
        };
        batch(() => {
          dispatch(updateDownloadData(response.data));
          dispatch(updateUploadStatus(updateObj));
        });
        toastRef.current = false;
      }
    }
  };
  const handleUpload = () => {
    // TODO: handle upload cases and retry uploading
    const retryObj = {
      msgId,
      fromUserId: getUserIdFromJid(fromUserJId),
      uploadStatus: 1,
    };
    dispatch(RetryMediaUpload(retryObj));
  };

  return {
    retryUploadMedia: handleUpload,
    downloadMedia: handleDownload,
    mediaStatus: mediaStatus,
  };
};
export default useMediaProgress;
