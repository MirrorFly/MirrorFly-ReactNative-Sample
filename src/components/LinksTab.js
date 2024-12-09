import React from 'react';
import { ActivityIndicator, FlatList, Linking, StyleSheet, Text, View } from 'react-native';
import Pressable from '../common/Pressable';
import ApplicationColors from '../config/appColors';
import commonStyles from '../styles/commonStyles';

function LinksTab({ linksMessage, loading }) {
   const renderDocFooter = () => {
      return (
         <>
            {linksMessage.length > 0 && <Text style={[commonStyles.textCenter, commonStyles.colorBlack]}>{}</Text>}
            {loading && (
               <View style={[commonStyles.mb_130, commonStyles.marginTop_5]}>
                  <ActivityIndicator size="large" color={ApplicationColors.mainColor} />
               </View>
            )}
         </>
      );
   };

   const renderLinkTile = ({ item }) => {
      const { deleteStatus = 0, recallStatus = 0, msgBody: { message = '' } = {} } = item;

      // const fileExtension = getExtension(fileName, false);
      const handlePress = () => {
         Linking.openURL(message);
      };

      if (deleteStatus !== 0 || recallStatus !== 0) {
         return null;
      }

      return (
         <>
            <Pressable
               onPress={handlePress}
               contentContainerStyle={[
                  commonStyles.hstack,
                  commonStyles.alignItemsCenter,
                  commonStyles.paddingHorizontal_8,
                  commonStyles.paddingVertical_18,
               ]}>
               {/* <View style={[commonStyles.paddingVertical_8]}>{renderFileIcon(fileExtension)}</View> */}
               <View style={[commonStyles.flex1, commonStyles.p_4, commonStyles.px_18]}>
                  <Text style={styles.fileNameText}>{message}</Text>
                  {/* <Text style={styles.fileSizeText}>{convertBytesToKB(file_size)}</Text> */}
               </View>
               <View style={[commonStyles.justifyContentFlexEnd]}>
                  {/* <Text style={styles.fileSizeText}>{docTimeFormat(createdAt)}</Text> */}
               </View>
            </Pressable>
            <View style={[commonStyles.dividerLine]} />
         </>
      );
   };

   return (
      <FlatList
         showsVerticalScrollIndicator={false}
         data={linksMessage}
         keyExtractor={item => item.msgId}
         bounces={false}
         renderItem={renderLinkTile}
         ListFooterComponent={renderDocFooter}
         initialNumToRender={20}
         maxToRenderPerBatch={20}
         windowSize={15}
      />
   );
}

export default React.memo(LinksTab);

const styles = StyleSheet.create({
   fileNameText: {
      fontSize: 13,
      color: '#000',
   },
   fileSizeText: {
      fontSize: 11,
      color: '#000',
   },
});
