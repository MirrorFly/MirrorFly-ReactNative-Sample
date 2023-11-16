import React from 'react';
import useRosterData from '../../hooks/useRosterData';
import { StyleSheet, View } from 'react-native';
import PulseAnimatedView from './PulseAnimatedView';
import Avathar from '../../common/Avathar';

const BigVideoTile = ({ userId }) => {
   const userProfile = useRosterData(userId);
   const nickName = userProfile.nickName || userId || '';

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
};

export default BigVideoTile;

const styles = StyleSheet.create({
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
});
