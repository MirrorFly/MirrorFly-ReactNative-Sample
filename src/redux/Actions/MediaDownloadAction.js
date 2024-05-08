import { CANCEL_MEDIA_DOWNLOAD_DATA, UPDATE_MEDIA_DOWNLOAD_DATA } from './Constants';

export const updateDownloadData = data => {
   return {
      type: UPDATE_MEDIA_DOWNLOAD_DATA,
      payload: data,
   };
};

export const cancelDownloadData = data => {
   return {
      type: CANCEL_MEDIA_DOWNLOAD_DATA,
      payload: data,
   };
};
