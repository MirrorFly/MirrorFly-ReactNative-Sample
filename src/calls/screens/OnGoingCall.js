import React from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, View } from 'react-native';
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
import Timer from '../components/Timer';
import BigVideoTile from '../components/BigVideoTile';
import SmallVideoTile from '../components/SmallVideoTile';
import { ScrollView } from 'native-base';
import { getUserProfile } from '../../Helper';
import GridLayout from '../components/GridLayout';

/**
 * @typedef {'grid'|'tile'} LayoutType
 */

/**
 * @type {LayoutType}
 */
const initialLayout = 'tile';

const sampleRemoteStreamData = [
   {
      id: 1700030104346,
      fromJid: '919988776655@xmpp-uikit-qa.contus.us',
      status: 'CONNECTED',
   },
   {
      id: 1700030104344,
      fromJid: '919094237501@xmpp-uikit-qa.contus.us',
      status: 'CONNECTED',
   },
   {
      id: 17000301043666,
      fromJid: '919966558899@xmpp-uikit-qa.contus.us',
      status: 'CONNECTED',
   },
];

const OnGoingCall = () => {
   const isCallConnected = true;
   const localUserJid = useSelector(state => state.auth.currentUserJID);
   const { connectionState: callData = {}, largeVideoUser = {} } = useSelector(state => state.callData) || {};
   const { data: showConfrenceData = {}, data: { remoteStream = [] } = {} } =
      useSelector(state => state.showConfrenceData) || {};
   const vCardData = useSelector(state => state.profile?.profileDetails);

   // const userId = getUserIdFromJid(callData.userJid || callData.to);
   // const userProfile = useRosterData(userId);
   // const nickName = userProfile.nickName || userId || '';

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

   const callUsersNameText = React.useMemo(() => {
      let usersText = 'You';
      const _remoteUsers = remoteStream.filter(u => u.fromJid !== localUserJid);
      _remoteUsers.forEach((_user, i) => {
         const _userProfile = getUserProfile(_user.fromJid);
         const _userNickName = _userProfile.nickName;
         if (i + 1 === _remoteUsers.length) {
            usersText = `${usersText} and ${_userNickName}`;
         } else {
            usersText = `${usersText}, ${_userNickName}`;
         }
      });
      return usersText;
   }, [remoteStream]);

   const handleClosePress = () => {
      dispatch(closeCallModal());
   };

   const handleHangUp = async e => {
      await endCall();
   };

   const endCall = async () => {
      disconnectCallConnection([], CALL_STATUS_DISCONNECTED, () => {
         Store.dispatch(resetCallStateData());
      }); //hangUp calls
   };

   const renderLargeVideoTile = () => {
      if (layout === 'tile') {
         const largeVideoUserJid =
            largeVideoUser?.userJid || remoteStream.find(u => u.fromJid !== localUserJid)?.fromJid || '';
         const largeVideoUserStream = remoteStream.find(u => u.fromJid === largeVideoUserJid);
         return <BigVideoTile userId={getUserIdFromJid(largeVideoUserJid)} stream={largeVideoUserStream} />;
      }
   };

   const renderSmallVideoTile = () => {
      if (layout === 'tile') {
         const smallVideoUsers = remoteStream.filter(u => u.fromJid !== largeVideoUser?.userJid) || [];
         return (
            <ScrollView
               horizontal
               showsHorizontalScrollIndicator={false}
               contentContainerStyle={styles.smallVideoTileContainer}>
               {smallVideoUsers.map(_user => (
                  <SmallVideoTile user={_user} isLocalUser={_user.fromJid === localUserJid} />
               ))}
            </ScrollView>
         );
      }
   };

   const renderGridLayout = () => {
      if (layout === 'grid') {
         return remoteStream.map(_user => {
            return <GridLayout remoteStreams={remoteStream} localUserJid={localUserJid} />;
         });
         // return (
         //    <View style={styles.gridLayoutContainer}>
         //       {/* Loop through the users and render the layout */}
         //       <View style={styles.gridItemWrapper}>
         //          <View style={styles.smallVideoVoiceLevelWrapper}>
         //             <View style={styles.smallVideoVoiceLevelIndicator} />
         //             <View style={styles.smallVideoVoiceLevelIndicator} />
         //             <View style={styles.smallVideoVoiceLevelIndicator} />
         //          </View>
         //          <View style={styles.smallVideoUserAvathar}>
         //             <Avathar
         //                width={50}
         //                height={50}
         //                backgroundColor={userProfile.colorCode}
         //                data={nickName}
         //                profileImage={userProfile.image}
         //             />
         //          </View>
         //          <View>
         //             <Text style={styles.smallVideoUserName}>You</Text>
         //          </View>
         //       </View>
         //    </View>
         // );
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
                  <Text style={styles.callUsersText}>{callUsersNameText}</Text>
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
   smallVideoTileContainer: {
      minWidth: '100%',
      justifyContent: 'flex-end',
   },
   gridLayoutContainer: {},
   gridItemWrapper: {
      flex: 1,
   },
});
