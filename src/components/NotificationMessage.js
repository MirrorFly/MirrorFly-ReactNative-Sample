import React from 'react';
import { View } from 'react-native';
import Text from '../common/Text';
import { getUserIdFromJid, groupNotifyStatus } from '../helpers/chatHelpers';
import { messageNotificationTypes } from '../helpers/constants';
import { getUserNameFromStore } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

function NotificationMessage(props) {
   const {
      label,
      messageObject: { msgBody: { message = '', notificationContent } = {}, publisherId = '', toUserJid = '' } = {},
      themeColorPalatte = {},
   } = props;
   const publisherName = getUserNameFromStore(publisherId);
   const toUserID = getUserIdFromJid(toUserJid);
   const toUserName = getUserNameFromStore(toUserID);
   if (!label && !notificationContent) {
      return null;
   }

   const notificationMessage =
      groupNotifyStatus(publisherId, toUserID, messageNotificationTypes[message], publisherName, toUserName) || label;

   return (
      <View style={[commonStyles.alignItemsCenter, commonStyles.marginBottom_6]}>
         <View
            style={[
               commonStyles.px_8,
               commonStyles.py_2,
               commonStyles.borderRadius_50,
               { backgroundColor: themeColorPalatte.groupNotificationBgColour },
            ]}>
            <Text style={{ fontSize: 13, color: themeColorPalatte.groupNotificationTextColour }}>
               {notificationMessage}
            </Text>
         </View>
      </View>
   );
}

export default NotificationMessage;
