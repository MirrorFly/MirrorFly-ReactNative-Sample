import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import IconButton from '../common/IconButton';
import { LeftArrowIcon } from '../common/Icons';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';

const LeftArrowComponent = () => LeftArrowIcon();

const ImageView = props => {
   const {
      params: { profileImage = {} },
   } = useRoute();
   const navigation = useNavigation();
   const headerBg = useSelector(state => state.safeArea.color);
   const handleBackBtn = () => {
      navigation.goBack();
      return true;
   };

   return (
      <>
         <View style={[styles.container, commonStyles.hstack, { backgroundColor: headerBg }]}>
            <View
               style={[
                  commonStyles.hstack,
                  commonStyles.alignItemsCenter,
                  commonStyles.flex1,
                  commonStyles.marginLeft_10,
               ]}>
               <IconButton onPress={handleBackBtn}>
                  <LeftArrowComponent />
               </IconButton>
            </View>
         </View>
         <View
            style={[
               commonStyles.flex1,
               commonStyles.alignItemsCenter,
               commonStyles.justifyContentCenter,
               commonStyles.bgBlack,
            ]}>
            <Image resizeMode="contain" source={{ uri: profileImage?.uri }} style={{ height: 400, width: 410 }} />
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
