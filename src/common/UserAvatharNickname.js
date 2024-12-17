import React from 'react';
import { StyleSheet, View } from 'react-native';
import { formatUserIdToJid, handleUpdateBlockUser } from '../helpers/chatHelpers';
import { getUserNameFromStore, useRoasterData } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import AlertModal from './AlertModal';
import Avathar from './Avathar';
import NickName from './NickName';
import Pressable from './Pressable';

function UserAvatharNickname({ item }) {
   const [modalContent, setModalContent] = React.useState(null);
   let { nickName, image: imageToken, colorCode } = useRoasterData(item?.userId);
   nickName = nickName || item?.nickName || item?.userId || '';
   imageToken = imageToken || '';
   colorCode = colorCode || SDK.getRandomColorCode();

   const toggleModalContent = () => {
      setModalContent(null);
   };

   const handlePress = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: `Unblock ${getUserNameFromStore(item?.userId)}`,
         noButton: 'CANCEL',
         yesButton: 'UNBLOCK',
         yesAction: handleUpdateBlockUser(item?.userId, 0, formatUserIdToJid(item?.userId)),
      });
   };

   return (
      <React.Fragment>
         <Pressable onPress={handlePress}>
            <View style={styles.wrapper}>
               <Avathar data={nickName} profileImage={imageToken} backgroundColor={colorCode} />
               <View style={[commonStyles.marginLeft_15, commonStyles.flex1]}>
                  <NickName userId={item?.userId} data={nickName} style={styles.nickNameText} />
               </View>
            </View>
         </Pressable>
         <View style={commonStyles.dividerLine} />
         {modalContent && <AlertModal {...modalContent} />}
      </React.Fragment>
   );
}

export default UserAvatharNickname;

const styles = StyleSheet.create({
   wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 18,
   },
   nickNameText: {
      flexWrap: 'wrap',
      color: '#1f2937',
      fontWeight: 'bold',
      marginVertical: 2,
   },
});
