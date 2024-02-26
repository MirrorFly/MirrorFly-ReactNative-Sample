import React from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import CollapsingToolbar from './CollapsibleToolbar';
import useRosterData from '../hooks/useRosterData';

const UserInfo = ({ setLocalNav, toUserId }) => {
   let {
      nickName = '',
      colorCode = '',
      status = '',
      mobileNumber = '',
      email = '',
      image = '',
   } = useRosterData(toUserId);
   // updating default values
   nickName = nickName || toUserId || '';
   colorCode = colorCode || '';
   status = status || '';
   mobileNumber = mobileNumber || '';
   email = email || '';
   image = image || '';

   const handleBackBtn = () => {
      setLocalNav('CHATCONVERSATION');
   };

   const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);

   React.useEffect(() => {
      return () => {
         backHandler.remove();
      };
   }, []);

   return (
      <View style={styles.container}>
         <CollapsingToolbar
            bgColor={colorCode}
            title={nickName}
            titleColor={colorCode}
            titleStatus={status}
            mobileNo={mobileNumber || toUserId}
            imageToken={image}
            email={email}
            setLocalNav={setLocalNav}
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
