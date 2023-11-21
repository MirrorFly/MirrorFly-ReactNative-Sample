import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import { batch, useDispatch, useSelector } from 'react-redux';
import { showCheckYourInternetToast } from '../../Helper';
import { makeCalls } from '../../Helper/Calls/Utility';
import CallsBg from '../../assets/calls-bg.png';
import Avathar from '../../common/Avathar';
import { CloseIcon, PhoneIcon } from '../../common/Icons';
import commonStyles from '../../common/commonStyles';
import { getImageSource } from '../../common/utils';
import ApplicationColors from '../../config/appColors';
import { useNetworkStatus } from '../../hooks';
import useRosterData from '../../hooks/useRosterData';
import { resetCallStateData } from '../../redux/Actions/CallAction';
import { resetCallAgainData } from '../../redux/Actions/CallAgainAction';
import CloseCallModalButton from '../components/CloseCallModalButton';

const CallAgain = () => {
   const { data: { callType, userId } = {} } = useSelector(state => state.callAgainData) || {};
   const userProfile = useRosterData(userId);
   const nickName = userProfile.nickName || userProfile.userId;
   const callStatus = 'Unavailable, Try again later';

   const dispatch = useDispatch();
   const isNetworkConnected = useNetworkStatus();

   const closeScreen = () => {
      batch(() => {
         dispatch(resetCallStateData());
         dispatch(resetCallAgainData());
      });
   };

   const handleCallAgain = () => {
      if (callType && userId) {
         if (isNetworkConnected) {
            makeCalls(callType, [userId]);
         } else {
            closeScreen();
            showCheckYourInternetToast();
         }
      }
   };

   return (
      <ImageBackground style={styles.container} source={getImageSource(CallsBg)}>
         <View>
            {/* down arrow to close the modal */}
            <CloseCallModalButton onPress={closeScreen} />
            {/* call status */}
            <View style={styles.callStatusWrapper}>
               <Text style={styles.callStatusText}>{callStatus}</Text>
            </View>
            {/* user profile details */}
            <View style={styles.userDetailsContainer}>
               <Text numberOfLines={1} ellipsizeMode="tail" style={styles.userNameText}>
                  {nickName}
               </Text>
               <View style={commonStyles.marginTop_15}>
                  <Avathar
                     width={90}
                     height={90}
                     backgroundColor={userProfile.colorCode}
                     data={nickName}
                     profileImage={userProfile.image}
                  />
               </View>
            </View>
         </View>
         {/* Bottom action buttons (Cancel & Call Again) */}
         <GestureHandlerRootView style={styles.actionButtonWrapper}>
            <View style={commonStyles.alignItemsCenter}>
               <RectButton onPress={closeScreen} style={[styles.actionButton]}>
                  <CloseIcon />
               </RectButton>
               <Text style={styles.actionButtonText}>Cancel</Text>
            </View>
            <View style={commonStyles.alignItemsCenter}>
               <RectButton onPress={handleCallAgain} style={[styles.actionButton, styles.greenButton]}>
                  <PhoneIcon width={18} height={18} color={ApplicationColors.white} />
               </RectButton>
               <Text style={styles.actionButtonText}>Call Again</Text>
            </View>
         </GestureHandlerRootView>
      </ImageBackground>
   );
};

export default CallAgain;

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: 'gray',
      justifyContent: 'space-between',
   },
   callStatusWrapper: {
      marginTop: 30,
      alignItems: 'center',
   },
   callStatusText: {
      fontSize: 14,
      fontWeight: '300',
      color: '#DEDEDE',
   },
   userDetailsContainer: {
      marginTop: 14,
      alignItems: 'center',
   },
   userNameText: {
      fontSize: 18,
      color: ApplicationColors.white,
      width: '80%',
      textAlign: 'center',
   },
   avathar: {
      width: 90,
      height: 90,
      borderRadius: 50,
      backgroundColor: '#9D9D9D',
      justifyContent: 'center',
      alignItems: 'center',
   },
   actionButtonWrapper: {
      backgroundColor: 'rgba(0,0,0,.2)',
      paddingTop: 50,
      paddingBottom: 35,
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
   actionButton: {
      width: 60,
      height: 60,
      marginHorizontal: 50,
      backgroundColor: ApplicationColors.white,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 30,
   },
   greenButton: {
      backgroundColor: '#4DDB64',
   },
   actionButtonText: {
      marginTop: 15,
      color: ApplicationColors.white,
   },
});
