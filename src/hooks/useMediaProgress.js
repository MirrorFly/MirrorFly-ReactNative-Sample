import { useEffect, useState } from 'react';
import SDK from '../SDK/SDK';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { useDispatch, useSelector } from 'react-redux';
import { updateDownloadData } from '../redux/Actions/MediaDownloadAction';
import {
  RetryMediaUpload,
  updateUploadStatus,
} from '../redux/Actions/ConversationAction';
import { mediaStatusConstants } from '../constant';

const useMediaProgress = ({
  isSender,
  mediaUrl,
  uploadStatus = 0,
  msgId,
  media,
}) => {
  // 'NOT_DOWNLOADED' | 'NOT_UPLOADED' | 'DOWNLOADING' | 'UPLOADING' | 'DOWNLOADED' | 'UPLOADED'
  const [mediaStatus, setMediaStatus] = useState('');

  useEffect(() => {
    if (isSender) {
      const isUploading =
        uploadStatus === 1 || uploadStatus === 0 || uploadStatus === 8;
      const isUploaded =
        uploadStatus === 2 && mediaUrl
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

  useEffect(() => {
    console.log('Media Status', mediaStatus, uploadStatus);
  }, [mediaStatus]);

  const dispatch = useDispatch();
  const fromUserJId = useSelector(state => state.navigation.fromUserJid);

  const { file_url = '', thumb_image = '' } = media;

  const handleDownload = async () => {
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
      dispatch(updateDownloadData(response.data));
      dispatch(updateUploadStatus(updateObj));
    }
  };
  const handleUpload = () => {
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
