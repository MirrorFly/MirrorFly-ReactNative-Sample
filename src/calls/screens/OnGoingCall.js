import React from 'react';
import {
  Animated,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  RectButton,
} from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { getUserIdFromJid } from '../../Helper/Chat/Utility';
import CallsBg from '../../assets/calls-bg.png';
import Avathar from '../../common/Avathar';
import { getImageSource } from '../../common/utils';
import ApplicationColors from '../../config/appColors';
import useRosterData from '../../hooks/useRosterData';
import CloseCallModalButton from '../components/CloseCallModalButton';
import PulseAnimatedView from '../components/PulseAnimatedView';

const OnGoingCall = () => {
  const isCallConnected = true;
  const { connectionState: callData = {} } =
    useSelector(state => state.callData) || {};

  const userId = getUserIdFromJid(
    callData.userJid || callData.to,
  );
  const userProfile = useRosterData(userId);
  const nickName = userProfile.nickName || userId || '';
  const callTime = '0:00';

  const handleClosePress = () => {
    // dispatch(closeCallModal());
  };

  return (
    <ImageBackground style={styles.container} source={getImageSource(CallsBg)}>
      <View>
        {/* down arrow to close the modal */}
        <CloseCallModalButton onPress={handleClosePress} />
        {/* call status */}
        <View style={styles.callUsersWrapper}>
          {isCallConnected ? (
            <Text style={styles.callUsersText}>{`You and ${nickName}`}</Text>
          ) : (
            <Text style={styles.callUsersText}>Connecting...</Text>
          )}
        </View>
        {/* user profile details and call timer */}
        <View style={styles.userDetailsContainer}>
          <Text style={styles.callTimeText}>{callTime}</Text>
          <View style={styles.avatharWrapper}>
            {/* Pulse animation view here */}
            {/* <Animated.View
              style={[
                styles.avatharPulseAnimatedView,
                { transform: [{ scale: 1 }] }, // apply scale from 1 to 1.3
              ]}
            /> */}
            <PulseAnimatedView
              animateToValue={1.3}
              baseStyle={styles.avatharPulseAnimatedView}
            />
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
      {/* call action buttons (End, Mute, Speaker & VideoConversion) */}
      <GestureHandlerRootView style={styles.actionButtonWrapper}>
        <RectButton
          // onPress={declineCall}
          style={[styles.actionButton, styles.redButton]}></RectButton>
        <RectButton
          // onPress={acceptCall}
          style={[styles.actionButton, styles.greenButton]}></RectButton>
      </GestureHandlerRootView>
    </ImageBackground>
  );
};

export default OnGoingCall;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gray',
    justifyContent: 'space-between',
  },
  callUsersWrapper: {
    marginTop: 30,
    alignItems: 'center',
  },
  callUsersText: {
    fontSize: 14,
    color: ApplicationColors.white,
  },
  userDetailsContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  callTimeText: {
    fontSize: 12,
    color: ApplicationColors.white,
  },
  avatharWrapper: {
    marginTop: 10,
    width: 90 + 27, // 90 is the width of actual avathar + 27 is the additional width of pulse animation for the scale size of 1.30 for width 90
    height: 90 + 27, // 90 is the height of actual avathar + 27 is the additional width of pulse animation for the scale size of 1.30 for height 90
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatharPulseAnimatedView: {
    position: 'absolute',
    top: 27 / 2, // additional width / 2 to make the animated view perfectly into the place
    width: 90,
    height: 90,
    borderRadius: 70,
    backgroundColor: '#9d9d9d5f',
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
