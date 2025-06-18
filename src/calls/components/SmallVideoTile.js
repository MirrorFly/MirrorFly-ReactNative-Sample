import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CALL_STATUS_RECONNECT } from '../../Helper/Calls/Constant';
import Avathar from '../../common/Avathar';
import { AudioMuteIcon } from '../../common/Icons';
import ApplicationColors from '../../config/appColors';
import { getUserIdFromJid } from '../../helpers/chatHelpers';
import { useRoasterData } from '../../redux/reduxHook';
import commonStyles from '../../styles/commonStyles';
import VideoComponent from './VideoComponent';
import PropTypes from 'prop-types';

const SmallVideoTile = ({
   user,
   isLocalUser,
   isAudioMuted,
   isVideoMuted,
   stream,
   isFrontCameraEnabled,
   callStatus = '',
}) => {
   const userId = getUserIdFromJid(user.fromJid);
   const userProfile = useRoasterData(userId) || {};
   const nickName = userProfile.nickName || userId || '';
   let reconnectStatus = callStatus && callStatus?.toLowerCase() === CALL_STATUS_RECONNECT && !isLocalUser;

   const renderVideoComponent = React.useMemo(() => {
      return <VideoComponent stream={stream} isFrontCameraEnabled={isFrontCameraEnabled} zIndex={1} />;
   }, [stream, isFrontCameraEnabled]);

   return (
      <View style={styles.smallVideoWrapper}>
         {!isVideoMuted && stream?.video && !reconnectStatus && renderVideoComponent}
         <View
            style={[
               commonStyles.p_10,
               {
                  flex: 1,
                  justifyContent: 'space-between',
               },
            ]}>
            {isAudioMuted ? (
               <View style={styles.smallVideoUserMuteIcon}>
                  <AudioMuteIcon width={10} height={16} color={'#fff'} />
               </View>
            ) : (
               <View style={styles.smallVideoVoiceLevelWrapper}>
                  <View style={styles.smallVideoVoiceLevelIndicator} />
                  <View style={styles.smallVideoVoiceLevelIndicator} />
                  <View style={styles.smallVideoVoiceLevelIndicator} />
               </View>
            )}
            {(isVideoMuted || reconnectStatus || (stream && !stream?.video)) && (
               <View style={styles.smallVideoUserAvathar}>
                  <Avathar
                     userId={userId}
                     width={50}
                     height={50}
                     backgroundColor={userProfile.colorCode}
                     data={nickName}
                     profileImage={userProfile.image}
                  />
               </View>
            )}
            <View>
               <Text numberOfLines={1} ellipsizeMode="tail" style={styles.smallVideoUserName}>
                  {isLocalUser ? 'You' : nickName}
               </Text>
            </View>
         </View>
      </View>
   );
};

SmallVideoTile.propTypes = {
   user: PropTypes.object,
   isLocalUser: PropTypes.bool,
   isAudioMuted: PropTypes.bool,
   isVideoMuted: PropTypes.bool,
   stream: PropTypes.object,
   isFrontCameraEnabled: PropTypes.bool,
   callStatus: PropTypes.string,
};

export default SmallVideoTile;

const styles = StyleSheet.create({
   smallVideoWrapper: {
      width: 110,
      height: 160,
      overflow: 'hidden',
      backgroundColor: '#1C2535',
      borderRadius: 10,
      margin: 10,
      marginBottom: 40,
   },
   smallVideoUserMuteIcon: {
      backgroundColor: 'rgba(0,0,0,.3)',
      width: 25,
      height: 25,
      borderRadius: 15,
      alignSelf: 'flex-end',
      justifyContent: 'center',
      alignItems: 'center',
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
});
