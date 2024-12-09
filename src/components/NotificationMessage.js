import React from 'react';
import { Text, View } from 'react-native';
import ApplicationColors from '../config/appColors';
import commonStyles from '../styles/commonStyles';

function NotificationMessage(props) {
   const { label, messageObject: { msgBody: { notificationContent = '' } = {} } = {} } = props;

   return (
      <View style={[{}, commonStyles.alignItemsCenter, commonStyles.marginBottom_6]}>
         <View
            style={[
               commonStyles.px_8,
               commonStyles.py_2,
               commonStyles.borderRadius_50,
               { backgroundColor: ApplicationColors.groupNotificationBgColour },
            ]}>
            <Text style={{ fontSize: 13, color: ApplicationColors.groupNotificationTextColour }}>
               {notificationContent || label}
            </Text>
         </View>
      </View>
   );
}

export default NotificationMessage;
