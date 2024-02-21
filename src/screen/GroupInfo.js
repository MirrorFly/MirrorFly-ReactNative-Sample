import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { fetchGroupParticipants } from '../Helper/Chat/Groups';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import Modal, { ModalCenteredContent } from '../common/Modal';
import commonStyles from '../common/commonStyles';
import GrpCollapsibleToolbar from '../components/GrpCollapsibleToolbar';
import ApplicationColors from '../config/appColors';
import useRosterData from '../hooks/useRosterData';

const GroupInfo = () => {
   const {
      params: { chatUser = '' },
   } = useRoute();
   const naviagation = useNavigation();
   const chatUserId = getUserIdFromJid(chatUser);

   const [modelOpen, setModelOpen] = React.useState(false);

   const toggleModel = () => {
      setModelOpen(val => !val);
   };

   let {
      nickName = '',
      colorCode = '',
      status = '',
      mobileNumber = '',
      email = '',
      image = '',
   } = useRosterData(chatUserId);
   // updating default values
   nickName = nickName || chatUserId || '';
   colorCode = colorCode || '';
   status = status || '';
   mobileNumber = mobileNumber || '';
   email = email || '';
   image = image || '';
   const groupParticipants = useSelector(
      state => state?.groupsMemberParticipantsListData?.groupParticipants[chatUser] || [],
   );

   const getGroupParticipants = time => {
      toggleModel();
      setTimeout(() => {
         fetchGroupParticipants(chatUser);
         toggleModel();
      }, time);
   };

   useFocusEffect(
      React.useCallback(() => {
         fetchGroupParticipants(chatUser);
      }, [chatUser]),
   );

   const handleBackBtn = React.useCallback(() => {
      naviagation.goBack();
      return true;
   }, [naviagation]);

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
      };
   }, [handleBackBtn]);

   return (
      <>
         <Modal visible={modelOpen} onRequestClose={toggleModel}>
            <ModalCenteredContent onPressOutside={toggleModel}>
               <View style={[commonStyles.bg_white, commonStyles.borderRadius_5]}>
                  <ActivityIndicator size={'large'} color={ApplicationColors.mainColor} />
               </View>
            </ModalCenteredContent>
         </Modal>
         <View style={styles.container}>
            <GrpCollapsibleToolbar
               chatUser={chatUser}
               bgColor={colorCode}
               title={nickName}
               titleColor={colorCode}
               titleStatus={status}
               mobileNo={mobileNumber || chatUserId}
               imageToken={image}
               email={email}
               handleBackBtn={handleBackBtn}
               participants={groupParticipants}
               getGroupParticipants={getGroupParticipants}
            />
         </View>
      </>
   );
};
export default GroupInfo;
const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
});
