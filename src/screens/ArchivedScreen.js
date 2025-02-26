import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React from 'react';
import { BackHandler, FlatList, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import Text from '../common/Text';
import ArchivedHeader from '../components/ArchivedHeader';
import RecentChatItem from '../components/RecentChatItem';
import { getStringSet } from '../localization/stringSet';
import { resetChatSelections } from '../redux/recentChatDataSlice';
import { useArchivedChatData, useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { ARCHIVED_SCREEN } from './constants';

function ArchivedScreen() {
   const stringSet = getStringSet();
   const navigation = useNavigation();
   const themeColorPalatte = useThemeColorPalatte();
   const dispatch = useDispatch();
   const archiveChats = useArchivedChatData() || [];

   const isAnySelected = React.useMemo(() => {
      return archiveChats.some(item => item.isSelected === 1);
   }, [archiveChats.map(item => item.isSelected).join(',')]); // Include isSelected in the dependency array

   useFocusEffect(
      React.useCallback(() => {
         return () => {
            dispatch(resetChatSelections(ARCHIVED_SCREEN));
         };
      }, []),
   );

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => backHandler.remove();
   }, [isAnySelected]);

   const handleBackBtn = React.useCallback(() => {
      switch (true) {
         case isAnySelected:
            dispatch(resetChatSelections(ARCHIVED_SCREEN));
            break;
         case navigation.canGoBack():
            navigation.goBack();
            break;
      }
      return true;
   }, [archiveChats]);

   const renderItem = ({ item, index }) => (
      <RecentChatItem key={item.userJid} item={item} index={index} component="archived-chat" stringSet={stringSet} />
   );

   return (
      <>
         <ArchivedHeader />
         <View style={[commonStyles.flex1, commonStyles.bg_color(themeColorPalatte.screenBgColor)]}>
            {archiveChats.length ? (
               <FlatList
                  keyboardShouldPersistTaps={'always'}
                  data={archiveChats}
                  renderItem={renderItem}
                  keyExtractor={item => item.userJid.toString()}
                  maxToRenderPerBatch={20}
                  scrollEventThrottle={1}
                  windowSize={20}
                  onEndReachedThreshold={0.1}
                  ListFooterComponent={
                     <View style={[styles.divider, commonStyles.bg_color(themeColorPalatte.dividerBg)]} />
                  }
                  disableVirtualization={true}
               />
            ) : (
               <View
                  style={[
                     commonStyles.flex1,
                     commonStyles.bg_color(themeColorPalatte.screenBgColor),
                     commonStyles.justifyContentCenter,
                     commonStyles.alignItemsCenter,
                  ]}>
                  <Text style={{ color: themeColorPalatte.primaryTextColor }}>
                     {stringSet.COMMON_TEXT.NO_ARCHIVED_CHATS}
                  </Text>
               </View>
            )}
         </View>
      </>
   );
}

export default ArchivedScreen;

const styles = StyleSheet.create({
   divider: {
      width: '83%',
      height: 0.5,
      alignSelf: 'flex-end',
   },
});
