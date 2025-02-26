import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CheckBox, LeftArrowIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import Text from '../common/Text';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { getStringSet } from '../localization/stringSet';

function GalleryHeader(props) {
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   const { selectedImages = [], checkBox = false, setCheckbox, onDone = () => {} } = props;

   const handlingBackBtn = () => {
      props?.onhandleBack && props?.onhandleBack();
   };

   const handleOnPress = () => {
      setCheckbox(true);
      Object.keys(selectedImages).length > 0 && onDone();
   };

   return (
      <View
         style={[commonStyles.hstack, styles.container, { backgroundColor: themeColorPalatte.appBarColor }]}
         justifyContent="space-between"
         alignItems="center">
         <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
            {Boolean(props?.onhandleBack) && (
               <Pressable
                  contentContainerStyle={commonStyles.p_10}
                  pressedStyle={[commonStyles.bgBlack_01, commonStyles.borderRadius_50]}
                  onPress={handlingBackBtn}>
                  <LeftArrowIcon color={themeColorPalatte.iconColor} />
               </Pressable>
            )}
            <Text style={[styles.title, { color: themeColorPalatte.headerPrimaryTextColor }]}>{props?.title}</Text>
         </View>
         <View style={[commonStyles.hstack]}>
            <Pressable
               contentContainerStyle={commonStyles.p_10}
               pressedStyle={[commonStyles.bgBlack_01, commonStyles.borderRadius_50]}
               onPress={handleOnPress}>
               {Object.keys(selectedImages).length > 0 ? (
                  <Text style={[styles.subTitle, { color: themeColorPalatte.primaryColor }]}>
                     {stringSet.CHAT_SCREEN_ATTACHMENTS.DONE_BUTTON}
                  </Text>
               ) : (
                  !checkBox && <CheckBox color={themeColorPalatte.iconColor} />
               )}
            </Pressable>
         </View>
      </View>
   );
}

export default GalleryHeader;

const styles = StyleSheet.create({
   container: {
      height: 65,
      paddingRight: 16,
      paddingVertical: 12,
      width: '100%',
   },
   title: {
      fontSize: 20,
      paddingHorizontal: 12,
      fontWeight: '600',
   },
   subTitle: {
      fontWeight: '600',
   },
});
