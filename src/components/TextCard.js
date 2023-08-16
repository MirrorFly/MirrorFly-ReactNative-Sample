import { Stack, Text, View } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';

const TextCard = props => {
  const [isSelected, setIsSelected] = React.useState(false);
  const ReplyTo = props.message.msgBody.replyTo;
  return (
    <View
      bgColor={props.isSame ? '#E2E8F7' : '#fff'}
      borderRadius={10}
      overflow={'hidden'}
      borderWidth={props.isSame ? 0 : 0.25}
      borderBottomLeftRadius={props.isSame ? 10 : 0}
      borderBottomRightRadius={props.isSame ? 0 : 10}
      borderColor="#959595"
      px="1">
      {isSelected && (
        <View
          paddingX={'1'}
          paddingY={'1'}
          bgColor={props.isSame ? '#E2E8F7' : '#fff'}>
          <Stack
            paddingX={'3'}
            paddingY={'0'}
            backgroundColor={'#0000001A'}
            borderRadius={15}>
            <View marginY={'2'} justifyContent={'flex-start'}>
              <Text numberOfLines={1}>You</Text>
              <Text numberOfLines={1}>Hiiii</Text>
            </View>
          </Stack>
        </View>
      )}

      <Text style={styles.message}>{props.data?.message}</Text>
      <View style={styles.timeStamp}>
        {props.data.status}
        <Text pl="1" color="#455E93" fontSize="10" fontWeight={300}>
          {props.data.timeStamp}
        </Text>
      </View>
    </View>
  );
};
export default TextCard;

const styles = StyleSheet.create({
  message: {
    fontSize: 14,
    paddingHorizontal: 3,
    paddingVertical: 4,
    color: '#313131',
  },
  timeStamp: {
    flexDirection: 'row',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
