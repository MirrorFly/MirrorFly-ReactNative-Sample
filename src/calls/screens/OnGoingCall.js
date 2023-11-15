import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { disconnectCallConnection } from '../../Helper/Calls/Call';
import { CALL_STATUS_DISCONNECTED, CALL_STATUS_RECONNECT } from '../../Helper/Calls/Constant';
import { formatUserIdToJid } from '../../Helper/Chat/ChatHelper';
import { getUserIdFromJid } from '../../Helper/Chat/Utility';
import CallsBg from '../../assets/calls-bg.png';
import Avathar from '../../common/Avathar';
import MenuContainer from '../../common/MenuContainer';
import { getImageSource } from '../../common/utils';
import ApplicationColors from '../../config/appColors';
import useRosterData from '../../hooks/useRosterData';
import { closeCallModal, resetCallStateData } from '../../redux/Actions/CallAction';
import Store from '../../redux/store';
import CallControlButtons from '../components/CallControlButtons';
import CloseCallModalButton from '../components/CloseCallModalButton';
import PulseAnimatedView from '../components/PulseAnimatedView';
import Timer from '../components/Timer';

/**
 * @typedef {'grid'|'tile'} LayoutType
 */

/**
 * @type {LayoutType}
 */
const initialLayout = 'tile';

