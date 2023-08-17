import { getMessageFromHistoryById } from 'Helper/Chat/ChatHelper';
import { Stack, Text, View } from 'native-base';
import React from 'react';
import { useSelector } from 'react-redux';

function ReplyMessage(props) {
  const fromUserJId = useSelector(state => state.navigation.fromUserJid);
  const [repliedMsg, setRepliedMsg] = React.useState({});
  const { msgBody: { replyTo = '' } = {} } = props.message;
  console.log(replyTo, 'TextCard replyTo');

  React.useEffect(() => {
    setRepliedMsg(getMessageFromHistoryById(fromUserJId, replyTo));
  }, []);

  return (
    <>
      {repliedMsg && (
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
    </>
  );
}

export default ReplyMessage;
