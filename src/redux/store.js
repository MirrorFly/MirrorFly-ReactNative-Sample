import { combineReducers, configureStore } from '@reduxjs/toolkit';

import callAgainSlice from './callAgainSlice';
import callControlsReducer from './callControlsSlice';
import callModalToastReducer from './callModalToastSlice';
import callStateReducer from './callStateSlice';
import chatMessageDataReducer from './chatMessageDataSlice';
import draftReducer from './draftSlice';
import groupsReducer from './groupDataSlice';
import loggedInUserDataReducer from './loggedInUserDataSlice';
import notificationDataReducer from './notificationDataSlice';
import permissionReducer from './permissionSlice';
import presenceDataReducer from './presenceDataSlice';
import progressDataReducer from './progressDataSlice';
import recentChatDataReducer from './recentChatDataSlice';
import rosterDataReducer from './rosterDataSlice';
import settingDataReducer from './settingDataSlice';
import showConfrenceReducer from './showConfrenceSlice';
import themeColorReducer from './themeColorDataSlice';
import typingStatusDataReducer from './typingStatusDataSlice';

// Combine reducers
const appReducer = combineReducers({
   draftData: draftReducer,
   recentChatData: recentChatDataReducer,
   rosterData: rosterDataReducer,
   chatMessagesData: chatMessageDataReducer,
   loggedInUserData: loggedInUserDataReducer,
   presenceData: presenceDataReducer,
   typingData: typingStatusDataReducer,
   progressData: progressDataReducer,
   showConfrenceData: showConfrenceReducer,
   callData: callStateReducer,
   callAgainData: callAgainSlice,
   notificationData: notificationDataReducer,
   callControlsData: callControlsReducer,
   callModalToastData: callModalToastReducer,
   permissionData: permissionReducer,
   settingsData: settingDataReducer,
   groupData: groupsReducer,
   themeColorPalatte: themeColorReducer,
});

// Root reducer
const rootReducer = (state, action) => {
   // if (action.type === 'clearState') {
   //    const { themeColorPalatte, ...rest } = state; // Destructure to keep themeColorPalatte intact
   //    return {
   //       ...rest, // Return the rest of the state excluding themeColorPalatte
   //       themeColorPalatte, // Keep themeColorPalatte as it is
   //    };
   // }
   return appReducer(state, action);
};

const store = configureStore({
   reducer: rootReducer,
   middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
         immutableCheck: false, // Disable the ImmutableStateInvariantMiddleware
         serializableCheck: false, // Disable non-serializable check
      }),
});

export default store;
