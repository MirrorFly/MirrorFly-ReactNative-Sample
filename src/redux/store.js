import { applyMiddleware, combineReducers, legacy_createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import authReducer from './Reducers/Auth.Reducer';
import callControlsReducer from './Reducers/CallControls.Reducer';
import callModalToastReducer from './Reducers/CallModalToast.Reducer';
import CallStateReducer from './Reducers/CallState.Reducer';
import chatConversationLocalNavReducer from './Reducers/ChatConversationLocalNav.Reducer';
import showConfrenceReducer from './Reducers/Confrence.Reducer';
import conversationReducer from './Reducers/Conversation.Reducer';
import galleryReducer from './Reducers/Gallery.Reducer';
import mediaDownloadReducer from './Reducers/MediaDownload.Reducer';
import mediaUploadReducer from './Reducers/MediaUpload.Reducer';
import navigationReducer from './Reducers/Navigation.Reducer';
import notificationDataReducer from './Reducers/NotificationData.Reducer';
import profileReducer from './Reducers/Profile.Reducer';
import recentChatReducer from './Reducers/RecentChat.Reducer';
import recoverMessageReducer from './Reducers/RecoverMessage.Reducer';
import safeAreaReducer from './Reducers/SafeArea.Reducer';
import singleChatImageReducer from './Reducers/SingleChatImage.Reducer';
import TypingReducer from './Reducers/Typing.Reducer';
import callAgainReducer from './Reducers/callAgain.Reducer';
import chatReducer from './Reducers/chat.Reducer';
import chatSeenPendingMsgReducer from './Reducers/chatSeenPendingMsg.Reducer';
import connectionReducer from './Reducers/connection.Reducer';
import conversationSearchReducer from './Reducers/conversationSearch.Reducer';
import recentChatSearchReducer from './Reducers/recentChatSearch.Reducer';
import rosterReducer from './Reducers/roster.Reducer';
import stateDataReducer from './Reducers/statusReducer';
import streamDataReducer from './Reducers/streamReducer';
import userReducer from './Reducers/user.Reducer';
import permissionReducer from './Reducers/PermissionReducer';

const rootReducer = combineReducers({
   navigation: navigationReducer,
   recentChatData: recentChatReducer,
   recentChatSearchData: recentChatSearchReducer,
   auth: authReducer,
   chatConversationData: conversationReducer,
   profile: profileReducer,
   chatSeenPendingMsgData: chatSeenPendingMsgReducer,
   chat: chatReducer,
   connection: connectionReducer,
   user: userReducer,
   galleryData: galleryReducer,
   mediaUploadData: mediaUploadReducer,
   chatSelectedMedia: singleChatImageReducer,
   mediaDownloadData: mediaDownloadReducer,
   safeArea: safeAreaReducer,
   conversationSearchData: conversationSearchReducer,
   rosterData: rosterReducer,
   recoverMessage: recoverMessageReducer,
   chatConversationLocalNav: chatConversationLocalNavReducer,
   streamData: streamDataReducer,
   stateData: stateDataReducer,
   typingStatusData: TypingReducer,
   showConfrenceData: showConfrenceReducer,
   callData: CallStateReducer,
   callAgainData: callAgainReducer,
   notificationData: notificationDataReducer,
   callControlsData: callControlsReducer,
   callModalToastData: callModalToastReducer,
   permissionData: permissionReducer,
});

const Store = legacy_createStore(rootReducer, applyMiddleware(thunkMiddleware));

export const getStoreState = store => {
   store = store || Store;
   return store.getState?.() || {};
};

export default Store;
