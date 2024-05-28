import { CLOSE_PERMISSION_MODAL, SHOW_PERMISSION_MODAL } from '../Actions/Constants';

const initialState = {
   permissionStatus: false,
};

const permissionReducer = (state = initialState, action) => {
   switch (action.type) {
      case SHOW_PERMISSION_MODAL:
         return {
            ...state,
            permissionStatus: true,
         };
      case CLOSE_PERMISSION_MODAL:
         return {
            ...state,
            permissionStatus: false,
         };
      default:
         return state;
   }
};

export default permissionReducer;
