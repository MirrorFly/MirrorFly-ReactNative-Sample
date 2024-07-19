import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { CSVIcon, DocIcon, PPTIcon, PdfIcon, TXTIcon, XLSIcon, ZipIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import { docTimeFormat } from '../common/timeStamp';
import ApplicationColors from '../config/appColors';
import { convertBytesToKB, getExtension, handleFileOpen } from '../helpers/chatHelpers';
import { getMessageTypeCount } from '../screens/ViewAllMedia';
import commonStyles from '../styles/commonStyles';

function DocumentTab({ docsMessages, loading }) {
   const renderDocCountLabel = () => {
      return getMessageTypeCount(docsMessages, 'file') > 1
         ? getMessageTypeCount(docsMessages, 'file') + ' Documents'
         : getMessageTypeCount(docsMessages, 'file') + ' Document';
   };

   const renderFileIcon = _fileExtension => {
      switch (_fileExtension) {
         case 'pdf':
            return <PdfIcon />;
         case 'ppt':
         case 'pptx':
            return <PPTIcon />;
         case 'csv':
            return <CSVIcon />;
         case 'xls':
         case 'xlsx':
            return <XLSIcon />;
         case 'doc':
         case 'docx':
            return <DocIcon />;
         case 'zip':
         case 'rar':
            return <ZipIcon width={30} height={25} />;
         case 'txt':
         case 'text':
            return <TXTIcon />;
         default:
            return null;
      }
   };

   const renderDocFooter = () => {
      return (
         <>
            {docsMessages.length > 0 && (
               <Text style={[commonStyles.textCenter, commonStyles.colorBlack]}>{renderDocCountLabel()}</Text>
            )}
            {loading && (
               <View style={[commonStyles.mb_130, commonStyles.marginTop_5]}>
                  <ActivityIndicator size="large" color={ApplicationColors.mainColor} />
               </View>
            )}
         </>
      );
   };

   const renderDocTile = ({ item }) => {
      const {
         deleteStatus,
         recallStatus,
         createdAt,
         msgBody: { media: { fileName, file_size, is_downloaded, is_uploading } } = {},
      } = item;

      console.log('item ==>', JSON.stringify(item, null, 2));

      const fileExtension = getExtension(fileName, false);
      const onPress = () => {
         handleFileOpen(item);
      };

      if (
         (deleteStatus !== undefined && deleteStatus !== 0) ||
         (recallStatus !== undefined && recallStatus !== 0) ||
         is_downloaded !== 2 ||
         is_uploading !== 2
      ) {
         return null;
      }

      return (
         <>
            <Pressable
               onPress={onPress}
               contentContainerStyle={[
                  commonStyles.hstack,
                  commonStyles.alignItemsCenter,
                  commonStyles.paddingHorizontal_8,
                  commonStyles.paddingVertical_18,
               ]}>
               <View style={[commonStyles.paddingVertical_8]}>{renderFileIcon(fileExtension)}</View>
               <View style={[commonStyles.flex1, commonStyles.p_4, commonStyles.px_18]}>
                  <Text style={styles.fileNameText}>{fileName}</Text>
                  <Text style={styles.fileSizeText}>{convertBytesToKB(file_size)}</Text>
               </View>
               <View style={[commonStyles.justifyContentFlexEnd]}>
                  <Text style={styles.fileSizeText}>{docTimeFormat(createdAt)}</Text>
               </View>
            </Pressable>
            <View style={[commonStyles.dividerLine]} />
         </>
      );
   };

   return (
      <FlatList
         showsVerticalScrollIndicator={false}
         data={docsMessages}
         keyExtractor={item => item.msgId}
         bounces={false}
         renderItem={renderDocTile}
         ListFooterComponent={renderDocFooter}
         initialNumToRender={20}
         maxToRenderPerBatch={20}
         windowSize={15}
      />
   );
}

export default React.memo(DocumentTab);

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
