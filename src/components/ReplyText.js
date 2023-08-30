import { Pressable, ScrollView } from 'react-native';
import React from 'react';
import { HStack, Text, View } from 'native-base';
import { ClearTextIcon } from '../common/Icons';
import { useSelector } from 'react-redux';
import useRosterData from '../hooks/useRosterData';

const ReplyText = props => {
  const { replyMsgItems, handleRemove, selectedMsgIndex } = props;
  const scrollViewRef = React.useRef(null);
  const { fromUserJid = '', fromUserId = '' } = replyMsgItems;
  const profileDetails = useSelector(state => state.navigation.profileDetails);
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  const isSameUser = fromUserJid === currentUserJID;
  const averageMessageHeight = 60;

  const { nickName = profileDetails?.nickName } = useRosterData(
    isSameUser ? '' : fromUserId,
  );

  React.useEffect(() => {
    if (scrollViewRef.current && selectedMsgIndex !== undefined) {
      const scrollToPosition = selectedMsgIndex * averageMessageHeight;
      scrollViewRef.current.scrollTo({ y: scrollToPosition, animated: true });
    }
  }, [selectedMsgIndex]);

  const RemoveHandle = () => {
    handleRemove();
  };

  return (
    <ScrollView ref={scrollViewRef}>
      <View>
        <HStack justifyContent={'space-between'} alignItems={'center'}>
          {isSameUser ? (
            <Text
              color={'#000'}
              fontSize={14}
              pl={1}
              mb={1}
              fontWeight={600}
              py="0">
              You
            </Text>
          ) : (
            <Text
              mb={2}
              color={'#000'}
              pl={0}
              fontSize={14}
              fontWeight={600}
              py="0">
              {nickName || fromUserId}
            </Text>
          )}
          <Pressable
            style={{
              padding: 5,
              backgroundColor: '#FFF',
              borderRadius: 20,
            }}
            onPress={RemoveHandle}>
            <ClearTextIcon />
          </Pressable>
        </HStack>
        <Text numberOfLines={1} pl={2} fontSize={14} color="#313131">
          {replyMsgItems?.msgBody?.message}
        </Text>
      </View>
    </ScrollView>
  );
};

export default ReplyText;
