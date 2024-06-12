import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ApplicationColors from '../config/appColors';

const CaptionContainer = ({ caption, msgStatus, timeStamp }) => {
   return (
      Boolean(caption) && (
         <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{caption}</Text>
            <View style={styles.messgeStatusAndTimestampWithCaption}>
               {isSender && getMessageStatus(msgStatus)}
               <Text style={styles.timeStampText}>{timeStamp}</Text>
            </View>
         </View>
      )
   );
};
export default CaptionContainer;

const styles = StyleSheet.create({
   captionContainer: {
      paddingBottom: 8,
      justifyContent: 'space-between',
   },
   captionText: {
      color: ApplicationColors.black,
      paddingLeft: 4,
      fontSize: 14,
   },
   messgeStatusAndTimestampWithCaption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
   },
   timeStampText: {
      paddingLeft: 4,
      color: ApplicationColors.timeStampText,
      fontSize: 10,
      fontWeight: '400',
   },
});
