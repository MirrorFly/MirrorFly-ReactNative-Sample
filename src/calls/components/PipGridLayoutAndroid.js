import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getUsernameGraphemes } from '../../Helper';
import { CALL_STATUS_RECONNECT } from '../../Helper/Calls/Constant';
import { getUserIdFromJid } from '../../Helper/Chat/Utility';
import commonStyles from '../../common/commonStyles';
import ApplicationColors from '../../config/appColors';
import { useNetworkStatus } from '../../hooks';
import useFetchImage from '../../hooks/useFetchImage';
import useRosterData from '../../hooks/useRosterData';
import VideoComponent from './VideoComponent';

const PIPGridItem = ({
   item,
   isLocalUser,
   isFullSize,
   isAudioMuted,
   userStatus,
   stream,
   isVideoMuted,
   isFrontCameraEnable,
   callStatus,
}) => {
   const userId = getUserIdFromJid(item?.fromJid || '');
   const userProfile = useRosterData(userId);
   const nickName = userProfile.nickName || userId || '';

   const [isImageLoadError, setIsImageLoadError] = React.useState(false);
   const isNetworkConnected = useNetworkStatus();
   const { imageUrl, authToken } = useFetchImage(userProfile.image);

   const isUserReconnecting = React.useMemo(() => {
      return userStatus?.toLowerCase?.() === CALL_STATUS_RECONNECT;
   }, [userStatus]);

   React.useEffect(() => {
      if (isNetworkConnected && isImageLoadError) {
         setIsImageLoadError(false);
      }
   }, [isNetworkConnected]);

   const handleImageError = () => {
      setIsImageLoadError(true);
   };

   const renderReconnectingOverlay = () => {
      return isUserReconnecting ? (
         <View style={styles.reconnectingOverlay}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.reconnectingOverlayText}>
               {' '}
               Reconnecting{' '}
            </Text>
         </View>
      ) : null;
   };

   return (
      <View
         style={{
            width: isFullSize ? '100%' : '50%',
            backgroundColor: userProfile.colorCode,
            flex: 1,
         }}>
         {!isVideoMuted && stream && stream?.video && callStatus.toLowerCase() !== CALL_STATUS_RECONNECT && (
            <VideoComponent stream={stream} isFrontCameraEnabled={isFrontCameraEnable} zIndex={0} />
         )}
         <View style={{ padding: 5, justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
            {/* Speaking indicator */}
            {isAudioMuted ? (
               <View style={styles.emptyVoiceLevelIndicator} />
            ) : isUserReconnecting ? null : (
               <View style={styles.gridItemVoiceLevelWrapper}>
                  <View style={styles.gridItemVoiceLevelIndicator} />
                  <View style={styles.gridItemVoiceLevelIndicator} />
                  <View style={styles.gridItemVoiceLevelIndicator} />
               </View>
            )}
            {/* if image loading error then showing the initials */}
            {(isVideoMuted || callStatus.toLowerCase() === CALL_STATUS_RECONNECT || (stream && !stream.video)) && (
               <View style={styles.avatharWrapper}>
                  {userProfile.image && !isImageLoadError && imageUrl ? (
                     <Image
                        style={styles.profileImage}
                        source={{
                           uri: imageUrl,
                           method: 'GET',
                           cache: 'force-cache',
                           headers: {
                              Authorization: authToken,
                           },
                        }}
                        onError={handleImageError}
                        resizeMode="cover"
                     />
                  ) : (
                     <View style={commonStyles.marginTop_5}>
                        <Text style={styles.userNameText}>{getUsernameGraphemes(nickName)}</Text>
                     </View>
                  )}
               </View>
            )}
            {/* user name or 'You' */}
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.gridItemUserName}>
               {isLocalUser ? 'You' : nickName}
            </Text>
            {/* Reconnecting overlay based on user call status */}
            {renderReconnectingOverlay()}
         </View>
      </View>
   );
};

const PipGridLayoutAndroid = ({
   remoteStream,
   localUserJid,
   remoteAudioMuted,
   callStatus,
   localStream,
   remoteVideoMuted,
   isFrontCameraEnabled,
}) => {
   // Sorting the remote stream with local user at the top (first)
   const sortRemoteStreamAndCalculateColumns = () => {
      const _sortedData = [...(remoteStream || [])];
      const localStreamIndex = _sortedData.findIndex(s => s.fromJid === localUserJid);
      if (localStreamIndex > -1) {
         const _localStream = _sortedData.splice(localStreamIndex, 1);
         _sortedData.unshift(..._localStream); // using spread operator while pushing bcoz the splice method will return an array of deleted elements
      }
      const _calculatedColumns = _sortedData.length <= 2 ? 1 : 2;
      return [_calculatedColumns, _sortedData];
   };

   const [calculatedColumnsForPipGrid, sortedRemoteStreamsForPip] = sortRemoteStreamAndCalculateColumns();

   const renderPipLayoutItem = item => {
      const isAudioMuted = remoteAudioMuted?.[item?.fromJid] || false;
      const isVideoMuted = remoteVideoMuted?.[item?.fromJid] || false;
      const isFrontCameraEnable = item?.fromJid === localUserJid ? isFrontCameraEnabled : false;

      return (
         <PIPGridItem
            key={item?.fromJid}
            item={item}
            isLocalUser={item?.fromJid === localUserJid}
            isFullSize={calculatedColumnsForPipGrid === 1}
            isAudioMuted={isAudioMuted}
            userStatus={item?.status}
            stream={item.fromJid === localUserJid ? localStream : item.stream}
            isVideoMuted={isVideoMuted}
            isFrontCameraEnable={isFrontCameraEnable}
            callStatus={callStatus}
         />
      );
   };

   return <View style={styles.pipContainer}>{sortedRemoteStreamsForPip.map(item => renderPipLayoutItem(item))}</View>;
};

export default PipGridLayoutAndroid;

const styles = StyleSheet.create({
   pipContainer: {
      flex: 1,
      width: '100%',
      height: '100%',
      position: 'relative',
   },
   gridItemVoiceLevelWrapper: {
      backgroundColor: '#3ABF87',
      width: 25,
      height: 25,
      borderRadius: 15,
      alignSelf: 'flex-end',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
   },
   gridItemVoiceLevelIndicator: {
      width: 4,
      height: 4,
      borderRadius: 3,
      marginHorizontal: 1,
      backgroundColor: ApplicationColors.white,
   },
   emptyVoiceLevelIndicator: {
      width: 25,
      height: 25,
   },
   gridItemUserName: {
      color: ApplicationColors.white,
      fontSize: 12,
      alignSelf: 'flex-start',
   },
   avatharWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
   },
   profileImage: {
      width: '100%',
      height: '100%',
      zIndex: -10,
   },
   userNameText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 18,
      textTransform: 'uppercase',
   },
   reconnectingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
   },
   reconnectingOverlayText: {
      textAlign: 'center',
      width: '100%',
      color: 'white',
      fontSize: 12,
   },
});
