import CheckBox from '@react-native-community/checkbox';
import { useRoute } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, FlatList, Keyboard, Platform, StyleSheet, View } from 'react-native';
import SDK from '../SDK/SDK';
import Avathar from '../common/Avathar';
import NickName from '../common/NickName';
import Pressable from '../common/Pressable';
import Text from '../common/Text';
import config from '../config/config';
import { showToast } from '../helpers/chatHelpers';
import { getStringSet, replacePlaceholders } from '../localization/stringSet';
import { useRoasterData, useThemeColorPalatte } from '../redux/reduxHook';
import { GROUP_INFO, NEW_GROUP } from '../screens/constants';
import commonStyles from '../styles/commonStyles';

const RenderItem = ({ item, onhandlePress, selectedUsers, searchText }) => {
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   let { nickName, image: imageToken, colorCode, status, userId } = useRoasterData(item?.userId) || {};
   const { params: { prevScreen = '' } = {} } = useRoute();
   const [isChecked, setIsChecked] = React.useState(false);
   const isNewGrpSrn = prevScreen === NEW_GROUP;
   const isGroupInfoSrn = prevScreen === GROUP_INFO;
   // updating default values
   nickName = nickName || item?.nickName || item?.userId || '';
   imageToken = imageToken || '';
   colorCode = colorCode || SDK.getRandomColorCode();
   status = status || item.status || '';

   const handlePress = () => {
      Keyboard.dismiss();
      if (Object.keys(selectedUsers).length > config.maxAllowdGroupMembers - 2) {
         return showToast(
            replacePlaceholders(stringSet.INFO_SCREEN.MAXIMUM_ALLOWED_GROUP_MEMBERS, {
               maxAllowdGroupMembers: config.maxAllowdGroupMembers,
            }),
         );
      }
      onhandlePress(item);
   };
   React.useEffect(() => {
      if (Boolean(selectedUsers[item?.userJid]) !== isChecked) {
         setIsChecked(Boolean(selectedUsers[item?.userJid]));
      }
   }, [selectedUsers[item?.userJid]]);

   const renderCheckBox = React.useMemo(() => {
      return (
         <CheckBox
            onFillColor={themeColorPalatte.primaryColor}
            onCheckColor={themeColorPalatte.primaryColor}
            hideBox={true}
            animationDuration={0.1}
            onAnimationType={'stroke'}
            tintColors={{
               true: themeColorPalatte.primaryColor,
               false: themeColorPalatte.primaryColor,
            }}
            onChange={Platform.OS !== 'ios' && handlePress}
            value={isChecked}
            disabled={Platform.OS === 'ios'}
            style={[styles.checkbox, { borderColor: themeColorPalatte.primaryColor }]}
         />
      );
   }, [isChecked, themeColorPalatte]);

   return (
      <React.Fragment>
         <Pressable onPress={handlePress}>
            <View style={styles.wrapper}>
               <Avathar data={nickName} profileImage={imageToken} backgroundColor={colorCode} />
               <View style={[commonStyles.marginLeft_15, commonStyles.flex1]}>
                  <NickName
                     userId={item?.userId}
                     data={nickName}
                     searchValue={searchText}
                     style={[styles.nickNameText, { color: themeColorPalatte.primaryTextColor }]}
                  />
                  <Text
                     style={[{ color: themeColorPalatte.secondaryTextColor }, styles.stautsText]}
                     numberOfLines={1}
                     ellipsizeMode="tail">
                     {status}
                  </Text>
               </View>
               {(isNewGrpSrn || isGroupInfoSrn) && renderCheckBox}
            </View>
         </Pressable>
         <View style={[styles.divider, { backgroundColor: themeColorPalatte.dividerBg }]} />
      </React.Fragment>
   );
};

export default function FlatListView(props) {
   const { selectedUsers, onhandlePress, isLoading, footerLoader, data, searchText, themeColorPalatte } = props;
   const renderItem = ({ item, index }) => (
      <RenderItem
         searchText={searchText}
         item={item}
         index={index}
         onhandlePress={onhandlePress}
         selectedUsers={selectedUsers}
      />
   );

   const renderLoaderIfFetching = () => {
      if (isLoading) {
         return (
            <View style={styles.loaderWrapper}>
               <View style={commonStyles.alignItemsCenter}>
                  <ActivityIndicator size="large" color={themeColorPalatte.primaryColor} />
               </View>
            </View>
         );
      }
   };

   const renderFooterLoaderIfFetching = () => {
      if (footerLoader) {
         return (
            <View style={commonStyles.mb_130}>
               <View style={commonStyles.alignItemsCenter}>
                  <ActivityIndicator size="large" color={themeColorPalatte.primaryColor} />
               </View>
            </View>
         );
      }
   };

   return (
      <>
         {renderLoaderIfFetching()}
         <View style={[styles.listContainer, { backgroundColor: themeColorPalatte.screenBgColor }]}>
            <FlatList
               keyboardShouldPersistTaps={'always'}
               keyExtractor={item => item?.userId}
               onEndReached={props?.onhandlePagination}
               showsVerticalScrollIndicator={true}
               data={data || []}
               renderItem={renderItem}
               ListFooterComponent={renderFooterLoaderIfFetching}
               initialNumToRender={23}
               maxToRenderPerBatch={23}
               windowSize={15}
            />
         </View>
      </>
   );
}

const styles = StyleSheet.create({
   listContainer: {
      flex: 1,
   },
   wrapper: {
      width: '100%',
      marginVertical: 12,
      paddingLeft: 16,
      paddingRight: 20,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
   },
   nickNameText: {
      flexWrap: 'wrap',
      fontWeight: 'bold',
      marginVertical: 2,
   },
   stautsText: {
      marginVertical: 2,
   },
   divider: {
      width: '83%',
      height: 1,
      alignSelf: 'flex-end',
   },
   loaderWrapper: {
      position: 'absolute',
      width: '100%',
      top: 90,
      zIndex: 100,
   },
   checkbox: {
      borderWidth: 2,
      borderRadius: 5,
      width: 20,
      height: 20,
   },
});
