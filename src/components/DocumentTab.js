import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { CSVIcon, DocIcon, PPTIcon, PdfIcon, TXTIcon, XLSIcon, ZipIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import Text from '../common/Text';
import { docTimeFormat } from '../common/timeStamp';
import { convertBytesToKB, getExtension, handleFileOpen } from '../helpers/chatHelpers';
import { getStringSet } from '../localization/stringSet';
import { useMediaMessages, useThemeColorPalatte } from '../redux/reduxHook';
import { getMessageTypeCount } from '../screens/ViewAllMedia';
import commonStyles from '../styles/commonStyles';

function DocumentTab({ chatUserId }) {
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   const docsMessages = useMediaMessages(chatUserId, ['file']);
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
               <Text style={[commonStyles.textCenter, { color: themeColorPalatte.primaryTextColor }]}>
                  {renderDocCountLabel()}
               </Text>
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
                  <Text style={[commonStyles.textColor(themeColorPalatte.primaryTextColor), styles.fileNameText]}>
                     {fileName}
                  </Text>
                  <Text style={[commonStyles.textColor(themeColorPalatte.primaryTextColor), styles.fileSizeText]}>
                     {convertBytesToKB(file_size)}
                  </Text>
               </View>
               <View style={[commonStyles.justifyContentFlexEnd]}>
                  <Text style={[commonStyles.textColor(themeColorPalatte.primaryTextColor), styles.fileSizeText]}>
                     {docTimeFormat(createdAt)}
                  </Text>
               </View>
            </Pressable>
            <View style={[commonStyles.dividerLine(themeColorPalatte.dividerBg)]} />
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
         ListEmptyComponent={
            <View
               style={[commonStyles.justifyContentCenter, commonStyles.alignItemsCenter, commonStyles.height_100_per]}>
               <Text style={{ color: themeColorPalatte.primaryTextColor }}>
                  {stringSet.VIEW_ALL_MEDIA_SCREEN.NO_DOCS_FOUND}
               </Text>
            </View>
         }
      />
   );
}

export default React.memo(DocumentTab);

const styles = StyleSheet.create({
   fileNameText: {
      fontSize: 13,
   },
   fileSizeText: {
      fontSize: 11,
   },
});
