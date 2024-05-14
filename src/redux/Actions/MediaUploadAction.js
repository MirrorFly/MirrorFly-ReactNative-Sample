import { CANCEL_MEDIA_UPLOAD_DATA, UPDATE_MEDIA_UPLOAD_DATA } from './Constants';

export const updateMediaUploadData = data => {
   return {
      type: UPDATE_MEDIA_UPLOAD_DATA,
      payload: data,
   };
};

export const cancelMediaUploadData = data => {
   return {
      type: CANCEL_MEDIA_UPLOAD_DATA,
      payload: data,
   };
};
