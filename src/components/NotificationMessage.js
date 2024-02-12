import React from 'react';
import { Text, View } from 'react-native';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';

function NotificationMessage(props) {
   const { messageObject: { msgBody: { notificationContent = '' } = {} } = {} } = props;
   return (
      <View style={[commonStyles.alignItemsCenter, commonStyles.marginBottom_6]}>
         <View
            style={[
               commonStyles.px_8,
               commonStyles.py_2,
               commonStyles.borderRadius_50,
               { backgroundColor: ApplicationColors.groupNotificationBgColour },
            ]}>
            <Text style={{ fontSize: 13, color: ApplicationColors.groupNotificationTextColour }}>
               {notificationContent}
            </Text>
         </View>
      </View>
   );
}

export default NotificationMessage;
