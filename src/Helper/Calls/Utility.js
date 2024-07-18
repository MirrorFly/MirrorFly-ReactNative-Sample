import NetInfo from '@react-native-community/netinfo';
import { debounce } from 'lodash-es';
import { AppState, DeviceEventEmitter, NativeModules, Platform } from 'react-native';
import _BackgroundTimer from 'react-native-background-timer';
import HeadphoneDetection from 'react-native-headphone-detection';
import RNInCallManager from 'react-native-incall-manager';
import KeepAwake from 'react-native-keep-awake';
import KeyEvent from 'react-native-keyevent';
import { openSettings } from 'react-native-permissions';
import RNVoipPushNotification from 'react-native-voip-push-notification';
import SDK, { RealmKeyValueStore } from '../../SDK/SDK';
import { clearIosCallListeners, muteLocalAudio, muteLocalVideo, resetCallData } from '../../SDK/sdkCallBacks';
import { getUserProfileFromSDK } from '../../SDK/utils';
import { callNotifyHandler, stopForegroundServiceNotification } from '../../calls/notification/callNotifyHandler';
import { getNetworkState } from '../../common/hooks';
import {
   checkCameraPermission,
   checkMicroPhonePermission,
   requestBluetoothConnectPermission,
   requestCameraMicPermission,
   requestMicroPhonePermission,
} from '../../common/permissions';
import ActivityModule from '../../customModules/ActivityModule';
import AudioRoutingModule from '../../customModules/AudioRoutingModule';
import BluetoothHeadsetDetectionModule from '../../customModules/BluetoothHeadsetDetectionModule';
import RNCallKeep, { CONSTANTS as CK_CONSTANTS } from '../../customModules/CallKitModule';
import RingtoneSilentKeyEventModule from '../../customModules/RingtoneSilentKeyEventModule';
import { formatUserIdToJid, getUserIdFromJid, showToast } from '../../helpers/chatHelpers';
import { resetCallAgainData } from '../../redux/callAgainSlice';
import {
   updateCallAudioMutedAction,
   updateCallBluetoothHeadsetConnected,
   updateCallSelectedAudioRoute,
   updateCallSpeakerEnabledAction,
   updateCallVideoMutedAction,
   updateCallWiredHeadsetConnected,
   updateCurrentDeviceAudioState,
   updateSwitchCamera,
} from '../../redux/callControlsSlice';
import { showCallModalToastAction } from '../../redux/callModalToastSlice';
import {
   callDurationTimestamp,
   clearCallData,
   closeCallModal,
   openCallModal,
   resetCallStateData,
   setCallModalScreen,
   updateCallConnectionState,
   updateCallerUUID,
   updateIsCallFromVoip,
} from '../../redux/callStateSlice';
import { closePermissionModal } from '../../redux/permissionSlice';
import { getRoasterData, getUserNameFromStore } from '../../redux/reduxHook';
import { resetConferencePopup, showConfrence } from '../../redux/showConfrenceSlice';
import store from '../../redux/store';
import { getLocalUserDetails } from '../../uikitMethods';
import {
   callConnectionStoreData,
   clearIncomingCallTimer,
   clearMissedCallNotificationTimer,
   debounceFunction,
   disconnectCallConnection,
   dispatchDisconnected,
   endCall,
   getMaxUsersInCall,
   getSelectedAudioRoute,
   startCallingTimer,
   startOutgoingCallRingingTone,
   stopIncomingCallRingtone,
   stopOutgoingCallRingingTone,
   stopReconnectingTone,
   updateCallTypeAfterCallSwitch
} from './Call';
import {
   AUDIO_ROUTE_BLUETOOTH,
   AUDIO_ROUTE_HEADSET,
   AUDIO_ROUTE_PHONE,
   AUDIO_ROUTE_SPEAKER,
   CALL_STATUS_DISCONNECTED,
   CALL_TYPE_AUDIO,
   CALL_TYPE_VIDEO,
   COMMON_ERROR_MESSAGE,
   DISCONNECTED_SCREEN_DURATION,
   INCOMING_CALL_SCREEN,
   ONGOING_CALL_SCREEN,
   OUTGOING_CALL_SCREEN,
   PERMISSION_DENIED,
} from './Constant';
import { clearIntervalConversionPopUp } from './index';

let preventMultipleClick = false;
let callBackgroundNotification = true;
let preventEndCallFromHeadsetButton = false;
let previousHeadsetStatus = false;
let listenerCount = 0;
let isPipMode = false;

export const audioRouteNameMap = {
   Speaker: AUDIO_ROUTE_SPEAKER,
   Headset: AUDIO_ROUTE_HEADSET,
   Headphones: AUDIO_ROUTE_HEADSET, // iOS
   // 'Headset Microphone': AUDIO_ROUTE_HEADSET, // iOS
   Bluetooth: AUDIO_ROUTE_BLUETOOTH,
   BluetoothHFP: AUDIO_ROUTE_BLUETOOTH, // iOS
   '': '', // receiver
   Phone: '',
   Receiver: '',
};

