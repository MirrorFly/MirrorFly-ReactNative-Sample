import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import GrpCollapsibleToolbar from '../components/GrpCollapsibleToolbar';
import useRosterData from '../hooks/useRosterData';
import SDK from '../SDK/SDK';

const GroupInfo = () => {
   const {
      params: { chatUser = '' },
   } = useRoute();
   const naviagation = useNavigation();
   const chatUserId = getUserIdFromJid(chatUser);
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

   const getGrpParticipants = async () => {
      const grpList = await SDK.getGroupParticipants(chatUser);
      setParticipantsList(
         grpList.participants?.sort((a, b) =>
            a.userJid === currentUserJid ? 1 : b.userJid === currentUserJid ? -1 : 0,
         ) || [],
      );
   };

   const handleBackBtn = () => {
      naviagation.goBack();
      return true;
   };

   useFocusEffect(
      React.useCallback(() => {
         getGrpParticipants();
      }, []),
   );

   const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);

   React.useEffect(() => {
      return () => {
         backHandler.remove();
      };
   }, []);

   return (
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
            getGrpParticipants={getGrpParticipants}
         />
      </View>
   );
};
export default GroupInfo;
const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
});
