import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { convertBytesToKB } from '../Helper';
import { handleFileOpen } from '../Helper/Chat/ChatHelper';
import { CSVIcon, DocIcon, PPTIcon, PdfIcon, TXTIcon, XLSIcon, ZipIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import { docTimeFormat } from '../common/TimeStamp';
import commonStyles from '../common/commonStyles';
import { useChatMessage } from '../hooks/useChatMessage';
import { getExtension } from './chat/common/fileUploadValidation';

function DocTile({ item, onDelete }) {
   const {
      deleteStatus,
      recallStatus,
      createdAt,
      msgBody: { media: { fileName, file_size, is_downloaded, is_uploading } } = {},
   } = useChatMessage(item.msgId);
   const fileExtension = getExtension(fileName, false);
   const onPress = () => {
      handleFileOpen(item);
   };

   if (deleteStatus !== 0 || recallStatus !== 0 || is_downloaded !== 2 || is_uploading !== 2) {
      onDelete(item.msgId);
      return null;
   }

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
}

export default DocTile;

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
