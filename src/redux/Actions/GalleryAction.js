import {
  ADD_GALLERY_ALBUM,
  ADD_GALLERY_GROUP_NAME,
  ADD_GALLERY_PHOTOS,
  RESET_GALLERY_DATA,
} from './Constants';

export const addGalleryAlbum = data => {
  return {
    type: ADD_GALLERY_ALBUM,
    payload: data,
  };
};

export const addGalleryPhotos = data => {
  return {
    type: ADD_GALLERY_PHOTOS,
    payload: data,
  };
};

export const addGalleyGroupName = data => {
  return {
    type: ADD_GALLERY_GROUP_NAME,
    payload: data,
  };
};

export const resetGalleryData = () => {
  return {
    type: RESET_GALLERY_DATA,
  };
};