const calculateAudioRoute = (
   isSpeakerEnabled,
   previousAudioRoute,
   { audioJack = false, bluetooth = false } = {},
   { previousAudioJack = false, previousBluetooth = false } = {},
) => {
   const isVideoCall = getCallType() === CALL_TYPE_VIDEO ? AUDIO_ROUTE_SPEAKER : '';
   const speakerPriority = isSpeakerEnabled ? AUDIO_ROUTE_SPEAKER : isVideoCall;
   const wiredHeadsetPriority = audioJack ? AUDIO_ROUTE_HEADSET : speakerPriority;
   const bluetoothPriority = bluetooth ? AUDIO_ROUTE_BLUETOOTH : wiredHeadsetPriority;

   if (bluetooth && !previousBluetooth) {
      return AUDIO_ROUTE_BLUETOOTH;
   } else if (audioJack && !previousAudioJack) {
      return wiredHeadsetPriority || bluetoothPriority;
   } else if (previousBluetooth && !bluetooth) {
      // if speaker enabled when bluetooth disconnected, then speaker should be routed
      return speakerPriority || wiredHeadsetPriority;
   } else if (previousAudioJack && !audioJack) {
      // if speaker enabled when headset disconnected, then speaker should be routed
      return speakerPriority || bluetoothPriority;
   } else {
      return previousAudioRoute;
   }
};

const toggleSpeaker = speakerEnabled => {
   RNInCallManager.setSpeakerphoneOn(speakerEnabled);
};

const routeAndroidAudioTo = _route => {
   switch (_route) {
      case '': // Receiver
         toggleSpeaker(false);
         break;
      case AUDIO_ROUTE_SPEAKER:
         toggleSpeaker(true);
         break;
      case AUDIO_ROUTE_HEADSET:
         AudioRoutingModule.routeAudioTo('Headset');
         break;
      case AUDIO_ROUTE_BLUETOOTH:
         AudioRoutingModule.routeAudioTo('Bluetooth');
         break;
   }
};

/**
 * @typedef HeadphonesData
 * @property {boolean} audioJack
 * @property {boolean} bluetooth
 */

/**
 * @param {HeadphonesData} data
 */
const handleHeadphoneDetection = async data => {
   const { data: confrenceData = {} } = store.getState().showConfrenceData || {};
   if (Object.keys(confrenceData).length === 0) {
      return;
   }
   const callControlsData = store.getState().callControlsData;
   const isSpeakerEnabledInUI = callControlsData?.isSpeakerEnabled || false;
   const isWiredHeadsetConnected = callControlsData?.isWiredHeadsetConnected || false;
   const isBluetoothHeadsetConnected = callControlsData?.isBluetoothHeadsetConnected || false;
   const selectedAudioRoute = callControlsData?.selectedAudioRoute || '';

   if (Platform.OS === 'android') {
      const calculatedRoute = calculateAudioRoute(
         isSpeakerEnabledInUI,
         selectedAudioRoute,
         { audioJack: data.audioJack, bluetooth: data.bluetooth },
         {
            previousAudioJack: isWiredHeadsetConnected,
            previousBluetooth: isBluetoothHeadsetConnected,
         },
      );
      routeAndroidAudioTo(calculatedRoute);
      store.dispatch(updateCallSelectedAudioRoute(calculatedRoute));
   }
   store.dispatch(updateCurrentDeviceAudioState({ headset: data.audioJack, bluetooth: data.bluetooth }));
   data.audioJack !== isWiredHeadsetConnected && setPreviousHeadsetStatus(isWiredHeadsetConnected);
   data.audioJack !== isWiredHeadsetConnected && store.dispatch(updateCallWiredHeadsetConnected(data.audioJack));
   data.bluetooth !== isBluetoothHeadsetConnected &&
      store.dispatch(updateCallBluetoothHeadsetConnected(data.bluetooth));
};

const debouncedHandleHeadphoneDetection = debounce(handleHeadphoneDetection, 140);

export const addHeadphonesConnectedListenerForCall = (shouldUpdateInitialValue = true) => {
   HeadphoneDetection.addListener(debouncedHandleHeadphoneDetection);
   if (Platform.OS === 'android') {
      BluetoothHeadsetDetectionModule.addBluetoothHeadsetListener(device => {
         !device && HeadphoneDetection.isAudioDeviceConnected().then(debouncedHandleHeadphoneDetection);
      });
   }
   if (shouldUpdateInitialValue) {
      HeadphoneDetection.isAudioDeviceConnected().then(debouncedHandleHeadphoneDetection);
   }

   preventEndCallFromHeadsetButton = false;
   // ending/declining the call in iOS will be taken care by the callKeep
   // so adding a keyup listener for android to end/decline the call when headset play/pause button pressed
   KeyEvent.onKeyUpListener(keyEvent => {
      if (Platform.OS === 'android') {
         if (keyEvent.keyCode === 25 || keyEvent.keyCode === 24) {
            stopIncomingCallRingtone();
         }
      }
      if (Platform.OS === 'android' && keyEvent.keyCode === 79) {
         // keyCode 79 is KEYCODE_HEADSETHOOK which is the play/pause button on headset
         const { screenName, connectionState, callerUUID } = store.getState().callData;
         if (Object.keys(connectionState || {}).length > 0) {
            if (screenName === INCOMING_CALL_SCREEN) answerIncomingCall(callerUUID);
            else if (!preventEndCallFromHeadsetButton) {
               preventEndCallFromHeadsetButton = true;
               endCall();
            }
         }
      }
   });
   RingtoneSilentKeyEventModule.addEventListener(() => {
      console.log('Ringtone silented');
      stopIncomingCallRingtone();
   });
};