const OnGoingCall = () => {
   const isCallConnected = true;
   const { connectionState: callData = {} } = useSelector(state => state.callData) || {};
   const { data: showConfrenceData = {}, data: { remoteStream = [] } = {} } =
      useSelector(state => state.showConfrenceData) || {};
   const vCardData = useSelector(state => state.profile?.profileDetails);

   const userId = getUserIdFromJid(callData.userJid || callData.to);
   const userProfile = useRosterData(userId || '919988776655');
   const nickName = userProfile.nickName || userId || '';

   const dispatch = useDispatch();

   /**
    * @type {[
    *    layout: LayoutType,
    *    setLayout: (layout: LayoutType) => void
    * ]}
    */
   const [layout, setLayout] = React.useState(initialLayout);

   const menuItems = React.useMemo(
      () => [
         {
            label: `Click ${layout === 'tile' ? 'grid' : 'tile'} view`,
            formatter: () => {
               setLayout(val => (val === 'tile' ? 'grid' : 'tile'));
            },
         },
      ],
      [layout],
   );

   const handleClosePress = () => {
      dispatch(closeCallModal());
   };

   const handleHangUp = async e => {
      await endCall();
   };

   const endCall = async () => {
      disconnectCallConnection(); //hangUp calls
      Store.dispatch(resetCallStateData());
   };

   const renderLargeVideoTile = () => {
      if (layout === 'tile') {
         // const largeVideoUserData = remoteStream.find
         return (
            <View style={styles.avatharWrapper}>
               {/* Pulse animation view here */}
               <PulseAnimatedView animateToValue={1.3} baseStyle={styles.avatharPulseAnimatedView} />
               <Avathar
                  width={90}
                  height={90}
                  backgroundColor={userProfile.colorCode}
                  data={nickName}
                  profileImage={userProfile.image}
               />
            </View>
         );
      }
   };

   const renderSmallVideoTile = () => {
      if (layout === 'tile') {
         return (
            <View style={styles.smallVideoWrapper}>
               <View style={styles.smallVideoVoiceLevelWrapper}>
                  <View style={styles.smallVideoVoiceLevelIndicator} />
                  <View style={styles.smallVideoVoiceLevelIndicator} />
                  <View style={styles.smallVideoVoiceLevelIndicator} />
               </View>
               <View style={styles.smallVideoUserAvathar}>
                  <Avathar
                     width={50}
                     height={50}
                     backgroundColor={userProfile.colorCode}
                     data={nickName}
                     profileImage={userProfile.image}
                  />
               </View>
               <View>
                  <Text style={styles.smallVideoUserName}>You</Text>
               </View>
            </View>
         );
      }
   };

   const renderGridLayout = () => {
      if (layout === 'grid') {
         return (
            <View style={styles.gridLayoutContainer}>
               {/* Loop through the users and render the layout */}
               <View style={styles.gridItemWrapper}>
                  <View style={styles.smallVideoVoiceLevelWrapper}>
                     <View style={styles.smallVideoVoiceLevelIndicator} />
                     <View style={styles.smallVideoVoiceLevelIndicator} />
                     <View style={styles.smallVideoVoiceLevelIndicator} />
                  </View>
                  <View style={styles.smallVideoUserAvathar}>
                     <Avathar
                        width={50}
                        height={50}
                        backgroundColor={userProfile.colorCode}
                        data={nickName}
                        profileImage={userProfile.image}
                     />
                  </View>
                  <View>
                     <Text style={styles.smallVideoUserName}>You</Text>
                  </View>
               </View>
            </View>
         );
      }
   };

   //  const getCallStatus = userid => {
   //     const data = showConfrenceData || {};
   //     if (data.callStatusText === CALL_STATUS_DISCONNECTED || data.callStatusText === CALL_STATUS_RECONNECT)
   //        return data.callStatusText;
   //     let vcardData = getLocalUserDetails();
   //     let currentUser = vcardData.fromUser;
   //     const remoteStream = this.props.remoteStream;
   //     if (!userid) {
   //        userid = currentUser + '@' + REACT_APP_XMPP_SOCKET_HOST;
   //     }
   //     const user = remoteStream.find(item => item.fromJid === userid);
   //     return user && user.status;
   //  };

   const getCallStatus = userid => {
      const data = showConfrenceData || {};
      if (data.callStatusText === CALL_STATUS_DISCONNECTED || data.callStatusText === CALL_STATUS_RECONNECT)
         return data.callStatusText;
      let currentUser = vCardData.fromUser;
      if (!userid) {
         userid = formatUserIdToJid(currentUser);
      }
      const user = remoteStream.find(item => item.fromJid === userid);
      return user?.status;
   };

   let callStatus = getCallStatus();

   return (
      <ImageBackground style={styles.container} source={getImageSource(CallsBg)}>
         <View>
            {/* down arrow to close the modal */}
            <CloseCallModalButton onPress={handleClosePress} />
            {/* Menu for layout change */}
            <View style={styles.menuIcon}>
               <MenuContainer menuItems={menuItems} color={ApplicationColors.white} />
            </View>
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
               {/* {callStatus && callStatus.toLowerCase() == CALL_STATUS_RECONNECT &&} */}
               <Timer callStatus={callStatus} />
               {/* <Text style={styles.callTimeText}>{callTime}</Text> */}
               {renderLargeVideoTile()}
            </View>
         </View>
         {renderGridLayout()}
         <View /* style={layout === 'grid' && styles.} */>
            {/* Small video tile */}
            {renderSmallVideoTile()}
            {/* Call Control buttons (Mute & End & speaker) */}
            <CallControlButtons
               handleEndCall={handleHangUp}
               // handleAudioMute={handleAudioMute}
               // handleVideoMute={handleVideoMute}
               // videoMute={!!localVideoMuted}
               // audioMute={true}
               // audioControl={audioControl}
               // videoControl={videoControl}
            />
         </View>
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
   menuIcon: {
      position: 'absolute',
      top: 20,
      right: 10,
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
   smallVideoWrapper: {
      width: 110,
      height: 140,
      backgroundColor: '#1C2535',
      borderRadius: 17,
      alignSelf: 'flex-end',
      margin: 10,
      marginBottom: 40,
      justifyContent: 'space-between',
      padding: 10,
   },
   smallVideoVoiceLevelWrapper: {
      backgroundColor: '#3ABF87',
      width: 25,
      height: 25,
      borderRadius: 15,
      alignSelf: 'flex-end',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
   },
   smallVideoVoiceLevelIndicator: {
      width: 4,
      height: 4,
      borderRadius: 3,
      marginHorizontal: 1,
      backgroundColor: ApplicationColors.white,
   },
   smallVideoUserAvathar: {
      alignSelf: 'center',
   },
   smallVideoUserName: {
      color: ApplicationColors.white,
   },
   gridLayoutContainer: {},
   gridItemWrapper: {
      flex: 1,
   },
});
