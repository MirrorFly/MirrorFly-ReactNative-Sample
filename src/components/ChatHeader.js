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
import SDK from 'SDK/SDK';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import LastSeen from './LastSeen';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { FORWARD_MESSSAGE_SCREEN } from '../constant';

const forwardMediaMessageTypes = {
  image: true,
  video: true,
  audio: true,
  file: true,
};

function ChatHeader({
  fromUserJId,
  selectedMsgs,
  setSelectedMsgs,
  menuItems,
  handleBackBtn,
  handleReply,
  setLocalNav,
}) {
  const navigation = useNavigation();
  const [remove, setRemove] = React.useState(false);
  const [nickName, setNickName] = React.useState('');
  const profileDetails = useSelector(state => state.navigation.profileDetails);
  const vCardProfile = useSelector(state => state.profile.profileDetails);

  React.useEffect(() => {
    getUserProfile();
  }, []);

  const getUserProfile = async () => {
    let userId = getUserIdFromJid(fromUserJId);
    if (!nickName) {
      let userDetails = await SDK.getUserProfile(userId);
      setNickName(userDetails?.data?.nickName || userId);
    }
  };

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
    setSelectedMsgs([]);
  };

  const handleFavourite = () => {
    console.log('Fav item');
  };

  const handleReplyMessage = () => {
    handleReply(selectedMsgs[0]);
  };

  const handleUserInfo = () => {
    setLocalNav('UserInfo');
  };

  const handleForwardMessage = () => {
    navigation.navigate(FORWARD_MESSSAGE_SCREEN, {
      forwardMessages: selectedMsgs,
      onMessageForwaded: handleRemove,
    });
  };

  const renderForwardIcon = () => {
    if (selectedMsgs?.length === 1) {
      const currentUserId = vCardProfile?.userId;
      const _message = selectedMsgs[0];
      const localPath = _message?.msgBody?.media?.local_path;
      // checking for the message is not text and is_downloaded === 2
      const isDownloadedOrUploaded =
        _message?.publisherId === currentUserId
          ? _message?.msgBody?.media?.is_uploading === 2
          : Boolean(localPath) || _message?.msgBody?.media?.is_downloaded === 2;
      const isAllowForward = forwardMediaMessageTypes[
        _message?.msgBody?.message_type
      ]
        ? isDownloadedOrUploaded
        : true;
      return _message?.msgStatus !== 3 && isAllowForward ? (
        <IconButton
          _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
          px="4"
          onPress={handleForwardMessage}>
          <ForwardIcon />
        </IconButton>
      ) : null;
    } else {
      return null;
    }
  };

  return (
    <>
      {selectedMsgs?.length <= 0 ? (
        <HStack
          h={'60px'}
          bg="#F2F2F2"
          justifyContent="space-between"
          alignItems="center"
          borderBottomColor={'#C1C1C1'}
          borderBottomWidth={1}
          style={{
            elevation: 2,
            shadowColor: '#181818',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
          }}
          w="full">
          <HStack alignItems="center">
            <IconButton
              _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
              onPress={handleBackBtn}
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
            {selectedMsgs?.length < 2 && (
              <MenuContainer menuItems={menuItems} />
            )}
          </HStack>
        </HStack>
      ) : (
        <View
          style={{
            elevation: 2,
            shadowColor: '#181818',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
          }}
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
              {selectedMsgs?.length}
            </Text>
          </View>
          <View
            flexDirection={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}>
            <IconButton
              _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
              px="2"
              onPress={handleReplyMessage}>
              {selectedMsgs?.length === 1 && <ReplyIcon />}
            </IconButton>
            {renderForwardIcon()}
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
            {selectedMsgs?.length === 1 && (
              <MenuContainer menuItems={menuItems} />
            )}
          </View>
        </View>
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
                  DELETE FOR ME
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
