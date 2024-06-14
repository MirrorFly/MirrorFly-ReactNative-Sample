import { combineReducers, configureStore } from '@reduxjs/toolkit';

import callAgainSlice from './callAgainSlice';
import callControlsReducer from './callControlsSlice';
import callModalToastReducer from './callModalToastSlice';
import callStateReducer from './callStateSlice';
import chatMessageDataReducer from './chatMessageDataSlice';
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
import typingStatusDataReducer from './typingStatusDataSlice';

// chatConversationLocalNav: chatConversationLocalNavReducer,
// recentChatSearchData: recentChatDataReducer,
// recoverMessage: recoverMessageReducer,
// streamData: streamDataReducer,

// recentChatData: recentChatDataReducer,
// chatConversationData: chatMessageDataReducer,
// connection: loggedInUserDataReducer,
// rosterData: rosterDataReducer,
// stateData: stateDataReducer,
// typingStatusData: TypingReducer,
// showConfrenceData: showConfrenceReducer,
// callData: CallStateReducer,
// callAgainData: callAgainReducer,
// notificationData: notificationDataReducer,
// callControlsData: callControlsReducer,
// callModalToastData: callModalToastReducer,
// permissionData: permissionReducer,
// groupsMemberParticipantsListData: GroupsMemberParticipantsListReducer,
// currentCallGroupMembersData: currentCallGroupMembersReducer,
// groupsMemberListData: GroupsMemberListReducer,
// groupsData: GroupsReducer,

// Combine reducers
const appReducer = combineReducers({
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
});

// Root reducer
const rootReducer = (state, action) => {
   if (action.type === 'clearState') {
      state = undefined;
   }
   return appReducer(state, action);
};

const store = configureStore({
   reducer: rootReducer,
   middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
         serializableCheck: false, // Disable non-serializable check
      }),
});

export default store;
