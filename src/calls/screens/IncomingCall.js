import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { getImageSource } from '../../common/utils';
import CallsBg from '../../assets/calls-bg.png';
import useRosterData from '../../hooks/useRosterData';
import CloseCallModalButton from '../components/CloseCallModalButton';
import commonStyles from '../../common/commonStyles';
import ApplicationColors from '../../config/appColors';
import Avathar from '../../common/Avathar';
import {
  GestureHandlerRootView,
  RectButton,
} from 'react-native-gesture-handler';
import { batch, useDispatch } from 'react-redux';
import {
  clearCallData,
  closeCallModal,
  resetConferencePopup,
  showConfrence,
} from '../../redux/Actions/CallAction';
import {
  clearMissedCallNotificationTimer,
  dispatchDisconnected,
  stopIncomingCallRingtone,
} from '../../Helper/Calls/Call';
import { resetCallData } from '../../SDKActions/callbacks';
import {
  CALL_CONNECTED_SCREEN,
  CALL_RINGING_DURATION,
  COMMON_ERROR_MESSAGE,
  DISCONNECTED_SCREEN_DURATION,
  PERMISSION_DENIED,
} from '../../Helper/Calls/Constant';
import { showToast } from '../../Helper';
import SDK from '../../SDK/SDK';

let autoCallEndInterval;

const IncomingCall = ({ userId }) => {
  const userProfile = useRosterData(userId);
  const nickName = userProfile.nickName || userProfile.userId;
  const callStatus = 'Incoming audio call';

  const dispatch = useDispatch();

  React.useEffect(() => {
    autoCallEndInterval = setTimeout(() => {
      endCall();
    }, CALL_RINGING_DURATION);
    return () => {
      clearTimeout(autoCallEndInterval);
      stopIncomingCallRingtone();
    };
  }, []);

  const handleClosePress = () => {
    dispatch(closeCallModal());
  };

  // when user not attending the call and the timeout has been reached
  const endCall = async () => {
    clearTimeout(autoCallEndInterval);
    console.log('Ending the call from the useEffect timeout');
    SDK.endCall();
    dispatchDisconnected();
    resetCallData();
    // TODO: update the Call logs when implementing
    // callLogs.update(callConnectionDate.data.roomId, {
    //     "endTime": callLogs.initTime(),
    //     "sessionStatus": CALL_SESSION_STATUS_CLOSED
    // });
    setTimeout(() => {
      // encryptAndStoreInLocalStorage('callingComponent',false)
      // deleteItemFromLocalStorage('roomName')
      // deleteItemFromLocalStorage('callType')
      // deleteItemFromLocalStorage('call_connection_status')
      // encryptAndStoreInLocalStorage("hideCallScreen", false);
      batch(() => {
        dispatch(clearCallData());
        dispatch(resetConferencePopup());
      });
    }, DISCONNECTED_SCREEN_DURATION);
  };

  // when user manually declined the call from the action buttons or swiping to decline the call
  const declineCall = async () => {
    clearTimeout(autoCallEndInterval);
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
        // deleteItemFromLocalStorage('roomName');
        // deleteItemFromLocalStorage('callType');
        // deleteItemFromLocalStorage('call_connection_status');
        // encryptAndStoreInLocalStorage('hideCallScreen', false);
        batch(() => {
          dispatch(closeCallModal());
          dispatch(clearCallData());
          dispatch(resetConferencePopup());
        });
        resetCallData();
      }, DISCONNECTED_SCREEN_DURATION);
    } else {
      console.log(
        'Error occured while rejecting the incoming call',
        declineCallResponse.errorMessage,
      );
    }
  };

  const acceptCall = async () => {
    clearTimeout(autoCallEndInterval);
    stopIncomingCallRingtone();
    clearMissedCallNotificationTimer();
    const answerCallResonse = await SDK.answerCall();
    console.log('answerCallResonse', answerCallResonse);
    if (answerCallResonse.statusCode !== 200) {
      if (answerCallResonse.message !== PERMISSION_DENIED) {
        showToast(COMMON_ERROR_MESSAGE, { id: 'call-answer-error' });
      }
      // deleteItemFromLocalStorage('roomName');
      // deleteItemFromLocalStorage('callType');
      // deleteItemFromLocalStorage('call_connection_status');
      // encryptAndStoreInLocalStorage('hideCallScreen', false);
      // encryptAndStoreInLocalStorage('callingComponent', false);
      // encryptAndStoreInLocalStorage('hideCallScreen', false);
      batch(() => {
        dispatch(clearCallData());
        dispatch(resetConferencePopup());
      });
    } else {
      // update the call screen Name instead of the below line
      // encryptAndStoreInLocalStorage('connecting', true);
      dispatch(
        showConfrence({
          // showComponent: true,
          // showCalleComponent: false,
          screenName: CALL_CONNECTED_SCREEN,
        }),
      );
      // TODO: update the Call logs when implementing
      // callLogs.update(callConnectionDate.data.roomId, {
      //   startTime: callLogs.initTime(),
      //   callState: 2,
      // });
    }
  };

  return (
    <ImageBackground style={styles.container} source={getImageSource(CallsBg)}>
      <View>
        {/* down arrow to close the modal */}
        <CloseCallModalButton onPress={handleClosePress} />
        {/* call status */}
        <View style={styles.callStatusWrapper}>
          <Text style={styles.callStatusText}>{callStatus}</Text>
        </View>
        {/* user profile details */}
        <View style={styles.userDetailsContainer}>
          <Text style={styles.userNameText}>{nickName}</Text>
          <View style={commonStyles.marginTop_15}>
            <Avathar
              width={90}
              height={90}
              backgroundColor={userProfile.colorCode}
              data={nickName}
              profileImage={userProfile.image}
            />
          </View>
        </View>
      </View>
      {/* call action buttons (Accept & Reject) */}
      <GestureHandlerRootView style={styles.actionButtonWrapper}>
        <RectButton
          onPress={declineCall}
          style={[styles.actionButton, styles.redButton]}>
          <Text style={styles.actionButtonText}>Reject</Text>
        </RectButton>
        <RectButton
          onPress={acceptCall}
          style={[styles.actionButton, styles.greenButton]}>
          <Text style={styles.actionButtonText}>Accept</Text>
        </RectButton>
      </GestureHandlerRootView>
    </ImageBackground>
  );
};

export default IncomingCall;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gray',
    justifyContent: 'space-between',
  },
  callStatusWrapper: {
    marginTop: 30,
    alignItems: 'center',
  },
  callStatusText: {
    fontSize: 14,
    color: '#DEDEDE',
  },
  userDetailsContainer: {
    marginTop: 14,
    alignItems: 'center',
  },
  userNameText: {
    fontSize: 18,
    color: ApplicationColors.white,
  },
  avathar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: '#9D9D9D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonWrapper: {
    marginBottom: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    width: 100,
    height: 50,
    backgroundColor: 'salmon',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  greenButton: {
    backgroundColor: '#4DDB64',
  },
  redButton: {
    backgroundColor: '#FB2B48',
  },
  actionButtonText: {
    color: ApplicationColors.white,
  },
});
