import React from 'react';
import { Animated, ImageBackground, Pressable as RNPressable, StyleSheet, Text, View } from 'react-native';
import RNInCallManager from 'react-native-incall-manager';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile } from '../../Helper';
import { CALL_STATUS_CONNECTING, CALL_STATUS_DISCONNECTED, CALL_STATUS_RECONNECT } from '../../Helper/Calls/Constant';
import { endOnGoingCall } from '../../Helper/Calls/Utility';
import { formatUserIdToJid } from '../../Helper/Chat/ChatHelper';
import { getUserIdFromJid } from '../../Helper/Chat/Utility';
import CallsBg from '../../assets/calls-bg.png';
import IconButton from '../../common/IconButton';
import { LayoutIcon, MenuIcon } from '../../common/Icons';
import Pressable from '../../common/Pressable';
import commonStyles from '../../common/commonStyles';
import { getImageSource } from '../../common/utils';
import ApplicationColors from '../../config/appColors';
import BigVideoTile from '../components/BigVideoTile';
import CallControlButtons from '../components/CallControlButtons';
import CloseCallModalButton from '../components/CloseCallModalButton';
import GridLayout from '../components/GridLayout';
import SmallVideoTile from '../components/SmallVideoTile';
import Timer from '../components/Timer';
import { closeCallModal } from '../../redux/Actions/CallAction';
import { Platform } from 'react-native';

/**
 * @typedef {'grid'|'tile'} LayoutType
 */

/**
 * @type {LayoutType}
 */
const initialLayout = 'tile';

let hideControlsTimeout,
   hideControlsTimeoutMilliSeconds = 6000,
   controlsAnimationDuration = 400,
   layoutAnimationDuration = 200;

