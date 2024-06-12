import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { FrontArrowIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import ScreenHeader from '../common/ScreenHeader';
import ApplicationColors from '../config/appColors';
import { settingsMenu } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';

function MenuScreen() {
   const navigation = useNavigation();
   const renderItem = ({ item }) => {
      const { name, icon: MenuIcon } = item;

      const handleRoute = () => {
         navigation.navigate(item.rounteName);
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
               keyExtractor={item => item.rounteName}
               maxToRenderPerBatch={20}
               scrollEventThrottle={1}
               windowSize={20}
               onEndReachedThreshold={0.1}
               disableVirtualization={true}
            />
         </View>
      </>
   );
}

export default MenuScreen;

const styles = StyleSheet.create({
   divider: {
      width: '90%',
      height: 1,
      alignSelf: 'center',
      backgroundColor: ApplicationColors.dividerBg,
   },
});
