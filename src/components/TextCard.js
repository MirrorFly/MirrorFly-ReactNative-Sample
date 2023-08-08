import { Text, View } from 'native-base';
import React from 'react';
const TextCard = props => {
  return (
    <View
      bgColor={props.isSame ? '#E2E8F7' : '#fff'}
      borderWidth={props.isSame ? 0 : 0.25}
      borderRadius={10}
      borderBottomLeftRadius={props.isSame ? 10 : 0}
      borderBottomRightRadius={props.isSame ? 0 : 10}
      borderColor="#959595"
      px="1">
      <Text
        style={{
          fontSize: 14,
          paddingHorizontal: 3,
          paddingVertical: 4,
          color: '#313131',
        }}>
        {props.data?.message}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
          padding: 2,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
        {props.data.status}
        <Text pl="1" color="#455E93" fontSize="10" fontWeight={350}>
          {props.data.timeStamp}
        </Text>
      </View>
    </View>
  );
};
export default TextCard;
