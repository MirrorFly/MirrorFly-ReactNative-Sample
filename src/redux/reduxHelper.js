export const StateToObj = state => {
  return Array.isArray(state) ? [...state] : { ...state };
};
