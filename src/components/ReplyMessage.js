import { getMessageFromHistoryById } from 'Helper/Chat/ChatHelper';
import { getUserIdFromJid } from 'Helper/Chat/Utility';
import { Text, View } from 'native-base';
import React from 'react';
import { useSelector } from 'react-redux';

function ReplyMessage(props) {
  const fromUserJId = useSelector(state => state.navigation.fromUserJid);
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  const profileDetails = useSelector(state => state.navigation.profileDetails);
  const [repliedMsg, setRepliedMsg] = React.useState({});
  const { msgBody: { replyTo = '' } = {} } = props.message;
  const {
    msgBody: { message_type = '', message = '' } = {},
    fromUserJid = '',
  } = repliedMsg;
  const isSameUser = fromUserJid === currentUserJID;

  React.useEffect(() => {
    setRepliedMsg(
      getMessageFromHistoryById(getUserIdFromJid(fromUserJId), replyTo),
    );
  }, []);

  if (message_type === 'text') {
    return (
      <View
        mt="1"
        px="2"
        py="1"
        borderRadius={7}
        bgColor={props.isSame ? '#D0D8EB' : '#EFEFEF'}>
        <Text numberOfLines={1} ellipsizeMode="tail">
          {!isSameUser
            ? profileDetails?.nickName || getUserIdFromJid(fromUserJId)
            : 'You'}
        </Text>
        <Text numberOfLines={1} ellipsizeMode="tail">
          {message}
        </Text>
      </View>
    );
  }
}

export default ReplyMessage;