const OnGoingCall = () => {
   const localUserJid = useSelector(state => state.auth.currentUserJID);
   const { largeVideoUser: largeVideoUserData = {}, connectionState: callConnectionState = {} } =
      useSelector(state => state.callData) || {};
   const { data: showConfrenceData = {}, data: { remoteStream = [] } = {} } =
      useSelector(state => state.showConfrenceData) || {};
   const remoteAudioMuted = showConfrenceData?.remoteAudioMuted || [];
   const vCardData = useSelector(state => state.profile?.profileDetails);
   const rosterData = useSelector(state => state.rosterData.data);

   const showControlsRef = React.useRef(true);
   const topViewControlsHeightRef = React.useRef(0);
   const bottomControlsViewHeightRef = React.useRef(0);

   // animated value variables for toggling the controls and timer
   const controlsOpacity = React.useRef(new Animated.Value(1)).current;
   const controlsOffsetTop = React.useRef(new Animated.Value(0)).current;
   const controlsOffsetBottom = React.useRef(new Animated.Value(0)).current;
   // animated value variables for initial render of the user views
   const layoutOpacity = React.useRef(new Animated.Value(0)).current;

   const dispatch = useDispatch();

   /**
    * @type {[
    *    layout: LayoutType,
    *    setLayout: (layout: LayoutType) => void
    * ]}
    */
   const [layout, setLayout] = React.useState(initialLayout);
   const [showMenuPopup, setShowMenuPopup] = React.useState(false);

   React.useEffect(() => {
      animateLayout(1);
      if (layout === 'grid') {
         hideControlsTimeout = setTimeout(() => {
            animateControls(0, 100);
         }, hideControlsTimeoutMilliSeconds);
      } else {
         clearTimeout(hideControlsTimeout);
         animateControls(1, 0);
      }
      return () => {
         clearTimeout(hideControlsTimeout);
      };
   }, [layout]);

   const toggleLayout = () => {
      animateLayout(0);
      setTimeout(() => setLayout(val => (val === 'tile' ? 'grid' : 'tile')), layoutAnimationDuration);
   };

   const menuItems = React.useMemo(
      () => [
         {
            label: `${layout === 'tile' ? 'Grid' : 'Tile'} view`,
            icon: <LayoutIcon width={12} height={12} />,
            formatter: toggleLayout,
         },
      ],
      [layout],
   );

   const largeVideoUser = React.useMemo(() => {
      if (largeVideoUserData?.userJid) {
         // largeVideoUserData does not have the fromJid property, so adding it
         return {
            ...largeVideoUserData,
            fromJid: largeVideoUserData?.userJid,
         };
      } else {
         const firstRemoteUser = remoteStream.find(u => u.fromJid !== localUserJid) || {};
         // firstRemoteUser does not have the userJid property, so adding it
         return {
            ...firstRemoteUser,
            userJid: firstRemoteUser?.fromJid || '',
         };
      }
   }, [largeVideoUserData, remoteStream]);

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
   }, [remoteStream, rosterData]);

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

   let callStatus = getCallStatus() || '';

   const animateControls = (toOpacity, toOffset) => {
      showControlsRef.current = Boolean(toOpacity);
      const _offsetTop = ((toOffset * topViewControlsHeightRef.current) / 100) * -1;
      const _offsetBottom = (toOffset * bottomControlsViewHeightRef.current) / 100;
      Animated.parallel([
         Animated.timing(controlsOpacity, {
            toValue: toOpacity,
            duration: controlsAnimationDuration,
            useNativeDriver: true,
         }),
         Animated.timing(controlsOffsetTop, {
            toValue: _offsetTop,
            duration: controlsAnimationDuration,
            useNativeDriver: true,
         }),
         Animated.timing(controlsOffsetBottom, {
            toValue: _offsetBottom,
            duration: controlsAnimationDuration,
            useNativeDriver: true,
         }),
      ]).start();
   };

   const animateLayout = toValue => {
      Animated.timing(layoutOpacity, {
         toValue: toValue,
         duration: layoutAnimationDuration,
         useNativeDriver: true,
      }).start();
   };

   const handleClosePress = () => {
      if (Platform.OS === 'android') {
         dispatch(closeCallModal());
      }
   };

   const handleHangUp = async e => {
      if (callStatus.toLowerCase() !== CALL_STATUS_DISCONNECTED) {
         await endOnGoingCall();
      }
   };

   const toggleControls = () => {
      clearTimeout(hideControlsTimeout);
      if (showControlsRef.current) {
         animateControls(0, 100);
      } else {
         animateControls(1, 0);
         hideControlsTimeout = setTimeout(() => {
            animateControls(0, 100);
         }, hideControlsTimeoutMilliSeconds);
      }
   };

   const toggleMenuPopup = () => {
      setShowMenuPopup(val => !val);
   };

   const renderLargeVideoTile = () => {
      if (layout === 'tile') {
         if (callStatus.toLowerCase() === CALL_STATUS_CONNECTING) {
            // fetching the other user JID from connection state instead of 'largeVideoUser' data for 'connecting' call state
            const largeVideoUserJid = callConnectionState.to || callConnectionState.userJid;
            return (
               <BigVideoTile
                  userId={getUserIdFromJid(largeVideoUserJid)}
                  isAudioMuted={remoteAudioMuted[largeVideoUserJid] || false}
               />
            );
         } else {
            const largeVideoUserJid = largeVideoUser?.userJid || '';
            return (
               <BigVideoTile
                  userId={getUserIdFromJid(largeVideoUserJid)}
                  isAudioMuted={remoteAudioMuted[largeVideoUserJid] || false}
               />
            );
         }
      }
   };

   const renderSmallVideoTile = () => {
      // not rendering the small video tile for 'connecting' call status
      if (layout === 'tile' && callStatus.toLowerCase() !== CALL_STATUS_CONNECTING) {
         const smallVideoUsers = remoteStream.filter(u => u.fromJid !== largeVideoUser?.userJid) || [];
         return (
            <Animated.ScrollView
               style={{
                  opacity: layoutOpacity,
               }}
               horizontal
               showsHorizontalScrollIndicator={false}
               contentContainerStyle={styles.smallVideoTileContainer}>
               {smallVideoUsers.map(_user => (
                  <SmallVideoTile
                     key={_user.fromJid}
                     user={_user}
                     isLocalUser={_user.fromJid === localUserJid}
                     isAudioMuted={remoteAudioMuted[_user?.fromJid] || false}
                  />
               ))}
            </Animated.ScrollView>
         );
      }
   };

   const renderGridLayout = () => {
      if (layout === 'grid') {
         return (
            <Animated.View
               style={{
                  opacity: layoutOpacity,
                  flex: 1,
               }}>
               <GridLayout
                  remoteStreams={remoteStream}
                  localUserJid={localUserJid}
                  onPressAnywhere={toggleControls}
                  offsetTop={topViewControlsHeightRef.current || 0}
                  animatedOffsetTop={controlsOffsetTop}
                  remoteAudioMuted={remoteAudioMuted}
               />
            </Animated.View>
         );
      }
   };

   const menuPopupUI = React.useMemo(() => {
      return showMenuPopup ? (
         <RNPressable style={styles.menuPopupOverlay} onPress={toggleMenuPopup}>
            <View style={styles.menuPopupWrapper}>
               {menuItems.map(m => (
                  <Pressable
                     key={m.label}
                     contentContainerStyle={styles.menuPopupItem}
                     onPress={() => {
                        toggleMenuPopup();
                        m.formatter();
                     }}>
                     {m.icon ? <View style={styles.menuPopupItemIcon}>{m.icon}</View> : null}
                     <Text style={styles.menuPopupItemText}>{m.label}</Text>
                  </Pressable>
               ))}
            </View>
         </RNPressable>
      ) : null;
   }, [showMenuPopup, menuItems]);

   const handleTopControlsUILayout = ({ nativeEvent }) => {
      const { height } = nativeEvent.layout;
      topViewControlsHeightRef.current = height;
   };

   const handleBottomControlsUILayout = ({ nativeEvent }) => {
      const { height } = nativeEvent.layout;
      bottomControlsViewHeightRef.current = height;
   };

   return (
      <ImageBackground style={styles.container} source={getImageSource(CallsBg)}>
         {/* Menu pop up element */}
         {menuPopupUI}
         <View>
            {/* Top view to hide when toggling controls */}
            <Animated.View
               onLayout={handleTopControlsUILayout}
               style={[
                  styles.topControlsWrapper,
                  {
                     opacity: controlsOpacity,
                     transform: [{ translateY: controlsOffsetTop }],
                  },
               ]}>
               {/* down arrow to close the modal */}
               <CloseCallModalButton onPress={handleClosePress} />
               {/* Menu for layout change */}
               <View style={styles.menuIcon}>
                  <IconButton onPress={toggleMenuPopup} style={commonStyles.paddingHorizontal_16}>
                     <MenuIcon color={'#fff'} />
                  </IconButton>
               </View>
               {/* call status */}
               <View style={styles.callUsersWrapper}>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.callUsersText}>
                     {callUsersNameText}
                  </Text>
               </View>
               {/* call timer */}
               <View style={styles.callTimerWrapper}>
                  <Timer callStatus={callStatus} />
               </View>
            </Animated.View>

            {/* large user profile details */}
            <Animated.View
               style={[
                  styles.userDetailsContainer,
                  {
                     opacity: layoutOpacity,
                  },
               ]}>
               {renderLargeVideoTile()}
            </Animated.View>
         </View>

         {renderGridLayout()}

         <View>
            {renderSmallVideoTile()}
            {/* Call Control buttons (Mute & End & speaker) */}
            <Animated.View
               onLayout={handleBottomControlsUILayout}
               style={[
                  layout === 'grid' ? styles.positionAbsoluteBottomControls : null,
                  {
                     opacity: controlsOpacity,
                     transform: [{ translateY: controlsOffsetBottom }],
                  },
               ]}>
               <CallControlButtons
                  handleEndCall={handleHangUp}
                  callStatus={callStatus}
                  // handleVideoMute={handleVideoMute}
                  // videoMute={!!localVideoMuted}
                  // audioMute={true}
                  // audioControl={audioControl}
                  // videoControl={videoControl}
               />
            </Animated.View>
         </View>
      </ImageBackground>
   );
};

