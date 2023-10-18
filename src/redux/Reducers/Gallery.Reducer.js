import { getObjectDeepClone } from '../reduxHelper';
import {
  ADD_GALLERY_ALBUM,
  ADD_GALLERY_GROUP_NAME,
  ADD_GALLERY_PHOTOS,
  RESET_GALLERY_DATA,
  RESET_STORE,
} from '../Actions/Constants';

const initialState = {
  galleryAlbum: [],
  galleryPhotos: [],
  galleryName: '',
};

const initialStateClone = getObjectDeepClone(initialState);

const galleryReducer = (state = initialStateClone, action) => {
  switch (action.type) {
    case ADD_GALLERY_ALBUM:
      return {
        ...state,
        galleryAlbum: action.payload,
      };
    case ADD_GALLERY_PHOTOS:
      return {
        ...state,
        galleryPhotos: action.payload,
      };
    case ADD_GALLERY_GROUP_NAME:
      return {
        ...state,
        galleryName: action.payload,
      };
    case RESET_GALLERY_DATA:
      return getObjectDeepClone(initialState);
    case RESET_STORE:
      return getObjectDeepClone(initialState);
    default:
      return state;
  }
};

export default galleryReducer;
