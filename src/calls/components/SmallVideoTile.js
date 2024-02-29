import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getUserIdFromJid } from '../../Helper/Chat/Utility';
import Avathar from '../../common/Avathar';
import { AudioMuteIcon } from '../../common/Icons';
import commonStyles from '../../common/commonStyles';
import ApplicationColors from '../../config/appColors';
import useRosterData from '../../hooks/useRosterData';
import VideoComponent from './VideoComponent';

const SmallVideoTile = ({ user, isLocalUser, isAudioMuted, isVideoMuted, stream, isFrontCameraEnabled }) => {
   const userId = getUserIdFromJid(user.fromJid);
   const userProfile = useRosterData(userId);
   const nickName = userProfile.nickName || userId || '';

   return (
      <View style={styles.smallVideoWrapper}>
         {!isVideoMuted && stream && stream.video && (
            <VideoComponent stream={stream} isFrontCameraEnabled={isFrontCameraEnabled} zIndex={1} />
         )}
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
            {(isVideoMuted || !stream.video) && (
               <>
                  <View style={styles.smallVideoUserAvathar}>
                     <Avathar
                        width={50}
                        height={50}
                        backgroundColor={userProfile.colorCode}
                        data={nickName}
                        profileImage={userProfile.image}
                     />
                  </View>
               </>
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
