import { ScrollView } from 'native-base';
import React from 'react';
import { Animated, ImageBackground, Pressable as RNPressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile } from '../../Helper';
import { CALL_STATUS_CONNECTING, CALL_STATUS_DISCONNECTED, CALL_STATUS_RECONNECT } from '../../Helper/Calls/Constant';
import { endCall } from '../../Helper/Calls/Utility';
import { formatUserIdToJid } from '../../Helper/Chat/ChatHelper';
import { getUserIdFromJid } from '../../Helper/Chat/Utility';
import CallsBg from '../../assets/calls-bg.png';
import { getImageSource } from '../../common/utils';
import ApplicationColors from '../../config/appColors';
import { closeCallModal } from '../../redux/Actions/CallAction';
import BigVideoTile from '../components/BigVideoTile';
import CallControlButtons from '../components/CallControlButtons';
import CloseCallModalButton from '../components/CloseCallModalButton';
import GridLayout from '../components/GridLayout';
import SmallVideoTile from '../components/SmallVideoTile';
import Timer from '../components/Timer';
import IconButton from '../../common/IconButton';
import { LayoutIcon, MenuIcon } from '../../common/Icons';
import Pressable from '../../common/Pressable';

/**
 * @typedef {'grid'|'tile'} LayoutType
 */

/**
 * @type {LayoutType}
 */
const initialLayout = 'tile';

let hideControlsTimeout,
   hideControlsTimeoutMilliSeconds = 6000,
   controlsAnimationDuration = 400;

const OnGoingCall = () => {
   const localUserJid = useSelector(state => state.auth.currentUserJID);
   const { largeVideoUser = {}, connectionState: callConnectionState = {} } =
      useSelector(state => state.callData) || {};
   const { data: showConfrenceData = {}, data: { remoteStream = [] } = {} } =
      useSelector(state => state.showConfrenceData) || {};
   const vCardData = useSelector(state => state.profile?.profileDetails);
   const rosterData = useSelector(state => state.rosterData.data);

   const showControlsRef = React.useRef(true);
   const topViewControlsHeightRef = React.useRef(0);
   const bottomControlsViewHeightRef = React.useRef(0);

   // animated value states for toggling the controls and timer
   const controlsOpacity = React.useRef(new Animated.Value(1)).current;
   const controlsOffsetTop = React.useRef(new Animated.Value(0)).current;
   const topPlaceHolderViewHeight = React.useRef(new Animated.Value(0)).current;
   const controlsOffsetBottom = React.useRef(new Animated.Value(0)).current;

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
      setLayout(val => (val === 'tile' ? 'grid' : 'tile'));
   };

   const menuItems = React.useMemo(
      () => [
         {
            label: `Click ${layout === 'tile' ? 'grid' : 'tile'} view`,
            icon: <LayoutIcon width={12} height={12} />,
            formatter: toggleLayout,
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
      const _placeholderHeight = (Math.abs(toOffset - 100) * topViewControlsHeightRef.current) / 100;
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
         Animated.timing(topPlaceHolderViewHeight, {
            toValue: _placeholderHeight,
            duration: controlsAnimationDuration,
            useNativeDriver: false,
         }),
      ]).start();
   };

   const handleClosePress = () => {
      // dispatch(closeCallModal());
   };

   const handleHangUp = async e => {
      if(callStatus.toLowerCase() !== CALL_STATUS_DISCONNECTED) {
         await endCall();
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
            return <BigVideoTile userId={getUserIdFromJid(largeVideoUserJid)} />;
         } else {
            const largeVideoUserJid =
               largeVideoUser?.userJid || remoteStream.find(u => u.fromJid !== localUserJid)?.fromJid || '';
            /** const largeVideoUserStream = remoteStream.find(u => u.fromJid === largeVideoUserJid); */
            return <BigVideoTile userId={getUserIdFromJid(largeVideoUserJid)} />;
         }
      }
   };

   const renderSmallVideoTile = () => {
      // not rendering the small video tile for 'connecting' call status
      if (layout === 'tile' && callStatus.toLowerCase() !== CALL_STATUS_CONNECTING) {
         const smallVideoUsers = remoteStream.filter(u => u.fromJid !== largeVideoUser?.userJid) || [];
         return (
            <ScrollView
               horizontal
               showsHorizontalScrollIndicator={false}
               contentContainerStyle={styles.smallVideoTileContainer}>
               {smallVideoUsers.map(_user => (
                  <SmallVideoTile key={_user.fromJid} user={_user} isLocalUser={_user.fromJid === localUserJid} />
               ))}
            </ScrollView>
         );
      }
   };

   const renderGridLayout = () => {
      if (layout === 'grid') {
         return (
            <GridLayout
               remoteStreams={remoteStream}
               localUserJid={localUserJid}
               onPressAnywhere={toggleControls}
               offsetTop={topViewControlsHeightRef.current || 0}
            />
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
      Animated.timing(topPlaceHolderViewHeight, {
         toValue: height,
         duration: 200,
         useNativeDriver: false,
      }).start();
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
                  <IconButton onPress={toggleMenuPopup}>
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
            {/* Place holder View to fill up the height of the above View because it is an obsolute positioned view */}
            <Animated.View
               style={{
                  height: topPlaceHolderViewHeight,
               }}
            />

            {/* large user profile details */}
            <View style={styles.userDetailsContainer}>{renderLargeVideoTile()}</View>
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
                  // handleAudioMute={handleAudioMute}
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
   topControlsWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
   },
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
      marginRight: 10,
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
