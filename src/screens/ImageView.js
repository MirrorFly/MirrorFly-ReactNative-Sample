import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import IconButton from '../common/IconButton';
import { LeftArrowIcon } from '../common/Icons';
import Text from '../common/Text';
import { useFetchImage } from '../common/hooks';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { useRoasterData, useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

const ImageView = () => {
   const {
      params: { jid = '', profileImage = {} },
   } = useRoute();
   const themeColorPalatte = useThemeColorPalatte();
   let { nickName: title, image } = useRoasterData(getUserIdFromJid(jid));
   const { imageUrl, authToken } = useFetchImage(image);

   const navigation = useNavigation();
   const handleBackBtn = () => {
      navigation.goBack();
   };

   return (
      <>
         <View style={[styles.container, commonStyles.bg_color(themeColorPalatte.appBarColor), commonStyles.hstack]}>
            <View
               style={[
                  commonStyles.hstack,
                  commonStyles.alignItemsCenter,
                  commonStyles.flex1,
                  commonStyles.marginLeft_10,
               ]}>
               <IconButton onPress={handleBackBtn}>
                  <LeftArrowIcon color={themeColorPalatte.iconColor} />
               </IconButton>
               <Text style={[styles.titleText, commonStyles.textColor(themeColorPalatte.headerPrimaryTextColor)]}>
                  {title}
               </Text>
            </View>
         </View>
         <View
            style={[
               commonStyles.flex1,
               commonStyles.alignItemsCenter,
               commonStyles.justifyContentCenter,
               commonStyles.bg_color(themeColorPalatte.screenBgColor),
            ]}>
            {imageUrl ? (
               <Image
                  style={{ height: 400, width: 410 }}
                  source={{
                     uri: imageUrl,
                     method: 'GET',
                     cache: 'force-cache',
                     headers: {
                        Authorization: authToken,
                     },
                  }}
               />
            ) : (
               <Image resizeMode="contain" source={{ uri: profileImage?.uri }} style={{ height: 400, width: 410 }} />
            )}
         </View>
      </>
   );
};

export default ImageView;

const styles = StyleSheet.create({
   container: {
      height: 60,
   },
   titleText: {
      fontSize: 18,
      paddingHorizontal: 12,
      fontWeight: '500',
      width: 250,
   },
   subText: {
      fontSize: 14,
      paddingHorizontal: 12,
      color: '#000',
   },
   cameraImage: {
      height: 42,
      width: 42,
      padding: 10,
   },
   nameTextView: {
      borderBottomWidth: 1,
      borderBottomColor: '#f2f2f2',
   },
   nameTextInput: {
      flex: 1,
      fontSize: 15,
      fontWeight: '400',
      marginTop: 5,
      paddingLeft: 40,
   },
});
