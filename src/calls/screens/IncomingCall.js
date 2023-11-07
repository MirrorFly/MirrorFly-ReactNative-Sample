import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { getImageSource } from '../../common/utils';
import CallsBg from '../../assets/calls-bg.png';
import useRosterData from '../../hooks/useRosterData';
import CloseCallModalButton from '../components/CloseCallModalButton';
import commonStyles from '../../common/commonStyles';
import ApplicationColors from '../../config/appColors';
import Avathar from '../../common/Avathar';
import { RectButton } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import { closeCallModal } from '../../redux/Actions/CallAction';
import InCallManager from 'react-native-incall-manager';

const IncomingCall = ({ userId }) => {
  const userProfile = useRosterData(userId);
  const nickName = userProfile.nickName || userProfile.userId;
  const callStatus = 'Incoming audio call';

  const dispatch = useDispatch();

  React.useEffect(() => {
    InCallManager.startRingtone();
    return () => {
      InCallManager.stopRingtone();
    };
  }, []);

  const handleClosePress = () => {
    dispatch(closeCallModal());
  };

  const handleRejectCall = () => {};

  const handleAcceptCall = () => {};

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
      <View style={styles.actionButtonWrapper}>
        <RectButton
          onPress={handleRejectCall}
          style={[styles.actionButton, styles.redButton]}>
          <Text style={styles.actionButtonText}>Reject</Text>
        </RectButton>
        <RectButton
          onPress={handleAcceptCall}
          style={[styles.actionButton, styles.greenButton]}>
          <Text style={styles.actionButtonText}>Accept</Text>
        </RectButton>
      </View>
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
