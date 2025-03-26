import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Avathar from '../common/Avathar';
import IconButton from '../common/IconButton';
import { InfoIcon, QuickChatIcon } from '../common/Icons';
import InfoImageView from '../common/InfoImageView';
import Modal, { ModalCenteredContent } from '../common/Modal';
import Text from '../common/Text';
import { CHAT_TYPE_SINGLE, MIX_BARE_JID } from '../helpers/constants';
import { useRoasterData, useThemeColorPalatte } from '../redux/reduxHook';
import { CONVERSATION_SCREEN, CONVERSATION_STACK, GROUP_INFO, USER_INFO } from '../screens/constants';
import commonStyles from '../styles/commonStyles';
import MakeCall from './MakeCall';
import { fetchGroupParticipants } from '../SDK/utils';

function RecentChatAvatar({ type, chatUser, userId, data = {}, ...props }) {
   const [visible, setVisible] = React.useState(false);
   const profile = useRoasterData(userId);
   const themeColorPalette = useThemeColorPalatte();
   const [userProfile, setUserProfile] = React.useState(data);
   const navigation = useNavigation();

   React.useEffect(() => {
      if (profile && JSON.stringify(profile) !== JSON.stringify(userProfile)) {
         setUserProfile(prevData => ({
            ...prevData,
            ...profile,
         }));
      }
   }, [profile]);

   const { nickName, colorCode, image: imageToken } = userProfile;

   const onPress = () => setVisible(true);
   const onRequestClose = () => setVisible(false);

   const handleRouteToInfo = () => {
      onRequestClose();
      if (MIX_BARE_JID.test(chatUser)) {
         fetchGroupParticipants(chatUser);
         navigation.navigate(CONVERSATION_STACK, { screen: GROUP_INFO, params: { chatUser } });
      } else {
         navigation.navigate(CONVERSATION_STACK, { screen: USER_INFO, params: { chatUser } });
      }
   };

   const handleRouteToChat = () => {
      onRequestClose();
      navigation.navigate(CONVERSATION_STACK, { screen: CONVERSATION_SCREEN, params: { jid: chatUser } });
   };

   return (
      <>
         <Pressable style={commonStyles.flex1} onPress={onPress}>
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
               <View
                  style={[
                     commonStyles.bg_color(themeColorPalette.screenBgColor),
                     commonStyles.borderRadius_12,
                     styles.container,
                  ]}>
                  {/* Nickname Text - Positioned Top Left */}
                  <Text style={styles.nickNameText}>{nickName}</Text>

                  {/* Image View (Takes Most of the Space) */}
                  <View style={[commonStyles.flex1, commonStyles.width_100_per]}>
                     <InfoImageView
                        scaledFontSize={60}
                        type={type}
                        userId={userId}
                        style={styles.imageContainer(imageToken, colorCode)}
                     />
                  </View>

                  {/* Bottom Icons - Positioned at Bottom */}
                  <View style={styles.iconContainer}>
                     <IconButton onPress={handleRouteToChat}>
                        <QuickChatIcon color={themeColorPalette.iconColor} />
                     </IconButton>
                     {type === CHAT_TYPE_SINGLE && <MakeCall userId={userId} chatUser={userId} />}
                     <IconButton onPress={handleRouteToInfo}>
                        <InfoIcon color={themeColorPalette.iconColor} />
                     </IconButton>
                  </View>
               </View>
            </ModalCenteredContent>
         </Modal>
      </>
   );
}

export default RecentChatAvatar;

const styles = StyleSheet.create({
   container: { width: 240, height: 260 },
   nickNameText: {
      color: '#fff',
      position: 'absolute',
      top: 10,
      left: 15,
      zIndex: 10,
      fontSize: 14,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 6,
   },
   imageContainer: (imageToken, colorCode) => ({
      width: '100%',
      height: '100%',
      borderTopEndRadius: 12,
      borderTopLeftRadius: 12,
      ...(!imageToken && {
         backgroundColor: colorCode,
         justifyContent: 'center',
         alignItems: 'center',
      }),
   }),
   iconContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 3,
   },
});
