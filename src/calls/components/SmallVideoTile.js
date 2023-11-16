import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Avathar from '../../common/Avathar';
import useRosterData from '../../hooks/useRosterData';
import { getUserIdFromJid } from '../../Helper/Chat/Utility';
import ApplicationColors from '../../config/appColors';

const SmallVideoTile = ({ user, isLocalUser }) => {
   const userId = getUserIdFromJid(user.fromJid);
   const userProfile = useRosterData(userId);
   const nickName = userProfile.nickName || userId || '';

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
            <Text style={styles.smallVideoUserName}>{isLocalUser ? 'You' : nickName}</Text>
         </View>
      </View>
   );
};

export default SmallVideoTile;

const styles = StyleSheet.create({
   smallVideoWrapper: {
      width: 110,
      height: 140,
      backgroundColor: '#1C2535',
      borderRadius: 17,
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
});
