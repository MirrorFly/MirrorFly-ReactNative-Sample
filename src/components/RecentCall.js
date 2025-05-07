import React from 'react';
import { Image, View } from 'react-native';
import ic_no_call_history from '../assets/ic_no_call_history.webp';
import Text from '../common/Text';
import { getImageSource } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';

function RecentCalls() {
   return (
      <View
         style={[
            commonStyles.flex1,
            commonStyles.alignItemsCenter,
            commonStyles.justifyContentCenter,
            commonStyles.bg_white,
         ]}>
         <Image source={getImageSource(ic_no_call_history)} style={{ width: 200, height: 200 }} />
         <Text style={[commonStyles.fw_600, commonStyles.colorBlack]}>No call log history found</Text>
         <Text>Any new calls will appear here</Text>
      </View>
   );
}

export default RecentCalls;
