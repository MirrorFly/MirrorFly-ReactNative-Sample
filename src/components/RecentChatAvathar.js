import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import Avathar from '../common/Avathar';
import Modal, { ModalCenteredContent } from '../common/Modal';
import { useRoasterData, useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

function RecentChatAvathar({ type, userId, data = {}, ...props }) {
   const [visible, setVisible] = React.useState(false);
   const profile = useRoasterData(userId);
   const themeColorPalatte = useThemeColorPalatte();
   const [userProfile, setUserProfile] = React.useState(data);

   React.useEffect(() => {
      if (profile) {
         setUserProfile(prevData => ({
            ...prevData,
            ...profile,
         }));
      }
   }, [profile]);

   let { nickName, colorCode, image: imageToken } = userProfile;
   const onPress = () => {
      setVisible(true);
   };

   const onRequestClose = () => {
      setVisible(false);
   };

   return (
      <>
         <Pressable disabled style={[commonStyles.flex1]} onPress={onPress}>
            <Avathar
               userId={userId}
               type={type}
               data={nickName || userId}
               backgroundColor={colorCode}
               profileImage={imageToken}
            />
         </Pressable>
         <Modal visible={visible} onRequestClose={onRequestClose}>
            <ModalCenteredContent onPressOutside={onRequestClose}>
               <View style={[commonStyles.bg_color(themeColorPalatte.screenBgColor), commonStyles.borderRadius_5]}>
                  <ActivityIndicator size={'large'} color={themeColorPalatte.primaryColor} />
               </View>
            </ModalCenteredContent>
         </Modal>
      </>
   );
}

export default RecentChatAvathar;
