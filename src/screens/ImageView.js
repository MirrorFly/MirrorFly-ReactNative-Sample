import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import IconButton from '../common/IconButton';
import { LeftArrowIcon } from '../common/Icons';
import { useFetchImage } from '../common/hooks';
import ApplicationColors from '../config/appColors';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { useRoasterData } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

const ImageView = () => {
   const {
      params: { jid = '', profileImage = {} },
   } = useRoute();
   let { nickName: title, image } = useRoasterData(getUserIdFromJid(jid));
   const { imageUrl, authToken } = useFetchImage(image);

   const navigation = useNavigation();
   const handleBackBtn = () => {
      navigation.goBack();
   };

   return (
      <>
         <View style={[styles.container, commonStyles.hstack]}>
            <View
               style={[
                  commonStyles.hstack,
                  commonStyles.alignItemsCenter,
                  commonStyles.flex1,
                  commonStyles.marginLeft_10,
               ]}>
               <IconButton onPress={handleBackBtn}>
                  <LeftArrowIcon />
               </IconButton>
               <Text style={styles.titleText}>{title}</Text>
            </View>
         </View>
         <View
            style={[
               commonStyles.flex1,
               commonStyles.alignItemsCenter,
               commonStyles.justifyContentCenter,
               commonStyles.bgBlack,
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
      backgroundColor: ApplicationColors.headerBg,
   },
   titleText: {
      fontSize: 18,
      paddingHorizontal: 12,
      fontWeight: '500',
      color: ApplicationColors.black,
   },
   subText: {
      fontSize: 14,
      paddingHorizontal: 12,
      color: ApplicationColors.black,
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
