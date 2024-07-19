import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Pressable from '../common/Pressable';
import ScreenHeader from '../common/ScreenHeader';
import ApplicationColors from '../config/appColors';
import { notificationMenu } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';

function NotificationScreen() {
   const navigation = useNavigation();
   const renderItem = ({ item }) => {
      const { title, subtitle, rounteName } = item;
      const handleRoute = () => {
         if (rounteName) {
            navigation.navigate(rounteName);
         }
      };

      return (
         <>
            <Pressable
               onPress={handleRoute}
               contentContainerStyle={[commonStyles.vstack, commonStyles.justifyContentSpaceBetween, { padding: 20 }]}>
               <View style={[commonStyles.vstack, commonStyles.marginLeft_5, commonStyles.marginBottom_6]}>
                  <Text style={styles.titleText}>{title}</Text>
                  <Text style={styles.descriptionText} numberOfLines={2}>
                     {subtitle}
                  </Text>
               </View>
            </Pressable>
            <View style={[styles.divider, commonStyles.maxWidth_90per]} />
         </>
      );
   };

   return (
      <>
         <ScreenHeader isSearchable={false} title="Notifications" />
         <View style={[commonStyles.flex1, commonStyles.bg_white]}>
            <FlatList
               keyboardShouldPersistTaps={'always'}
               data={notificationMenu}
               renderItem={renderItem}
               keyExtractor={item => item.name * 0.2}
               ListFooterComponent={<View style={[styles.divider, commonStyles.maxWidth_90per]} />}
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

export default NotificationScreen;

const styles = StyleSheet.create({
   contentContainer: {
      maxWidth: '90%',
   },
   pressable: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      width: '100%', // Ensure it takes the full width of the parent
   },
   textContainer: {
      flex: 1, // Allow the text container to take up remaining space
   },
   titleText: {
      color: ApplicationColors.black,
      fontWeight: '400',
      fontSize: 14,
      paddingBottom: 4,
   },
   descriptionText: {
      fontSize: 12.5,
   },
   divider: {
      width: '90%',
      height: 0.5,
      alignSelf: 'center',
      backgroundColor: ApplicationColors.dividerBg,
   },
});
