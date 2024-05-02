export const StateToObj = state => {
   return Array.isArray(state) ? [...state] : { ...state };
};

export const getObjectDeepClone = obj => JSON.parse(JSON.stringify(obj));
