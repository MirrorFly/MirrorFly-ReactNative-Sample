import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import RootNavigation from '../Navigation/rootNavigation';
import AlertModal from '../common/AlertModal';
import { FrontArrowIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import ScreenHeader from '../common/ScreenHeader';
import ApplicationColors from '../config/appColors';
import { settingsMenu } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';
import { logoutClearVariables, mirrorflyLogout } from '../uikitMethods';
import { REGISTERSCREEN } from './constants';

function MenuScreen() {
   const navigation = useNavigation();
   const [modalContent, setModalContent] = React.useState(null);

   const toggleModalContent = () => {
      setModalContent(null);
   };

   const hanldeLogout = async () => {
      const res = await mirrorflyLogout();
      if (res === 200) {
         setTimeout(() => {
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
         } else if (name === 'Log out') {
            setModalContent({
               visible: true,
               onRequestClose: toggleModalContent,
               title: 'Are you sure want to logout from the app?',
               noButton: 'No',
               yesButton: 'Yes',
               yesAction: hanldeLogout,
            });
         }
      };

      return (
         <>
            <Pressable
               onPress={handleRoute}
               contentContainerStyle={[commonStyles.hstack, commonStyles.justifyContentSpaceBetween, { padding: 20 }]}>
               <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                  <MenuIcon />
                  <Text
                     style={{
                        marginLeft: 10,
                        color: '#1f2937',
                        fontWeight: '600',
                        fontSize: 14,
                     }}>
                     {name}
                  </Text>
               </View>
               <FrontArrowIcon />
            </Pressable>
            <View style={[styles.divider, commonStyles.maxWidth_90per]} />
         </>
      );
   };

   return (
      <>
         <ScreenHeader title="Settings" isSearchable={false} />
         <View style={[commonStyles.flex1, commonStyles.bg_white]}>
            <FlatList
               keyboardShouldPersistTaps={'always'}
               data={settingsMenu}
               renderItem={renderItem}
               keyExtractor={item => item.name}
               ListFooterComponent={<View style={[styles.divider, commonStyles.maxWidth_90per]} />}
               maxToRenderPerBatch={20}
               scrollEventThrottle={1}
               windowSize={20}
               onEndReachedThreshold={0.1}
               disableVirtualization={true}
            />
         </View>
         {modalContent && <AlertModal {...modalContent} />}
      </>
   );
}

export default MenuScreen;

const styles = StyleSheet.create({
   divider: {
      width: '90%',
      height: 0.5,
      alignSelf: 'center',
      backgroundColor: ApplicationColors.dividerBg,
   },
});
