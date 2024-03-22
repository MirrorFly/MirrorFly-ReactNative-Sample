import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import Avathar from '../../common/Avathar';
import Pressable from '../../common/Pressable';
import useRosterData from '../../hooks/useRosterData';
import { openCallModal } from '../../redux/Actions/CallAction';
import PulseAnimationComponent from '../components/PulseAnimationComponent';

function PipViewIos(props = {}) {
   const { userId } = props;
   const dispatch = useDispatch();
   const userProfile = useRosterData(userId);
   const nickName = userProfile.nickName || userProfile.userId;
   const openCallModelPip = () => {
      dispatch(openCallModal());
   };

   return (
      <View style={[styles.container]}>
         <PulseAnimationComponent color="#0000008B" numPulses={3} diameter={150} speed={26} duration={1400} />
         <Pressable contentContainerStyle={{ borderRadius: 60 }} onPress={openCallModelPip}>
            <Avathar
               fontSize={40}
               width={110}
               height={110}
               backgroundColor={userProfile.colorCode}
               data={nickName}
               profileImage={userProfile.image}
               transparentBackgroundForImage={false}
            />
         </Pressable>
      </View>
   );
}

export default PipViewIos;

const styles = StyleSheet.create({
   container: {
      width: 110,
      height: 110,
      borderRadius: 60,
      position: 'absolute',
      top: 120,
      right: 20,
   },
});
