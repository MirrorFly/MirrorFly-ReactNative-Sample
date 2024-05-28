import React from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import useRosterData from '../hooks/useRosterData';
import CollapsingToolbar from '../components/CollapsibleToolbar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import { CONVERSATION_SCREEN } from '../constant';

const UserInfo = () => {
   const {
      params: { chatUser = '' },
   } = useRoute();
   const navigation = useNavigation();
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

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => backHandler.remove();
   }, []);

   const handleBackBtn = () => {
      navigation.navigate(CONVERSATION_SCREEN);
      return true;
   };
   return (
      <View style={styles.container}>
         <CollapsingToolbar
            chatUser={chatUser}
            bgColor={colorCode}
            title={nickName}
            titleColor={colorCode}
            titleStatus={status}
            mobileNo={mobileNumber || chatUserId}
            imageToken={image}
            email={email}
            handleBackBtn={handleBackBtn}
         />
      </View>
   );
};
export default UserInfo;
const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
});
