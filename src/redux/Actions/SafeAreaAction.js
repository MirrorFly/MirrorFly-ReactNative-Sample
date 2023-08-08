import { RESET_SAFE_AREA, UPDATE_SAFE_AREA_BG_COLOR } from "./Constants";

export const safeAreaBgColor = color => {
    return {
      type: UPDATE_SAFE_AREA_BG_COLOR,
      payload: color,
    };
  };

  export const resetSafeArea = color => {
    return {
        type: RESET_SAFE_AREA,
      };
  }