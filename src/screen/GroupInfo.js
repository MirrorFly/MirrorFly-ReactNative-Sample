import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import GrpCollapsibleToolbar from '../components/GrpCollapsibleToolbar';
import useRosterData from '../hooks/useRosterData';
import SDK from '../SDK/SDK';
import Modal, { ModalCenteredContent } from '../common/Modal';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';

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
   const currentUserJid = useSelector(state => state.auth?.currentUserJID);
   const [participantsList, setParticipantsList] = React.useState([]);

   const getGroupParticipants = async (iq = false, time = 0) => {
      toggleModel();
      setTimeout(async () => {
         const grpList = await SDK.getGroupParticipants(chatUser, iq);
         setParticipantsList(
            grpList.participants?.sort((a, b) =>
               a.userJid === currentUserJid ? 1 : b.userJid === currentUserJid ? -1 : 0,
            ) || [],
         );
         toggleModel();
      }, time);
   };

   const handleBackBtn = () => {
      naviagation.goBack();
      return true;
   };

   useFocusEffect(
      React.useCallback(() => {
         getGroupParticipants();
      }, []),
   );

   const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);

   React.useEffect(() => {
      return () => {
         backHandler.remove();
      };
   }, []);

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
               participants={participantsList}
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
