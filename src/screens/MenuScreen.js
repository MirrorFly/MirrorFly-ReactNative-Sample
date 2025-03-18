import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import RootNavigation from '../Navigation/rootNavigation';
import AlertModal from '../common/AlertModal';
import { FrontArrowIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import ScreenHeader from '../common/ScreenHeader';
import Text from '../common/Text';
import { settingsMenu, showToast } from '../helpers/chatHelpers';
import { getStringSet } from '../localization/stringSet';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { logoutClearVariables, mirrorflyLogout } from '../uikitMethods';
import { REGISTERSCREEN } from './constants';
import LoadingModal from '../common/LoadingModal';
import FileViewer from 'react-native-file-viewer';
import SDK from '../SDK/SDK';

function MenuScreen() {
   const navigation = useNavigation();
   const themeColorPalatte = useThemeColorPalatte();
   const [modalContent, setModalContent] = React.useState(null);
   const stringSet = getStringSet();
   const [visible, setVisible] = React.useState(false);

   const toggleModalContent = () => {
      setModalContent(null);
   };

   const hanldeLogout = async () => {
      setVisible(true);
      const res = await mirrorflyLogout();
      if (res === 200) {
         setTimeout(() => {
            setVisible(false);
            logoutClearVariables();
            RootNavigation.reset(REGISTERSCREEN);
         }, 1000);
      }
   };

   const renderItem = ({ item }) => {
      const { name, icon: MenuIcon, rounteName } = item;

      const handleRoute = () => {
         if (rounteName) {
            navigation.navigate(rounteName);
         } else if (name === stringSet.SETTINGS_SCREEN.LOG_OUT_LABEL) {
            setModalContent({
               visible: true,
               onRequestClose: toggleModalContent,
               title: stringSet.POPUP_TEXT.LOG_OUT_HEADER_LABEL,
               noButton: stringSet.BUTTON_LABEL.NO_BUTTON,
               yesButton: stringSet.BUTTON_LABEL.YES_BUTTON,
               yesAction: hanldeLogout,
            });
         } else if (name === 'Export Log') {
            FileViewer.open(SDK.getLogFilePath(), {
               showOpenWithDialog: true,
            })
               .then(res => {
                  console.log('Document opened externally', res);
               })
               .catch(err => {
                  console.log('Error while opening Document', err);
                  showToast(stringSet.TOAST_MESSAGES.NO_APPS_AVAILABLE);
               });
         }
      };

      return (
         <>
            <Pressable
               onPress={handleRoute}
               contentContainerStyle={[commonStyles.hstack, commonStyles.justifyContentSpaceBetween, { padding: 20 }]}>
               <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                  <MenuIcon color={themeColorPalatte.iconColor} />
                  <Text
                     style={{
                        marginLeft: 10,
                        color: themeColorPalatte.primaryTextColor,
                        fontWeight: '600',
                        fontSize: 14,
                     }}>
                     {name}
                  </Text>
               </View>
               <FrontArrowIcon />
            </Pressable>
            <View
               style={[styles.divider, commonStyles.bg_color(themeColorPalatte.dividerBg), commonStyles.maxWidth_90per]}
            />
         </>
      );
   };

   /** const renderThemeComponent = () => {
      const handleSwitchToggle = async value => {
         setTheme(!value ? 'light' : 'dark');
      };

      return (
         <View style={[commonStyles.hstack, commonStyles.justifyContentSpaceBetween, { padding: 15 }]}>
            <Text
               style={{
                  marginLeft: 5,
                  padding: 10,
                  color: themeColorPalatte.primaryTextColor,
                  fontWeight: '600',
                  fontSize: 14,
               }}>
               Dark Theme
            </Text>
            <CustomSwitch value={themeColor === 'dark' ? 1 : 0} onToggle={handleSwitchToggle} />
         </View>
      );
   }; */

   return (
      <>
         <ScreenHeader title={stringSet.SETTINGS_SCREEN.HEADER_TITLE_LABEL} isSearchable={false} />
         <View style={[commonStyles.flex1, commonStyles.bg_color(themeColorPalatte.screenBgColor)]}>
            <FlatList
               keyboardShouldPersistTaps={'always'}
               data={settingsMenu}
               renderItem={renderItem}
               keyExtractor={item => item.name}
               ListFooterComponent={
                  <View
                     style={[
                        styles.divider,
                        commonStyles.maxWidth_90per,
                        commonStyles.bg_color(themeColorPalatte.dividerBg),
                     ]}
                  />
               }
               maxToRenderPerBatch={20}
               scrollEventThrottle={1}
               windowSize={20}
               onEndReachedThreshold={0.1}
               disableVirtualization={true}
            />
         </View>
         {modalContent && <AlertModal {...modalContent} />}
         <LoadingModal visible={visible} behavior="custom" />
      </>
   );
}

export default MenuScreen;

const styles = StyleSheet.create({
   divider: {
      width: '90%',
      height: 0.6,
      alignSelf: 'center',
   },
});