//Making OutGoing Call
export const makeCalls = async (callType, userId) => {
   let userList = [];
   if (!userId || preventMultipleClick) {
      return;
   }
   let connectionStatus = getNetworkState();
   if (connectionStatus) {
      preventMultipleClick = true;
      addHeadphonesConnectedListenerForCall();
      let userListData = await getCallData(userId);
      userList = [...userListData];
      makeOne2OneCall(callType, userList);
   } else {
      showToast('Please check your internet connection');
      preventMultipleClick = false;
   }
};

const makeOne2OneCall = async (callType, usersList) => {
   let callMode = 'onetoone';
   let users = [];
   const maxMemberReached = Boolean(usersList.length > getMaxUsersInCall() - 1);
   if (maxMemberReached) {
      /** toast.error("Maximum " + getMaxUsersInCall() + " members allowed in a call"); */
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
         /**let userDetails = getDataFromRoster(user);
          *
         // if (!userDetails.isDeletedUser) {
         // }
          */
         users.push(formatUserIdToJid(user));
      });
   }
   makeCall(callMode, callType, users, usersList, '');
   /**
   else {
      // if(toast.error.length > 1) {
      //     toast.dismiss();
      //     // // toast.error(FEATURE_RESTRICTION_ERROR_MESSAGE);
      // }
   }
   */
};

const makeCall = async (callMode, callType, groupCallMemberDetails, usersList, groupId = null) => {
   let connectionStatus = getNetworkState();
   if (connectionStatus) {
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
      let uuid = SDK.randomString(16, 'BA');
      if (Platform.OS === 'ios') {
         startProximitySensor();
         const callerName = usersList.map(ele => ele.name).join(',');
         const hasVideo = callType === 'video';
         let callerId = users.join(',')?.split?.('@')?.[0];
         store.dispatch(updateCallerUUID(uuid));
         startCall(uuid, callerId, callerName, hasVideo);
      }
      const debouncedRingTone = debounceFunction(startOutgoingCallRingingTone, 1000);
      debouncedRingTone(callType);

      const showConfrenceData = store.getState().showConfrenceData;
      const { data: confrenceData } = showConfrenceData;
      store.dispatch(updateCallConnectionState(callConnectionStatus));
      store.dispatch(
         showConfrence({
            localStream: confrenceData?.localStream,
            localVideoMuted: confrenceData?.localVideoMuted,
            localAudioMuted: confrenceData?.localAudioMuted,
            callStatusText: 'Trying to connect',
         }),
      );
      openCallModelActivity();
      /** store.dispatch(openCallModal()); */
      store.dispatch(setCallModalScreen(OUTGOING_CALL_SCREEN));
      try {
         if (callType === 'audio') {
            muteLocalVideo(true);
            call = await SDK.makeVoiceCall(users, groupId);
         } else if (callType === 'video') {
            muteLocalVideo(false);
            store.dispatch(updateCallVideoMutedAction(false));
            call = await SDK.makeVideoCall(users, groupId);
            enableSpeaker(uuid);
         }
         if (call.statusCode !== 200 && call.message === PERMISSION_DENIED) {
            stopOutgoingCallRingingTone();
            deleteAndDispatchAction();
         } else {
            roomId = call.roomId;
            /**
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
            */
            let callConnectionStatusNew = {
               ...callConnectionStatus,
               roomId: roomId,
            };
            if (Platform.OS === 'android') {
               const contactNumber = getUserIdFromJid(callConnectionStatus.to);
               let nickName = getUserNameFromStore(contactNumber) || contactNumber;
               callNotifyHandler(roomId, callConnectionStatus, callConnectionStatus.to, nickName, 'OUTGOING_CALL');
            }
            store.dispatch(updateCallConnectionState(callConnectionStatusNew));
            startCallingTimer();
         }
      } catch (error) {
         console.log('Error in making call', error);
      }
      preventMultipleClick = false;
   } else {
      showToast('Please check your internet connection');
      preventMultipleClick = false;
   }
};

//Report outgoing call to callkit for ios
const startCall = (uuid, callerId, callerName, hasVideo) => {
   handleOutGoing_CallKeepListeners();
   RNCallKeep.startCall(uuid, callerId, callerName, 'generic', hasVideo);
};

//PermissionError while answering the call
const answerCallPermissionError = answerCallResonse => {
   declineIncomingCall();
   // End incoming call keep and clearing the listeners for iOS
   clearIosCallListeners();
   endCallForIos();

   if (answerCallResonse && answerCallResonse?.message !== PERMISSION_DENIED) {
      showToast(COMMON_ERROR_MESSAGE);
   }
   resetCallModalActivity();
   /** store.dispatch(resetCallStateData()); */
   store.dispatch(resetConferencePopup());
};

export const enableSpeaker = async (activeCallerUUID = '', isSpeakerEnabled = true) => {
   const callControlsData = store.getState().callControlsData;
   const isWiredHeadsetConnected = callControlsData?.isWiredHeadsetConnected || false;
   const isBluetoothHeadsetConnected = callControlsData?.isBluetoothHeadsetConnected || false;
   let microPhone = await RNCallKeep.getAudioRoutes().then(routes => routes.filter(r => r.type === AUDIO_ROUTE_PHONE));
   let audioRouteTo = isSpeakerEnabled ? AUDIO_ROUTE_SPEAKER : microPhone[0].name;
   !isBluetoothHeadsetConnected &&
      !isWiredHeadsetConnected &&
      (await updateAudioRouteTo(audioRouteTo, audioRouteTo, activeCallerUUID));
};

