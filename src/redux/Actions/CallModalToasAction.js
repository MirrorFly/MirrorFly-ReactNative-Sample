import { RESET_CALL_MODAL_TOAST_DATA, SHOW_CALL_MODAL_TOAST } from './Constants';

export const showCallModalToastAction = ({ message, duration }) => {
   return {
      type: SHOW_CALL_MODAL_TOAST,
      payload: { message, duration },
   };
};

export const resetCallModalToastDataAction = () => {
   return {
      type: RESET_CALL_MODAL_TOAST_DATA,
   };
};
