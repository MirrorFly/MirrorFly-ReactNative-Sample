import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import CollapsingToolbar from '../components/CollapsibleToolbar';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { useRoasterData } from '../redux/reduxHook';

const UserInfo = () => {
   const { params: { chatUser = '' } = {} } = useRoute();
   const navigation = useNavigation();
   const chatUserId = getUserIdFromJid(chatUser) || '';
   let {
      nickName = '',
      colorCode = '',
      status = '',
      mobileNumber = '',
      email = '',
      image = '',
   } = useRoasterData(chatUserId) || {};
   // updating default values
   nickName = nickName || chatUserId || '';
   colorCode = colorCode || '';
   status = status || '';
   mobileNumber = mobileNumber || '';
   email = email || '';
   image = image || '';

   const handleBackBtn = () => {
      navigation.goBack();
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