//Answering the incoming call
export const answerIncomingCall = async callId => {
   stopIncomingCallRingtone();
   clearIncomingCallTimer();
   clearMissedCallNotificationTimer();
   const { data: confrenceData = {} } = store.getState().showConfrenceData || {};
   const { callStatusText } = confrenceData;
   if (callStatusText === CALL_STATUS_DISCONNECTED) {
      return;
   }
   if (Platform.OS === 'android') {
      await stopForegroundServiceNotification();
   }
   const callData = store.getState().callData || {};
   const callConnectionStateData = callData?.connectionState || {};
   let callType = callConnectionStateData?.callType;

   // updating the SDK flag to keep the connection Alive when app goes background because of document picker
   SDK.setShouldKeepConnectionWhenAppGoesBackground(true);
   const activeCallerUUID = callData?.callerUUID;
   try {
      let isPermissionChecked = false;
      if (callType === CALL_TYPE_AUDIO) {
         isPermissionChecked = await RealmKeyValueStore.getItem('microPhone_Permission');
         RealmKeyValueStore.setItem('microPhone_Permission', 'true');
      } else {
         isPermissionChecked = await RealmKeyValueStore.getItem('camera_microPhone_Permission');
         RealmKeyValueStore.setItem('camera_microPhone_Permission', 'true');
      }
      callBackgroundNotification = false;
      setTimeout(() => {
         store.dispatch(closePermissionModal());
      }, 0);
      const result =
         callType === CALL_TYPE_AUDIO ? await requestMicroPhonePermission() : await requestCameraMicPermission(); // updating the SDK flag back to false to behave as usual
      const bluetoothPermission = await requestBluetoothConnectPermission();
      SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
      callBackgroundNotification = true;
      if ((result === 'granted' || result === 'limited') && bluetoothPermission === 'granted') {
         // validating call connectionState data because sometimes when permission popup is opened
         // and call ended and then user accept the permission
         // So validating the call is active when user permission has been given and not ended before the permission has been given
         if (
            Object.keys(callConnectionStateData).length > 0 &&
            callConnectionStateData.status !== 'ended' &&
            // making sure that the active callID and the callId given by CallKeep(iOS) or from Incoming call Screen (Android) are the same
            callId?.toLowerCase?.() === activeCallerUUID?.toLowerCase?.()
         ) {
            const answerCallResonse = await SDK.answerCall();
            if (callType === CALL_TYPE_VIDEO) {
               enableSpeaker(activeCallerUUID);
            }
            Platform.OS === 'ios' && handleRouteToBluetooth();
            if (answerCallResonse.statusCode !== 200) {
               answerCallPermissionError(answerCallResonse);
            } else {
               store.dispatch(setCallModalScreen(ONGOING_CALL_SCREEN));
               if (!callData.showCallModal) {
                  openCallModelActivity();
                  /** store.dispatch(openCallModal()); */
               }
               if (Platform.OS === 'ios') {
                  startProximitySensor();
               }
               // updating the call connected status to android native code
               Platform.OS === 'android' && ActivityModule.updateCallConnectedStatus(true);
               /**
               // TODO: update the Call logs when implementing
               // callLogs.update(callConnectionDate.data.roomId, {
               //   startTime: callLogs.initTime(),
               //   callState: 2,
               // });
                */
            }
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
      callBackgroundNotification = true;
      console.log('answerIncomingCall', error);
   }
};

const handleRouteToBluetooth = async () => {
   const { isBluetoothHeadsetConnected = false } = store.getState().callControlsData || {};
   if (isBluetoothHeadsetConnected) {
      const callData = store.getState().callData || {};
      const callControlsData = store.getState().callControlsData || {};
      const isSpeakerEnabled = store.getState().callControlsData.isSpeakerEnabled || false;
      const activeCallerUUID = callData?.callerUUID;
      const selectedAudioRoute = callControlsData?.selectedAudioRoute;
      let forceSelectedAudioRoute = getSelectedAudioRoute();
      if (selectedAudioRoute === AUDIO_ROUTE_SPEAKER) {
         await updateAudioRouteTo(AUDIO_ROUTE_SPEAKER, AUDIO_ROUTE_SPEAKER, activeCallerUUID, false);
      }
      const _routes = await RNCallKeep.getAudioRoutes();
      const headSetPlugin = Boolean(
         _routes.find(res => audioRouteNameMap[res.type] === AUDIO_ROUTE_HEADSET && res.selected),
      );
      _routes.forEach(r => {
         if (
            audioRouteNameMap[r.type] === AUDIO_ROUTE_BLUETOOTH &&
            !headSetPlugin &&
            !isSpeakerEnabled &&
            (selectedAudioRoute === AUDIO_ROUTE_BLUETOOTH || forceSelectedAudioRoute === '')
         ) {
            updateAudioRouteTo(r.name, r.type, activeCallerUUID, false);
         }
      });
   }
};

//Decling the incoming call
export const declineIncomingCall = async () => {
   const { data: confrenceData = {} } = store.getState().showConfrenceData || {};
   const { callStatusText } = confrenceData;
   if (callStatusText === CALL_STATUS_DISCONNECTED) {
      return;
   }
   clearIncomingCallTimer();
   stopIncomingCallRingtone();
   clearMissedCallNotificationTimer();
   let declineCallResponse = await SDK.declineCall();
   if (Platform.OS === 'android') {
      await stopForegroundServiceNotification();
   }
   if (declineCallResponse.statusCode === 200) {
      /**
      // TODO: update the Call logs when implementing
      // callLogs.update(callConnectionDate.data.roomId, {
      //   endTime: callLogs.initTime(),
      //   sessionStatus: CALL_SESSION_STATUS_CLOSED,
      // });
       */
      dispatchDisconnected();
      setTimeout(() => {
         closeCallModalActivity(true);
         resetCallData();
         store.dispatch(clearCallData());
         store.dispatch(resetConferencePopup());
      }, DISCONNECTED_SCREEN_DURATION);
   } else {
      console.log('Error occured while rejecting the incoming call', declineCallResponse.errorMessage);
   }
};

const debounceAudioRouteChangeListenerForIos = debounce(
   (currentCallUUID, output, reason) => updateAudioRouteTo(output, output, currentCallUUID, true, reason),
   300,
);

const handleAudioRouteChangeListenerForIos = () => {
   RNCallKeep.addEventListener('didChangeAudioRoute', ({ output, reason }) => {
      const currentCallUUID = store.getState().callData?.callerUUID;
      debounceAudioRouteChangeListenerForIos(currentCallUUID, output, reason);
   });
};

//CallKit action buttons listeners for incoming call
const handleIncoming_CallKeepListeners = () => {
   RNCallKeep.addEventListener('answerCall', async ({ callUUID }) => {
      console.log('callUUID from Call Keep answer call event', callUUID);
      answerIncomingCall(callUUID);
      handleAudioRouteChangeListenerForIos();
   });
   RNCallKeep.addEventListener('endCall', async ({ callUUID }) => {
      console.log('callUUID from Call Keep end call event', callUUID);
      // clearing all the call keep related listeners, because call keep reports speaker change event when call disconnected by other user
      clearIntervalConversionPopUp();
      clearIosCallListeners();
      const { screenName } = store.getState().callData;
      if (screenName === INCOMING_CALL_SCREEN) declineIncomingCall();
      else endOnGoingCall();
   });
   RNCallKeep.addEventListener('didPerformSetMutedCallAction', ({ muted, callUUID }) => {
      updateCallAudioMute(muted, callUUID, true);
   });
   DeviceEventEmitter.addListener('Proximity', function (data) {
      // --- do something with events
      SDK.socketEmitEvent(data.isNear);
   });
};

//Endcall action for ongoing call
export const endOnGoingCall = async () => {
   const { data: confrenceData = {} } = store.getState().showConfrenceData || {};
   const { callStatusText } = confrenceData;
   if (callStatusText === CALL_STATUS_DISCONNECTED) {
      return;
   }
   stopReconnectingTone();
   clearIntervalConversionPopUp();
   disconnectCallConnection([], CALL_STATUS_DISCONNECTED, async () => {
      /**store.dispatch(resetCallStateData()); */
      resetCallModalActivity();
      if (Platform.OS === 'android') {
         await stopForegroundServiceNotification();
      }
   }); //hangUp calls
};

//CallKit action buttons listeners for ongoing call
const handleOutGoing_CallKeepListeners = () => {
   handleAudioRouteChangeListenerForIos();
   RNCallKeep.addEventListener('endCall', async ({ callUUID }) => {
      clearIntervalConversionPopUp();
      const { screenName } = store.getState().callData;
      if (screenName === OUTGOING_CALL_SCREEN) endCall();
      else endOnGoingCall();
   });
   RNCallKeep.addEventListener('didPerformSetMutedCallAction', ({ muted, callUUID }) => {
      updateCallAudioMute(muted, callUUID, true);
   });
   DeviceEventEmitter.addListener('Proximity', function (data) {
      // --- do something with events
      SDK.socketEmitEvent(data.isNear);
   });
};

export const displayIncomingCallForIos = callResponse => {
   let { callType = '' } = callResponse;
   const callingUserData = callResponse.usersStatus?.find(
      u => u.userJid === callResponse.userJid && u.localUser === false,
   );
   const activeCallUUID = store.getState().callData?.callerUUID || '';
   const isCallFromVoip = store.getState().callData?.isCallFromVoip;
   handleIncoming_CallKeepListeners();
   if (!activeCallUUID && callingUserData) {
      let callUUID = SDK.randomString(16, 'BA');
      store.dispatch(updateCallerUUID(callUUID));
      const contactNumber = getUserIdFromJid(callResponse.userJid);
      const contactName =
         callingUserData?.userDetails?.displayName || getUserNameFromStore(contactNumber) || contactNumber;
      RNCallKeep.displayIncomingCall(
         callUUID,
         contactNumber,
         contactName,
         'generic',
         callResponse.callType === 'video',
      );
   }
   if (AppState.currentState !== 'active' || isCallFromVoip) {
      if (callType === 'audio') {
         checkMicroPhonePermission().then(micPermission => {
            if (micPermission !== 'granted') {
               permissionDeniedEndCall();
            }
         });
      } else if (callType === 'video') {
         checkCameraPermission().then(cameraPermission => {
            if (cameraPermission !== 'granted') {
               permissionDeniedEndCall();
            }
         });
      }
   }
};

const permissionDeniedEndCall = () => {
   endCallForIos();
   declineIncomingCall();
};

export const displayIncomingCallForAndroid = async callResponse => {
   const callingUserData = callResponse.usersStatus?.find(
      u => u.userJid === callResponse.userJid && u.localUser === false,
   );
   const contactNumber = getUserIdFromJid(callResponse.userJid);
   const nickName =
      callingUserData?.userDetails?.displayName || getRoasterData(contactNumber)?.nickName || contactNumber;
   if (AppState.currentState === 'active') {
      /** store.dispatch(openCallModal()); */
      openCallModelActivity();
   }
   appKeepAliveActivity();
   callNotifyHandler(callResponse.roomId, callResponse, callResponse.userJid, nickName, 'INCOMING_CALL', true);
   KeepAwake.deactivate();
};

export const closeCallModalActivity = (forceCloseModal = false) => {
   if (Platform.OS === 'ios') {
      store.dispatch(closeCallModal());
   }
   if (Platform.OS === 'android') {
      forceCloseModal && store.dispatch(closeCallModal());
      ActivityModule.closeActivity();
   }
};

export const resetCallModalActivity = () => {
   store.dispatch(resetCallStateData());
   if (Platform.OS === 'android') {
      ActivityModule.closeActivity();
   }
};

export const openCallModelActivity = async () => {
   store.dispatch(openCallModal());
   if (Platform.OS === 'android') {
      let deviceLocked = await getDeviceLockState();
      /** console.log('device locked state', deviceLocked); */
      if (!deviceLocked) {
         ActivityModule.openActivity();
      }
   }
};

export const appKeepAliveActivity = async () => {
   let appStateWhenGoesBackground = AppState.addEventListener('change', async nextAppState => {
      let activity = await ActivityModule.getActivity();
      if (nextAppState === 'active' && activity?.includes('CallScreenActivity')) {
         store.dispatch(openCallModal());
         appStateWhenGoesBackground.remove();
      }
   });
};

export const appKeepAliveActivityChange = () => {
   SDK.setShouldKeepConnectionWhenAppGoesBackground(true);
   let appStateWhenGoesBackground = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
         SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
         appStateWhenGoesBackground.remove();
      }
   });
};

