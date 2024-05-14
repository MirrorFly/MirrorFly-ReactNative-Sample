import { NAVIGATION_NAVIGATE } from './Constants';

export const navigate = data => {
   return {
      type: NAVIGATION_NAVIGATE,
      payload: data,
   };
};
