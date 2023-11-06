import Store from "../../redux/store";

export const getMaxUsersInCall = () => 8;

export const callConnectionStoreData = store => {
    store = store || Store;
    return store.getState?.().callConnectionData || {};
  };