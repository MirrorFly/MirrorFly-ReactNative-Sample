import { UPDATE_MEDIA_UPLOAD_DATA } from './Constants';

export const updateMediaUploadData = data => {
   return {
      type: UPDATE_MEDIA_UPLOAD_DATA,
      payload: data,
   };
};
