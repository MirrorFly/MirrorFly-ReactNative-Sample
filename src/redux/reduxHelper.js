export const StateToObj = state => {
  // return JSON.parse(JSON.stringify(state));
  return Array.isArray(state) ? [...state] : { ...state };
};
