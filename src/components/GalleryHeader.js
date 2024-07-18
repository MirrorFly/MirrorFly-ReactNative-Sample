import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckBox, LeftArrowIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import ApplicationColors from '../config/appColors';
import commonStyles from '../styles/commonStyles';

function GalleryHeader(props) {
   const { selectedImages = [], checkBox = false, setCheckbox, onDone = () => {} } = props;

   const handlingBackBtn = () => {
      props?.onhandleBack && props?.onhandleBack();
   };

   const handleOnPress = () => {
      setCheckbox(true);
      Object.keys(selectedImages).length > 0 && onDone();
   };

   return (
      <View style={[commonStyles.hstack, styles.container]} justifyContent="space-between" alignItems="center">
         <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
            {Boolean(props?.onhandleBack) && (
               <Pressable
                  contentContainerStyle={commonStyles.p_10}
                  pressedStyle={[commonStyles.bgBlack_01, commonStyles.borderRadius_50]}
                  onPress={handlingBackBtn}>
                  <LeftArrowIcon />
               </Pressable>
            )}
            <Text style={styles.title}>{props?.title}</Text>
         </View>
         <View style={[commonStyles.hstack]}>
            <Pressable
               contentContainerStyle={commonStyles.p_10}
               pressedStyle={[commonStyles.bgBlack_01, commonStyles.borderRadius_50]}
               onPress={handleOnPress}>
               {Object.keys(selectedImages).length > 0 ? (
                  <Text style={styles.subTitle}>DONE</Text>
               ) : (
                  !checkBox && <CheckBox />
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
      color: '#000',
   },
   subTitle: {
      color: ApplicationColors.mainColor,
      fontWeight: '600',
   },
});
