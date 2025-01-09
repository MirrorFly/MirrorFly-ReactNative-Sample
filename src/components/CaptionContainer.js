import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../common/Text';
import { getMessageStatus } from '../helpers/chatHelpers';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

const CaptionContainer = ({ isSender, caption, msgStatus, timeStamp }) => {
   const themeColorPalatte = useThemeColorPalatte();
   return (
      Boolean(caption) && (
         <View style={styles.captionContainer}>
            <Text
               style={{
                  ...commonStyles.textColor(
                     isSender
                        ? themeColorPalatte.chatSenderPrimaryTextColor
                        : themeColorPalatte.chatReceiverPrimaryTextColor,
                  ),
                  ...styles.captionText,
               }}>
               {caption}
            </Text>
            <View style={styles.messgeStatusAndTimestampWithCaption}>
               {isSender && getMessageStatus(msgStatus)}
               <Text
                  style={[
                     styles.timeStampText,
                     commonStyles.textColor(
                        isSender
                           ? themeColorPalatte.chatSenderSecondaryTextColor
                           : themeColorPalatte.chatReceiverSecondaryTextColor,
                     ),
                  ]}>
                  {timeStamp}
               </Text>
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
      paddingHorizontal: 4,
      fontSize: 14,
   },
   messgeStatusAndTimestampWithCaption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
   },

   timeStampText: {
      paddingHorizontal: 4,
      fontSize: 10,
      fontWeight: '400',
   },
});
