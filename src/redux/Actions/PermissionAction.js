import { CLOSE_PERMISSION_MODAL, SHOW_PERMISSION_MODAL } from './Constants';

export const showPermissionModal = data => {
   return {
      type: SHOW_PERMISSION_MODAL,
   };
};

export const closePermissionModal = data => {
   return {
      type: CLOSE_PERMISSION_MODAL,
   };
};
