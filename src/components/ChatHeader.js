import { useNavigation } from '@react-navigation/native';
import SDK from 'SDK/SDK';
import {
  Checkbox,
  HStack,
  Icon,
  IconButton,
  Modal,
  Pressable,
  Text,
  VStack,
  View,
  Input,
} from 'native-base';
import React, { useRef } from 'react';
import { Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import Avathar from '../common/Avathar';
import {
  CloseIcon,
  DeleteIcon,
  DownArrowIcon,
  FavouriteIcon,
  ForwardIcon,
  LeftArrowIcon,
  ReplyIcon,
  UpArrowIcon,
} from '../common/Icons';
import MenuContainer from '../common/MenuContainer';
import LastSeen from './LastSeen';
import {
  setConversationSearchText,
  clearConversationSearchData,
  updateConversationSearchMessageIndex,
} from '../redux/Actions/conversationSearchAction';
import { showToast } from 'Helper/index';
import { FORWARD_MESSSAGE_SCREEN } from '../constant';
import useRosterData from 'hooks/useRosterData';
import ApplicationColors from 'config/appColors';
import { touchEffect } from 'config/appTheme';

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
  chatInputRef,
  IsSearching,
  isSearchClose,
  chatUserProfile,
}) {
  let selectedMsg = {};
  if (selectedMsgs.length) {
    selectedMsg = selectedMsgs[0];
  }
  const { msgBody: { media: { file = {}, local_path = '' } = {} } = {} } =
    selectedMsg;
  const imageUrl = local_path || file?.fileDetails?.uri;
  const navigation = useNavigation();
  const [remove, setRemove] = React.useState(false);
  const [deleteEveryOne, setDeleteEveryOne] = React.useState(false);
  const profileDetails = useSelector(state => state.navigation.profileDetails);
  const vCardProfile = useSelector(state => state.profile.profileDetails);
  const [isSelected, setSelection] = React.useState(false);
  const {
    searchText: conversationSearchText,
    messageIndex: conversationSearchMessageIndex,
    totalSearchResults: conversationSearchTotalSearchResults,
  } = useSelector(state => state?.conversationSearchData) || {};
  const dispatch = useDispatch();

  const searchInputRef = useRef();

  React.useEffect(() => {
    return () => {
      dispatch(clearConversationSearchData());
    };
  }, []);

  React.useEffect(() => {
    if (IsSearching) {
      // focusing the input with setTimeout to focus to avoid some strange issue in react native
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 200);
    }
  }, [IsSearching]);

  const fromUserId = React.useMemo(
    () => getUserIdFromJid(fromUserJId),
    [fromUserJId],
  );

  let { nickName, image: profileImage, colorCode } = useRosterData(fromUserId);
  // updating default values
  nickName = nickName || chatUserProfile?.nickName || fromUserId || '';
  profileImage = profileImage || '';
  colorCode = colorCode || profileDetails?.colorCode;

  const onClose = () => {
    setRemove(false);
  };

  const handleDelete = () => {
    let msgIds = selectedMsgs
      .sort((a, b) => (b.timestamp > a.timestamp ? -1 : 1))
      .map(el => el.msgId);
    let lastMsgIndex = selectedMsgs.findIndex(obj => obj.msgId === msgIds[0]);
    let lastMsgTime = parseInt(selectedMsgs[lastMsgIndex].timestamp / 1000, 10);
    const now = new Date().getTime();
    const validTime = lastMsgTime + 30 * 1000;
    const isSender = selectedMsgs.every(
      msg => msg.publisherId === vCardProfile.userId && msg.deleteStatus === 0,
    );
    setDeleteEveryOne(validTime > now && isSender);
    setRemove(!remove);
  };

  const handleDeleteForMe = async deleteType => {
    let msgIds = selectedMsgs
      .slice()
      .sort((a, b) => (b.timestamp > a.timestamp ? -1 : 1))
      .map(el => el.msgId);
    const jid = fromUserJId;
    setSelectedMsgs([]);
    if (deleteType === 1) {
      SDK.deleteMessagesForMe(jid, msgIds);
    } else {
      SDK.deleteMessagesForEveryone(jid, msgIds);
    }
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
    chatInputRef.current.focus();
  };

  const handleUserInfo = () => {
    setLocalNav('UserInfo');
  };

  const handleBackSearch = () => {
    isSearchClose();
    dispatch(clearConversationSearchData());
  };
  const handleForwardMessage = () => {
    navigation.navigate(FORWARD_MESSSAGE_SCREEN, {
      forwardMessages: selectedMsgs,
      onMessageForwaded: handleRemove,
    });
  };
  const handleSearchTextChange = text => {
    dispatch(setConversationSearchText(text));
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
      return _message?.msgStatus !== 3 &&
        !selectedMsgs[0]?.recall &&
        isAllowForward ? (
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

  const showNoMessageFoundToast = () => {
    const toastConfig = {
      id: 'conversation-search-no-message-found-toast',
    };
    showToast('No results found', toastConfig);
  };

  const handleMessageSearchIndexGoUp = () => {
    if (
      conversationSearchMessageIndex + 1 <
      conversationSearchTotalSearchResults
    ) {
      dispatch(
        updateConversationSearchMessageIndex(
          conversationSearchMessageIndex + 1,
        ),
      );
    } else {
      conversationSearchText.trim() && showNoMessageFoundToast();
    }
  };

  const handleMessageSearchIndexGoDown = () => {
    if (conversationSearchMessageIndex > 0) {
      dispatch(
        updateConversationSearchMessageIndex(
          conversationSearchMessageIndex - 1,
        ),
      );
    } else {
      conversationSearchText.trim() && showNoMessageFoundToast();
    }
  };

  if (IsSearching) {
    return (
      <HStack
        h={'60px'}
        bg="#F2F2F2"
        justifyContent="space-between"
        alignItems="center"
        borderBottomColor={'#C1C1C1'}
        borderBottomWidth={1}
        style={styles.RootContainer}
        w="full">
        <IconButton
          _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
          onPress={handleBackSearch}
          icon={<Icon as={() => LeftArrowIcon()} name="emoji-happy" />}
          borderRadius="full"
        />
        <View style={styles.TextInput}>
          <Input
            ref={searchInputRef}
            variant="underlined"
            placeholder=" Search..."
            value={conversationSearchText}
            fontSize={17}
            fontWeight={'400'}
            onChangeText={handleSearchTextChange}
            focusOutlineColor={ApplicationColors.mainColor}
            _input={{
              cursorColor: ApplicationColors.mainColor,
              selectionColor: ApplicationColors.mainColor,
            }}
          />
        </View>
        <TouchableOpacity
          onPress={handleMessageSearchIndexGoUp}
          style={styles.upAndDownArrow}>
          <UpArrowIcon />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleMessageSearchIndexGoDown}
          style={styles.upAndDownArrow}>
          <DownArrowIcon width={15} height={7} />
        </TouchableOpacity>
      </HStack>
    );
  }

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
          style={styles.headerContainer}
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
              backgroundColor={colorCode}
              data={nickName}
              profileImage={profileImage}
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
                      {nickName}
                    </Text>
                    <LastSeen jid={fromUserJId} />
                  </VStack>
                );
              }}
            </Pressable>
          </HStack>
          <HStack pr="3">
            {selectedMsgs?.length < 2 && menuItems.length > 0 && (
              <MenuContainer menuItems={menuItems} />
            )}
          </HStack>
        </HStack>
      ) : (
        <View
          style={styles.subContainer}
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
            {selectedMsgs[0]?.msgBody?.media?.is_uploading !== 1 &&
              !selectedMsgs[0]?.recall && (
                <IconButton
                  _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
                  px="2"
                  onPress={handleReplyMessage}>
                  {selectedMsgs?.length === 1 &&
                    selectedMsgs[0]?.msgStatus !== 3 && <ReplyIcon />}
                </IconButton>
              )}
            {renderForwardIcon()}
            {!selectedMsgs[0]?.recall && (
              <IconButton
                _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
                px="3"
                onPress={handleFavourite}>
                <FavouriteIcon />
              </IconButton>
            )}
            {selectedMsgs?.length < 2 &&
              selectedMsgs[0]?.msgBody?.media?.is_uploading !== 1 &&
              selectedMsgs[0]?.msgBody?.media?.is_downloaded !== 1 && (
                <IconButton
                  _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
                  px="4"
                  onPress={handleDelete}>
                  <DeleteIcon />
                </IconButton>
              )}
            {selectedMsgs?.length === 1 &&
              menuItems.length > 0 &&
              !selectedMsgs[0]?.recall && (
                <MenuContainer menuItems={menuItems} />
              )}
          </View>
        </View>
      )}
      <Modal isOpen={remove} safeAreaTop={true} onClose={onClose}>
        <Modal.Content
          w="88%"
          borderRadius={0}
          px="6"
          py="4"
          fontWeight={'300'}>
          <Text
            fontSize={'16'}
            fontWeight={'400'}
            numberOfLines={2}
            color={'#767676'}>
            Are you sure you want to delete selected Message?
          </Text>
          {imageUrl && (
            <HStack py={'3'}>
              <Checkbox
                value={isSelected}
                onValueChange={setSelection}
                style={styles.checkbox}
                _checked={{
                  backgroundColor: '#3276E2',
                  borderColor: '#3276E2',
                }}
                _pressed={{
                  backgroundColor: '#3276E2',
                  borderColor: '#3276E2',
                }}>
                <Text fontSize={'14'} fontWeight={'400'}>
                  Delete media from my phone
                </Text>
              </Checkbox>
            </HStack>
          )}
          {deleteEveryOne ? (
            <VStack justifyContent={'flex-end'} alignItems="flex-start" pt="5">
              <Pressable
                mb="4"
                py="1"
                px="2"
                onPress={() => handleDeleteForMe(1)}
                _pressed={touchEffect}>
                <Text color={'#3276E2'} fontWeight={'600'}>
                  DELETE FOR ME
                </Text>
              </Pressable>
              <Pressable
                mb="4"
                py="1"
                px="2"
                onPress={() => setRemove(false)}
                _pressed={touchEffect}>
                <Text color={'#3276E2'} fontWeight={'600'}>
                  CANCEL
                </Text>
              </Pressable>
              <Pressable
                mb="3"
                py="1"
                px="2"
                onPress={() => handleDeleteForMe(2)}
                _pressed={touchEffect}>
                <Text color={'#3276E2'} fontWeight={'600'}>
                  DELETE FOR EVERYONE
                </Text>
              </Pressable>
            </VStack>
          ) : (
            <HStack justifyContent={'flex-end'} py="3">
              <Pressable
                mr="4"
                py="1"
                px="2"
                onPress={() => setRemove(false)}
                _pressed={touchEffect}>
                <Text color={'#3276E2'} fontWeight={'600'}>
                  CANCEL
                </Text>
              </Pressable>
              <Pressable
                py="1"
                px="2"
                onPress={() => handleDeleteForMe(1)}
                _pressed={touchEffect}>
                <Text color={'#3276E2'} fontWeight={'600'}>
                  DELETE FOR ME
                </Text>
              </Pressable>
            </HStack>
          )}
        </Modal.Content>
      </Modal>
    </>
  );
}

export default ChatHeader;

const styles = StyleSheet.create({
  checkbox: {
    alignSelf: 'center',
    borderColor: '#3276E2',
  },
  headerContainer: {
    elevation: 2,
    shadowColor: '#181818',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  RootContainer: {
    elevation: 2,
    shadowColor: '#181818',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  subContainer: {
    elevation: 2,
    shadowColor: '#181818',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  TextInput: { flex: 1, marginLeft: 12 },
  upAndDownArrow: {
    marginHorizontal: 5,
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderRadius: 50,
  },
});
