import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import RNCallKeep, { CONSTANTS as CK_CONSTANTS } from 'react-native-callkeep';
import { openSettings } from 'react-native-permissions';
import { batch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { SDK } from '../../SDK';
import { muteLocalVideo, resetCallData } from '../../SDKActions/callbacks';
import { pushNotify } from '../../Service/CallNotify';
import { requestMicroPhonePermission } from '../../common/utils';
import {
   clearCallData,
   closeCallModal,
   openCallModal,
   resetCallStateData,
   resetConferencePopup,
   setCallModalScreen,
   showConfrence,
   updateCallConnectionState,
   updateCallerUUID,
} from '../../redux/Actions/CallAction';
import Store from '../../redux/store';
import { formatUserIdToJid, getLocalUserDetails } from '../Chat/ChatHelper';
import { getUserIdFromJid } from '../Chat/Utility';
import { getUserProfile, getUserProfileFromSDK, showToast } from '../index';
import {
   clearMissedCallNotificationTimer,
   disconnectCallConnection,
   dispatchDisconnected,
   getMaxUsersInCall,
   getMissedCallMessage,
   startCallingTimer,
   stopIncomingCallRingtone,
} from './Call';
import {
   CALL_STATUS_DISCONNECTED,
   COMMON_ERROR_MESSAGE,
   DISCONNECTED_SCREEN_DURATION,
   INCOMING_CALL_SCREEN,
   OUTGOING_CALL_SCREEN,
   PERMISSION_DENIED,
} from './Constant';

let preventMultipleClick = false;

export const makeCalls = async (callType, userId) => {
   let userList = [];
   if (!userId || preventMultipleClick) {
      return;
   }
   let connectionStatus = await AsyncStorage.getItem('connection_status');
   if (connectionStatus === 'CONNECTED') {
      preventMultipleClick = true;
      let userListData = await getCallData(userId);
      userList = [...userListData];
      makeOne2OneCall(callType, userList);
   } else {
      showToast('Please check your internet connection', {
         id: 'Network_error',
      });
      preventMultipleClick = false;
   }
};

const makeOne2OneCall = async (callType, usersList) => {
   let callMode = 'onetoone';
   let users = [];
   const maxMemberReached = Boolean(usersList.length > getMaxUsersInCall() - 1);
   if (maxMemberReached) {
      // toast.error("Maximum " + getMaxUsersInCall() + " members allowed in a call");
      return;
   }
   if (usersList.length > 1) {
      callMode = 'onetomany';
      users = usersList;
   } else {
      usersList.map(participant => {
         const { userJid, username, GroupUser } = participant;
         let user = userJid || username || GroupUser;
         user = user.split('@')[0];
         // let userDetails = getDataFromRoster(user);
         // if (!userDetails.isDeletedUser) {
         users.push(formatUserIdToJid(user));
         // }
      });
   }
   if (users.length === 1) {
      makeCall(callMode, callType, users, usersList, '');
   } else if (users.length > 1) {
      makeCall(callMode, callType, users, usersList, '');
   } else {
      // if(toast.error.length > 1) {
      //     toast.dismiss();
      //     // // toast.error(FEATURE_RESTRICTION_ERROR_MESSAGE);
      // }
   }
};

const makeCall = async (callMode, callType, groupCallMemberDetails, usersList, groupId = null) => {
   let connectionStatus = await AsyncStorage.getItem('connection_status');
   if (connectionStatus === 'CONNECTED') {
      let users = [],
         roomId = '',
         call = null,
         image = '';
      const vcardData = getLocalUserDetails();
      let fromuser = formatUserIdToJid(vcardData.fromUser);

      if (callMode === 'onetoone') {
         users = groupCallMemberDetails;
      } else if (callMode === 'onetomany') {
         if (groupCallMemberDetails.length > 0) {
            groupCallMemberDetails.forEach(function (member) {
               if (member !== fromuser) {
                  if (typeof member === 'object') users.push(member.userJid);
                  else users.push(member);
               }
            });
         } else {
            users = [''];
         }
      }

      let callConnectionStatus = {
         callMode: callMode,
         callStatus: 'CALLING',
         callType: callType,
         from: fromuser,
         userList: users.join(','),
      };

      if (callMode === 'onetoone') {
         callConnectionStatus.to = users.join(',');
         callConnectionStatus.userAvatar = image;
      } else if (callMode === 'onetomany') {
         callConnectionStatus.to = groupId;
         callConnectionStatus.groupId = groupId;
      }
      // AsyncStorage.setItem('call_connection_status', JSON.stringify(callConnectionStatus))
      if (Platform.OS === 'ios') {
         const callerName = usersList.map(ele => ele.name).join(',');
         const hasVideo = callType === 'video';
         let uuid = uuidv4();
         let callerId = users.join(',')?.split?.('@')?.[0];
         Store.dispatch(updateCallerUUID(uuid));
         startCall(uuid, callerId, callerName, hasVideo);
      }

      const showConfrenceData = Store.getState().showConfrenceData;
      const { data: confrenceData } = showConfrenceData;
      batch(() => {
         Store.dispatch(updateCallConnectionState(callConnectionStatus));
         Store.dispatch(
            showConfrence({
               localStream: confrenceData?.localStream,
               localVideoMuted: confrenceData?.localVideoMuted,
               localAudioMuted: confrenceData?.localAudioMuted,
               callStatusText: 'Calling',
            }),
         );
         Store.dispatch(openCallModal());
         Store.dispatch(setCallModalScreen(OUTGOING_CALL_SCREEN));
      });
      preventMultipleClick = false;
      try {
         if (callType === 'audio') {
            muteLocalVideo(true);
            call = await SDK.makeVoiceCall(users, groupId);
         } else if (callType === 'video') {
            muteLocalVideo(false);
            call = await SDK.makeVideoCall(users, groupId);
         }
         if (call.statusCode !== 200 && call.message === PERMISSION_DENIED) {
            deleteAndDispatchAction();
         } else {
            roomId = call.roomId;
            // callLogsObj.insert({
            //     "callMode": callConnectionStatus.callMode,
            //     "callState": 1,
            //     "callTime": callLogsObj.initTime(),
            //     "callType": callConnectionStatus.callType,
            //     "fromUser": callConnectionStatus.from,
            //     "roomId": roomId,
            //     "userList": callConnectionStatus.userList,
            //     ...(callMode === "onetomany" && {
            //         "groupId": groupId
            //     })
            // });

            let callConnectionStatusNew = {
               ...callConnectionStatus,
               roomId: roomId,
            };

            Store.dispatch(updateCallConnectionState(callConnectionStatusNew));
            startCallingTimer();
         }
      } catch (error) {
         console.log('Error in making call', error);
      }
   } else {
      showToast('Please check your internet connection', {
         id: 'Network_error',
      });
      preventMultipleClick = false;
   }
};

const startCall = (uuid, callerId, callerName, hasVideo) => {
   RNCallKeep.startCall(uuid, callerId, callerName, 'generic', hasVideo);
   handleOutGoing_CallKeepListeners();
};

const answerCallPermissionError = answerCallResonse => {
   declineIncomingCall();
   // End incoming call keep for iOS
   Platform.OS === 'ios' && endCallForIos();
   if (answerCallResonse && answerCallResonse?.message !== PERMISSION_DENIED) {
      showToast(COMMON_ERROR_MESSAGE, { id: 'call-answer-error' });
   }
   batch(() => {
      Store.dispatch(resetCallStateData());
      Store.dispatch(resetConferencePopup());
   });
};

export const answerIncomingCall = async () => {
   stopIncomingCallRingtone();
   clearMissedCallNotificationTimer();
   // updating the SDK flag to keep the connection Alive when app goes background because of document picker
   SDK.setShouldKeepConnectionWhenAppGoesBackground(true);
   try {
      const isPermissionChecked = await AsyncStorage.getItem('microPhone_Permission');
      AsyncStorage.setItem('microPhone_Permission', 'true');
      const result = await requestMicroPhonePermission();
      // updating the SDK flag back to false to behave as usual
      SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
      if (result === 'granted' || result === 'limited') {
         const answerCallResonse = await SDK.answerCall();
         if (answerCallResonse.statusCode !== 200) {
            answerCallPermissionError(answerCallResonse);
         } else {
            // update the call screen Name instead of the below line
            batch(() => {
               if (Platform.OS === 'ios') {
                  Store.dispatch(openCallModal());
               }
            });
            // TODO: update the Call logs when implementing
            // callLogs.update(callConnectionDate.data.roomId, {
            //   startTime: callLogs.initTime(),
            //   callState: 2,
            // });
         }
      } else if (isPermissionChecked) {
         setTimeout(() => {
            openSettings();
         }, 500);
         answerCallPermissionError();
      } else {
         answerCallPermissionError();
      }
   } catch (error) {
      // updating the SDK flag back to false to behave as usual
      SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
      console.log('makeOne2OneCall', error);
   }
};

export const declineIncomingCall = async () => {
   stopIncomingCallRingtone();
   clearMissedCallNotificationTimer();
   let declineCallResponse = await SDK.declineCall();
   console.log('declineCallResponse', declineCallResponse);
   if (declineCallResponse.statusCode === 200) {
      // TODO: update the Call logs when implementing
      // callLogs.update(callConnectionDate.data.roomId, {
      //   endTime: callLogs.initTime(),
      //   sessionStatus: CALL_SESSION_STATUS_CLOSED,
      // });
      dispatchDisconnected();
      setTimeout(() => {
         batch(() => {
            Store.dispatch(closeCallModal());
            Store.dispatch(clearCallData());
            Store.dispatch(resetConferencePopup());
         });
         resetCallData();
      }, DISCONNECTED_SCREEN_DURATION);
   } else {
      console.log('Error occured while rejecting the incoming call', declineCallResponse.errorMessage);
   }
};

const openApplicationBack = () => {
   const appUrl = 'mirrorfly_rn://';
   if (Linking.canOpenURL(appUrl)) Linking.openURL(appUrl);
};

const handleIncoming_CallKeepListeners = () => {
   RNCallKeep.addEventListener('answerCall', async ({ callUUID }) => {
      console.log('callUUID from Call Keep answer call event', callUUID);
      answerIncomingCall();
   });
   RNCallKeep.addEventListener('endCall', async ({ callUUID }) => {
      console.log('callUUID from Call Keep end call event', callUUID);
      declineIncomingCall();
   });
};

export const endCall = async () => {
   disconnectCallConnection([], CALL_STATUS_DISCONNECTED, () => {
      Store.dispatch(resetCallStateData());
   }); //hangUp calls
};

const handleOutGoing_CallKeepListeners = () => {
   RNCallKeep.addEventListener('endCall', async ({ callUUID }) => {
      endCall();
   });
};

export const displayIncomingCallForIos = callResponse => {
   const callingUserData = callResponse.usersStatus?.find(
      u => u.userJid === callResponse.userJid && u.localUser === false,
   );
   const activeCallUUID = Store.getState().callData?.callerUUID || '';
   if (!activeCallUUID && callingUserData) {
      const callUUID = uuidv4();
      Store.dispatch(updateCallerUUID(callUUID));
      const contactNumber = getUserIdFromJid(callResponse.userJid);
      const contactName =
         callingUserData.userDetails?.displayName || getUserProfile(contactNumber)?.nickName || contactNumber;
      RNCallKeep.displayIncomingCall(
         callUUID,
         contactNumber,
         contactName,
         'generic',
         callResponse.callType === 'video',
      );
   }
   handleIncoming_CallKeepListeners();
};

export const endCallForIos = async () => {
   try {
      const activeCallUUID = Store.getState().callData?.callerUUID || '';
      const calls = await RNCallKeep.getCalls();
      const activeCall = calls.find(c => c.callUUID === activeCallUUID);
      if (activeCall?.callUUID) {
         RNCallKeep.endCall(activeCall.callUUID);
      }
   } catch (err) {
      console.log('Error while ending the call on iOS', err);
   }
};

const deleteAndDispatchAction = () => {
   Store.dispatch(
      showConfrence({
         showComponent: false,
         showCalleComponent: false,
         stopSound: true,
         callStatusText: null,
      }),
   );
};

export const getCallData = async userJid => {
   return Promise.all(
      userJid.map(async userId => {
         const jid = formatUserIdToJid(userId);
         const profileData = await SDK.getUserProfile(jid);
         if (profileData && profileData.statusCode === 200) {
            let response = {
               email: profileData.data.email,
               image: profileData.data.image,
               isAdminBlocked: 0,
               isDeletedUser: false,
               isFriend: true,
               mobileNumber: profileData.data.mobileNumber,
               name: profileData.data.nickName,
               nickName: profileData.data.nickName,
               status: profileData.data.status,
               userColor: '',
               userId: profileData.data.userId,
               userJid: jid,
            };
            let data = {
               contactName: profileData.data.nickName,
               email: profileData.data.email,
               image: profileData.data.image,
               isAdminBlocked: 0,
               isDeletedUser: false,
               isFriend: true,
               mobileNumber: profileData.data.mobileNumber,
               name: profileData.data.nickName,
               nickName: profileData.data.nickName,
               roster: response,
               userId: profileData.data.userId,
               userJid: jid,
            };
            return data;
         }
      }),
   );
};

export const isRoomExist = () => {
   let roomId = Store.getState().callData.connectionState.roomId || '';
   return roomId;
};

export const endOngoingCall = () => {
   SDK.endCall();
   resetCallData();
   Store.dispatch(resetCallStateData());
};

export const updateMissedCallNotification = callData => {
   if (!callData.localUser) {
      let userID = getUserIdFromJid(callData.userJid);
      const userProfile = getUserProfileFromSDK(userID);
      const nickName = userProfile.nickName || userID;
      pushNotify(callData?.roomId, nickName, getMissedCallMessage(callData?.callType), callData.userJid);
   }
};

const onVoipPushNotificationiReceived = async data => {
   let {
      payload,
      payload: { caller_id, caller_name },
      callUUID,
   } = data;
   const activeCallUUID = Store.getState().callData?.callerUUID || '';
   if (activeCallUUID !== '') {
      const calls = await RNCallKeep.getCalls();
      const activeCall = calls.find(c => c.callUUID === callUUID);
      RNCallKeep.reportEndCallWithUUID(activeCall.callUUID, CK_CONSTANTS.END_CALL_REASONS.MISSED);
   } else {
      const decryptName = await SDK.decryptProfileDetails(caller_name, getUserIdFromJid(caller_id));
      RNCallKeep.updateDisplay(callUUID, decryptName, getUserIdFromJid(caller_id));
      Store.dispatch(updateCallerUUID(callUUID));
   }
   let remoteMessage = {
      data: payload,
   };
   await SDK.getNotificationData(remoteMessage);
};

export const pushNotifyBackground = () => {
   RNCallKeep.addEventListener('didLoadWithEvents', events => {
      // `events` is passed as an Array chronologically, handle or ignore events based on the app's logic
      // see example usage in https://github.com/react-native-webrtc/react-native-callkeep/pull/169 or https://github.com/react-native-webrtc/react-native-callkeep/pull/205
      if (!events || !Array.isArray(events) || events.length < 1) {
         return;
      }
      for (let voipPushEvent of events) {
         let { name, data } = voipPushEvent;
         if (name === 'RNCallKeepDidDisplayIncomingCall' && Number(data.fromPushKit) === 1) {
            onVoipPushNotificationiReceived(data);
         }
      }
   });

   RNCallKeep.addEventListener('didDisplayIncomingCall', data => {
      if (Number(data.fromPushKit) === 1) {
         onVoipPushNotificationiReceived(data);
      }
   });

   // RNVoipPushNotification.addEventListener('didLoadWithEvents', events => {
   //    // --- this will fire when there are events occured before js bridge initialized
   //    // --- use this event to execute your event handler manually by event type
   //    if (!events || !Array.isArray(events) || events.length < 1) {
   //       return;
   //    }
   //    for (let voipPushEvent of events) {
   //       let { name, data } = voipPushEvent;
   //       if (name === RNVoipPushNotification.RNVoipPushRemoteNotificationsRegisteredEvent) {
   //          //   onVoipPushNotificationRegistered(data);
   //       } else if (name === RNVoipPushNotification.RNVoipPushRemoteNotificationReceivedEvent) {
   //          console.log(data,"data");

   //          // onVoipPushNotificationiReceived(data, 'didLoadWithEvents');
   //       }
   //    }
   // });

   // RNVoipPushNotification.addEventListener('notification', async notification => {
   //    // --- when receive remote voip push, register your VoIP client, show local notification ... etc
   //    console.log(notification,"notification");
   //    // Alert.alert('', 'RNVoipPushNotification')
   //    // onVoipPushNotificationiReceived(notification, 'notification');
   //    // --- optionally, if you `addCompletionHandler` from the native side, once you have done the js jobs to initiate a call, call `completion()`
   //    RNVoipPushNotification.onVoipNotificationCompleted(notification.uuid);
   // });
};

let networkListnerWhenIncomingCallSubscriber;

export const listnerForNetworkStateChangeWhenIncomingCall = () => {
   networkListnerWhenIncomingCallSubscriber = NetInfo.addEventListener(state => {
      if (!state.isInternetReachable) {
         const callState = Store.getState().callData;
         if (callState?.screenName === INCOMING_CALL_SCREEN) {
            SDK.endCall();
            // unsubscrobing the listener
            networkListnerWhenIncomingCallSubscriber();
            // ending the call and clearing the data
            stopIncomingCallRingtone();
            clearMissedCallNotificationTimer();
            resetCallData();
            batch(() => {
               Store.dispatch(closeCallModal());
               Store.dispatch(resetCallStateData());
            });
         }
      }
   });
};

export const unsubscribeListnerForNetworkStateChangeWhenIncomingCall = () => {
   // unsubscrobing the listener
   networkListnerWhenIncomingCallSubscriber?.();
};