export const getDeviceLockState = async () => {
   let deviceLocked = await ActivityModule.isLocked();
   return deviceLocked;
};

export const endCallForIos = async () => {
   if (Platform.OS === 'ios') {
      try {
         const activeCallUUID = store.getState().callData?.callerUUID || '';
         const calls = await RNCallKeep.getCalls();
         const activeCall = calls.find(c => c.callUUID === activeCallUUID);
         if (activeCall?.callUUID) {
            RNCallKeep.endCall(activeCall.callUUID);
         }
      } catch (err) {
         console.log('Error while ending the call on iOS', err);
      }
   }
};

const deleteAndDispatchAction = () => {
   resetCallData();
   resetCallModalActivity();
   store.dispatch(resetCallAgainData());
   store.dispatch(
      showConfrence({
         showComponent: false,
         showCalleComponent: false,
         stopSound: true,
         callStatusText: null,
      }),
   );
}

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
   let roomId = store.getState().callData.connectionState.roomId || '';
   return roomId;
};

//End call method while logout
export const endOngoingCallLogout = () => {
   if (Platform.OS === 'android') {
      stopForegroundServiceNotification();
   }
   SDK.endCall();
   resetCallData();
   resetCallModalActivity();
   /**store.dispatch(resetCallStateData()); */
};

