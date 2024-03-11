import { UPDATE_MEDIA_DOWNLOAD_DATA } from './Constants';

export const updateDownloadData = data => {
   return {
      type: UPDATE_MEDIA_DOWNLOAD_DATA,
      payload: data,
   };
};
