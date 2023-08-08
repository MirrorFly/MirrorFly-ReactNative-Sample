import {
  AlertDialog,
  HStack,
  Icon,
  IconButton,
  Pressable,
  Text,
  VStack,
  View,
} from 'native-base';
import React from 'react';
import Avathar from '../common/Avathar';
import MenuContainer from '../common/MenuContainer';
import {
  CloseIcon,
  DeleteIcon,
  FavouriteIcon,
  ForwardIcon,
  ReplyIcon,
  LeftArrowIcon,
} from '../common/Icons';
import  SDK from 'SDK/SDK';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import LastSeen from './LastSeen';
import { useSelector } from 'react-redux';

function ChatHeader(props) {
  const { fromUserJId } = props;
  const [remove, setRemove] = React.useState(false);
  const [nickName, setNickName] = React.useState('');
  const profileDetails = useSelector(state => state.navigation.profileDetails);

  const onClose = () => {
    setRemove(false);
  };
  const handleDelete = () => {
    setRemove(!remove);
  };

  const handleDeleteForMe = () => {
    setRemove(false);
  };

  const handleRemove = () => {
    props.setSelectedMsgs([]);
  };

  const handleFavourite = () => {
    console.log('Fav item');
  };

  const handleReply = () => {
    props.handleReply(props?.selectedMsgs[0].msgId);
  };

  const handleUserInfo = () => {
    props.setLocalNav('UserInfo');
  };

  React.useEffect(() => {
    (async () => {
      let userId = getUserIdFromJid(fromUserJId);
      if (!nickName) {
        let userDetails = await SDK.getUserProfile(userId);
        setNickName(userDetails?.data?.nickName || userId);
      }
    })();
  }, []);

  return (
    <>
      {props?.selectedMsgs.length <= 0 ? (
        <HStack
          h={'60px'}
          bg="#F2F2F2"
          justifyContent="space-between"
          alignItems="center"
          w="full">
          <HStack alignItems="center">
            <IconButton
              _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
              onPress={props.handleBackBtn}
              icon={<Icon as={() => LeftArrowIcon()} name="emoji-happy" />}
              borderRadius="full"
            />
            <Avathar
              width={36}
              height={36}
              backgroundColor={profileDetails?.colorCode}
              data={profileDetails?.nickName || nickName || '91'}
            />
            <Pressable w="65%" onPress={handleUserInfo}>
              {({ isPressed }) => {
                return (
                  <VStack
                    justifyItems={'center'}
                    pr="4"
                    py="3"
                    bg={isPressed ? 'rgba(0,0,0, 0.1)' : 'coolGray.100'}
                    pl="2">
                    <Text color="#181818" fontWeight="700" fontSize="14">
                      {profileDetails?.nickName || nickName}
                    </Text>
                    <LastSeen jid={fromUserJId} />
                  </VStack>
                );
              }}
            </Pressable>
          </HStack>
          <HStack pr="3">
            {props?.selectedMsgs?.length < 2 && (
              <MenuContainer menuItems={props.menuItems} />
            )}
          </HStack>
        </HStack>
      ) : (
        <>
          <View
            flexDirection={'row'}
            backgroundColor={'#F2F2F4'}
            alignItems={'center'}
            p="13"
            justifyContent={'space-between'}>
            <View
              flexDirection={'row'}
              justifyContent={'space-between'}
              alignItems={'center'}>
              <IconButton
                _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
                onPress={handleRemove}>
                <CloseIcon />
              </IconButton>
              <Text
                px="8"
                textAlign={'center'}
                fontSize={'18'}
                fontWeight={'400'}>
                {props?.selectedMsgs?.length}
              </Text>
            </View>
            <View
              flexDirection={'row'}
              justifyContent={'space-between'}
              alignItems={'center'}>
              <IconButton
                _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
                px="2"
                onPress={handleReply}>
                {props?.selectedMsgs?.length == 1 && <ReplyIcon />}
              </IconButton>
              <IconButton
                _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
                px="4"
                onPress={() => console.log('Forward icon pressed')}>
                <ForwardIcon />
              </IconButton>
              <IconButton
                _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
                px="3"
                onPress={handleFavourite}>
                <FavouriteIcon />
              </IconButton>
              <IconButton
                _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
                px="4"
                onPress={handleDelete}>
                <DeleteIcon />
              </IconButton>
              {props?.selectedMsgs?.length == 1 && (
                <MenuContainer menuItems={props.menuItems} />
              )}
            </View>
          </View>
        </>
      )}
      <AlertDialog isOpen={remove} onClose={onClose}>
        <AlertDialog.Content width={'85%'} borderRadius={0}>
          <AlertDialog.Body>
            <Text fontSize={'15'} fontWeight={'400'}>
              Are you sure you want to delete selected Message ?
            </Text>
            <HStack justifyContent={'flex-end'} py="3">
              <Pressable mr="6" onPress={() => setRemove(false)}>
                <Text color={'#3276E2'} fontWeight={'600'}>
                  CANCEL
                </Text>
              </Pressable>
              <Pressable onPress={handleDeleteForMe}>
                <Text color={'#3276E2'} fontWeight={'600'}>
                  DELETE FOR ME{' '}
                </Text>
              </Pressable>
            </HStack>
          </AlertDialog.Body>
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
}

export default ChatHeader;