export const updateMissedCallNotification = async callData => {
   let userEnded = callData.userEnded || false;
   let userCallData = store.getState().callData.connectionState;
   if (!callData.localUser) {
      if (userEnded && Object.keys(userCallData).length === 0) {
         resetCallData();
      }
      let userID = getUserIdFromJid(callData.userJid);
      const userProfile = await getUserProfileFromSDK(userID);
      const nickName = userProfile?.data?.nickName || userID;
      callNotifyHandler(callData?.roomId, callData, callData.userJid, nickName, 'MISSED_CALL');
   }
};

const onVoipPushNotificationReceived = async data => {
   let {
      payload,
      payload: { caller_id, caller_name },
      callUUID,
   } = data;
   const activeCallUUID = store.getState().callData?.callerUUID || '';
   if (activeCallUUID !== '') {
      const calls = await RNCallKeep.getCalls();
      const activeCall = calls.find(c => c.callUUID === callUUID);
      RNCallKeep.reportEndCallWithUUID(activeCall.callUUID, CK_CONSTANTS.END_CALL_REASONS.MISSED);
   } else {
      const decryptName = await SDK.decryptProfileDetails(caller_name, getUserIdFromJid(caller_id));
      RNCallKeep.updateDisplay(callUUID, decryptName, getUserIdFromJid(caller_id));
      store.dispatch(updateIsCallFromVoip(true));
      store.dispatch(updateCallerUUID(callUUID));
   }
   let remoteMessage = {
      data: payload,
   };
   await SDK.getCallNotification(remoteMessage);
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
            onVoipPushNotificationReceived(data);
         }
      }
   });

   RNCallKeep.addEventListener('didDisplayIncomingCall', data => {
      if (Number(data.fromPushKit) === 1) {
         onVoipPushNotificationReceived(data);
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
   //          console.log('RNVoipPushNotification - RNVoipPushRemoteNotificationReceivedEvent  ==>> ', data);

   //          // onVoipPushNotificationReceived(data, 'didLoadWithEvents');
   //       }
   //    }
   // });

   RNVoipPushNotification.addEventListener('notification', async notification => {
      // this callback will be called only when the incoming call is received while the user is already on a call
      // so sending the notification payload to SDK to send busy status to the caller
      let remoteMessage = {
         data: notification,
      };
      SDK.getCallNotification(remoteMessage);
   });
};

let networkListnerWhenIncomingCallSubscriber;

export const listnerForNetworkStateChangeWhenIncomingCall = () => {
   networkListnerWhenIncomingCallSubscriber = NetInfo.addEventListener(state => {
      if (!state.isInternetReachable) {
         const callState = store.getState().callData;
         if (callState?.screenName === INCOMING_CALL_SCREEN) {
            if (Platform.OS === 'android') {
               stopForegroundServiceNotification();
            }
            SDK.endIncomingCallWhileOffline();
            // unsubscrobing the listener
            networkListnerWhenIncomingCallSubscriber();
            // ending the call and clearing the data
            stopIncomingCallRingtone();
            clearIncomingCallTimer();
            clearMissedCallNotificationTimer();
            resetCallData();

            closeCallModalActivity(true);
            resetCallModalActivity();
            /**
               // store.dispatch(closeCallModal());
               // store.dispatch(resetCallStateData());
                */
         }
      }
   });
};

export const unsubscribeListnerForNetworkStateChangeWhenIncomingCall = () => {
   // unsubscrobing the listener
   networkListnerWhenIncomingCallSubscriber?.();
};

export const getcallBackgroundNotification = () => {
   return callBackgroundNotification;
};

export const showOngoingNotification = callResponse => {
   const callingUserData = callResponse.usersStatus?.find(
      u => u.userJid === callResponse.userJid && u.localUser === false,
   );
   const contactNumber = getUserIdFromJid(callResponse.userJid);
   const nickName =
      callingUserData?.userDetails?.displayName || getRoasterData(contactNumber)?.nickName || contactNumber;
   let callConnectionData = callConnectionStoreData();
   const callDetailObj = {
      ...callResponse,
      ...callConnectionData,
   };
   callNotifyHandler(callDetailObj.roomId, callDetailObj, callResponse.userJid, nickName, 'ONGOING_CALL');
};

export const getNickName = callResponse => {
   const callingUserData = callResponse.usersStatus?.find(
      u => u.userJid === callResponse.userJid && u.localUser === false,
   );
   const contactNumber = getUserIdFromJid(callResponse.userJid);
   const nickName =
      callingUserData?.userDetails?.displayName || getRoasterData(contactNumber)?.nickName || contactNumber;
   return nickName;
};

export const updateCallAudioMute = async (audioMuted, callUUID, isFromCallKeep = false) => {
   try {
      const audioMuteResult = await SDK.muteAudio(audioMuted);
      if (audioMuteResult.statusCode === 200) {
         muteLocalAudio(audioMuted);
         if (Platform.OS === 'ios' && !isFromCallKeep && callUUID) {
            RNCallKeep.setMutedCall(callUUID, audioMuted);
         }

         store.dispatch(updateCallAudioMutedAction(audioMuted));
      }
   } catch (error) {
      console.log('Error when muting/unmuting local user audio', error);
   }
};

export const updateCallVideoMute = async (videoMuted, callUUID, isFromCallKeep = false) => {
   try {
      const videoMuteResult = await SDK.muteVideo(videoMuted);
      if (videoMuteResult.statusCode === 200) {
         /**
         // if (Platform.OS === 'ios' && !isFromCallKeep && callUUID) {
         //    RNCallKeep.setMutedCall(callUUID, audioMuted);
         // }
          */
         muteLocalVideo(videoMuted);
         store.dispatch(updateCallVideoMutedAction(videoMuted));
         updateCallTypeAfterCallSwitch(videoMuted, true);
      }
   } catch (error) {
      console.log('Error when muting/unmuting local user video', error);
   }
};

export const updateAudioRouteTo = async (
   audioRouteName = '', // for iOS
   audioRouteType = '', // for Android
   callUUID = '',
   isFromCallKeep = false,
   audioRouteChangeReason = '',
) => {
   try {
      const speakerEnabled = audioRouteName === AUDIO_ROUTE_SPEAKER;
      const {
         isSpeakerEnabled: isSpeakerEnabledInUI,
         isWiredHeadsetConnected,
         isBluetoothHeadsetConnected = false,
         selectedAudioRoute,
      } = store.getState().callControlsData || {};
      store.dispatch(updateCallSelectedAudioRoute(audioRouteNameMap[audioRouteType]));
      if (Platform.OS === 'android') {
         const _routeName = audioRouteNameMap[audioRouteType];
         routeAndroidAudioTo(_routeName);
      } else if (!isFromCallKeep) {
         setPreviousHeadsetStatus(isWiredHeadsetConnected);
         RNCallKeep.setAudioRoute(callUUID, audioRouteName);
         // if the user is on outgoing call screen and the call is in ringing state, then routing the audio to speaker will not route the ringing tone to speaker
         // because we are routing only the stream and not the ringing tone. So manually enabling/disabling the speaker
         // RNInCallManager.setSpeakerphoneOn(speakerEnabled);
         // RNInCallManager.setForceSpeakerphoneOn(speakerEnabled);
      } else {
         const { selectedAudioRoute: currentSelectedAudioRouting } = store.getState().callControlsData || {};
         let prevIsWiredHeadsetConnected = getPreviousHeadsetStatus();
         const isSpeakerEnabledUI =
            getCallType() === 'audio' ? isSpeakerEnabledInUI : isSpeakerEnabledInUI || prevIsWiredHeadsetConnected;
         switch (audioRouteChangeReason) {
            // iOS audio route change reasons
            case 3: // Category change
               // change the category based on the call type and already selected audio route
               if (
                  audioRouteName?.toLowerCase?.() === 'receiver' &&
                  selectedAudioRoute === 'Bluetooth' &&
                  !currentSelectedAudioRouting
               ) {
                  updateAudioRouteTo(AUDIO_ROUTE_BLUETOOTH, AUDIO_ROUTE_BLUETOOTH, callUUID);
                  return;
               }
               if (
                  isSpeakerEnabledUI &&
                  audioRouteName?.toLowerCase?.() !== 'speaker' &&
                  !isBluetoothHeadsetConnected &&
                  !isWiredHeadsetConnected
               ) {
                  updateAudioRouteTo(AUDIO_ROUTE_SPEAKER, AUDIO_ROUTE_SPEAKER, callUUID);
                  return;
               }
               break;
            case 4: // override
               // already the audio route has been overriden by the callKeep, so ignoring this case
               break;
            case 8: // Configuration Change
               if (
                  getCallType() === 'video' &&
                  (isSpeakerEnabledInUI || prevIsWiredHeadsetConnected) &&
                  audioRouteName?.toLowerCase?.() === 'receiver' &&
                  !isWiredHeadsetConnected &&
                  !isBluetoothHeadsetConnected
               ) {
                  updateAudioRouteTo(AUDIO_ROUTE_SPEAKER, AUDIO_ROUTE_SPEAKER, callUUID);
                  return;
               }
               if (audioRouteName?.toLowerCase?.() === 'receiver' && isSpeakerEnabledUI) {
                  updateAudioRouteTo(AUDIO_ROUTE_SPEAKER, AUDIO_ROUTE_SPEAKER, callUUID);
                  return;
               }
               break;
            case 2: // Old device unavailable
               // The old device became unavailable(eg:headphones have been unpluged)
               if (
                  getCallType() === 'video' &&
                  !isSpeakerEnabledInUI &&
                  !isWiredHeadsetConnected &&
                  !isBluetoothHeadsetConnected
               ) {
                  // Handle the case where a new audio device is connected (e.g., headset)
                  // Update the audio route if needed (e.g., set it to the speaker)
                  // Ensure that the speaker is enabled in the UI
                  updateAudioRouteTo(AUDIO_ROUTE_SPEAKER, AUDIO_ROUTE_SPEAKER, callUUID);
                  return;
               }
               break;
            case 1: //New Device available
               //When speaker is enabled and heatset will connect that time we route manually
               if (
                  (isSpeakerEnabledInUI,
                  isWiredHeadsetConnected,
                  audioRouteNameMap[audioRouteType]?.toLowerCase() === 'headset')
               ) {
                  updateAudioRouteTo(audioRouteName, audioRouteName, callUUID);
                  return;
               }
         }
      }

      isSpeakerEnabledInUI !== speakerEnabled && store.dispatch(updateCallSpeakerEnabledAction(speakerEnabled));
   } catch (err) {
      console.log('Error while toggling speaker', err);
   }
};

export const showCallModalToast = (message, duration) => {
   store.dispatch(
      showCallModalToastAction({
         message: message,
         duration: duration,
      }),
   );
};

export const startDurationTimer = () => {
   if (Platform.OS === 'ios') {
      let callConnectionData = store.getState?.().callData;
      callConnectionData.callDuration === 0 &&
         !callConnectionData.showCallModal &&
         store.dispatch(callDurationTimestamp(Date.now()));
   }
};

export const switchCamera = async cameraSwitch => {
   const response = await SDK.toggleSwitchCamera(cameraSwitch);
   if (response.statusCode === 200) {
      _BackgroundTimer.setTimeout(() => {
         store.dispatch(updateSwitchCamera(cameraSwitch));
      }, 300);
   }
};

export const constructMuteStatus = (streamMute, jid, muteStatus) => {
   return { ...streamMute, [jid]: muteStatus };
};

export const getCallType = () => {
   return store.getState()?.callData?.connectionState?.callType;
};

export const setPreviousHeadsetStatus = headsetStatus => {
   previousHeadsetStatus = headsetStatus;
};

export const getPreviousHeadsetStatus = () => {
   return previousHeadsetStatus;
};

export const setpreventMultipleClick = preventClick => {
   preventMultipleClick = preventClick;
};

export const startProximitySensor = () => {
   NativeModules.InCallManager.addListener('Proximity');
   RNInCallManager.startProximitySensor();
   listenerCount++;
};

export const stopProximityListeners = () => {
   RNInCallManager.stopProximitySensor();
   listenerCount > 0 && NativeModules.InCallManager.removeListeners(listenerCount);
   DeviceEventEmitter.removeAllListeners('Proximity');
   listenerCount = 0;
};

export const setPipMode = pipMode => {
   isPipMode = pipMode;
};

export const isPipModeEnabled = () => {
   return Platform.OS === 'android' ? isPipMode : !store.getState().callData.showCallModal;
};