export default OnGoingCall;

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'space-between',
   },
   topControlsWrapper: {},
   callUsersWrapper: {
      marginTop: 15,
      alignItems: 'center',
   },
   menuIcon: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 10,
   },
   menuPopupOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
   },
   menuPopupWrapper: {
      position: 'absolute',
      top: 10,
      right: 10,
      paddingVertical: 7,
      borderRadius: 5,
      backgroundColor: ApplicationColors.white,
      elevation: 3,
      shadowColor: ApplicationColors.shadowColor,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
   },
   menuPopupItem: {
      paddingHorizontal: 15,
      paddingVertical: 7,
      flexDirection: 'row',
      alignItems: 'center',
   },
   menuPopupItemIcon: {
      marginRight: 7,
   },
   menuPopupItemText: {
      color: ApplicationColors.black,
   },
   callUsersText: {
      fontSize: 14,
      color: ApplicationColors.white,
      width: '75%',
      textAlign: 'center',
   },
   callTimerWrapper: {
      alignSelf: 'center',
      marginTop: 10,
   },
   userDetailsContainer: {
      alignItems: 'center',
   },
   smallVideoTileContainer: {
      minWidth: '100%',
      justifyContent: 'flex-end',
   },
   gridLayoutContainer: {},
   gridItemWrapper: {
      flex: 1,
   },
   positionAbsoluteBottomControls: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
   },
});
