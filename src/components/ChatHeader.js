import { useNavigation } from '@react-navigation/native';
import SDK from '../SDK/SDK';
import { Checkbox } from 'native-base';
import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { showToast } from '../Helper/index';
import { FORWARD_MESSSAGE_SCREEN } from '../constant';
import useRosterData from '../hooks/useRosterData';
import ApplicationColors from '../config/appColors';
import { navigate } from '../redux/Actions/NavigationAction';
import ChatSearchInput from './ChatSearchInput';
import commonStyles from '../common/commonStyles';
import Modal, { ModalCenteredContent } from '../common/Modal';
import Pressable from '../common/Pressable';
import IconButton from '../common/IconButton';

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
  selectedMsgsIdRef,
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
    selectedMsgsIdRef.current = {};
    setSelectedMsgs([]);
    if (deleteType === 1) {
      SDK.deleteMessagesForMe(jid, msgIds);
    } else {
      SDK.deleteMessagesForEveryone(jid, msgIds);
    }
    setRemove(false);
  };

  const handleRemove = () => {
    selectedMsgsIdRef.current = {};
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
    dispatch(navigate({ notificationCheck: 'CHANGED' }));
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
          style={[commonStyles.padding_10_15]}
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
      <View style={styles.RootContainer}>
        <IconButton onPress={handleBackSearch}>{LeftArrowIcon()}</IconButton>
        <View style={styles.TextInput}>
          <ChatSearchInput
            inputRef={searchInputRef}
            placeholder=" Search..."
            value={conversationSearchText}
            onChangeText={handleSearchTextChange}
            cursorColor={ApplicationColors.mainColor}
            style={styles.chatSearchInput}
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
      </View>
    );
  }

  return (
    <>
      {selectedMsgs?.length <= 0 ? (
        <View style={styles.headerContainer}>
          <IconButton onPress={handleBackBtn}>{LeftArrowIcon()}</IconButton>
          <Pressable
            onPress={handleUserInfo}
            style={commonStyles.flex1}
            contentContainerStyle={styles.userAvatharAndInfoContainer}>
            <Avathar
              width={36}
              height={36}
              backgroundColor={colorCode}
              data={nickName}
              profileImage={profileImage}
            />
            <View style={styles.userNameAndLastSeenContainer}>
              <Text style={styles.userNameText}>{nickName}</Text>
              <LastSeen jid={fromUserJId} />
            </View>
          </Pressable>
          <View style={styles.menuIconContainer}>
            {selectedMsgs?.length < 2 && menuItems.length > 0 && (
              <MenuContainer menuItems={menuItems} />
            )}
          </View>
        </View>
      ) : (
        <View style={styles.subContainer}>
          <View style={styles.selectedMsgsTextContainer}>
            <IconButton onPress={handleRemove}>
              <CloseIcon />
            </IconButton>
            <Text style={styles.selectedMsgsText}>{selectedMsgs?.length}</Text>
          </View>
          <View style={styles.selectedMsgsActionsContainer}>
            {selectedMsgs[0]?.msgBody?.media?.is_uploading !== 1 &&
              !selectedMsgs[0]?.recall && (
                <IconButton
                  style={[commonStyles.padding_10_15]}
                  onPress={handleReplyMessage}>
                  {selectedMsgs?.length === 1 &&
                    selectedMsgs[0]?.msgStatus !== 3 && <ReplyIcon />}
                </IconButton>
              )}
            {renderForwardIcon()}
            {!selectedMsgs[0]?.recall && (
              <IconButton
                style={[commonStyles.padding_10_15]}
                onPress={handleFavourite}>
                <FavouriteIcon />
              </IconButton>
            )}
            {selectedMsgs?.length < 2 &&
              selectedMsgs[0]?.msgBody?.media?.is_uploading !== 1 &&
              selectedMsgs[0]?.msgBody?.media?.is_downloaded !== 1 && (
                <IconButton
                  style={[commonStyles.padding_10_15]}
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
      <Modal visible={remove} onRequestClose={onClose}>
        <ModalCenteredContent onPressOutside={onClose}>
          <View style={styles.deleteModalContentContainer}>
            <Text style={styles.deleteModalContentText} numberOfLines={2}>
              Are you sure you want to delete selected Message?
            </Text>
            {imageUrl && (
              <View
                style={[commonStyles.hstack, commonStyles.paddingVertical_12]}>
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
                  <Text style={styles.deleteModalCheckboxLabel}>
                    Delete media from my phone
                  </Text>
                </Checkbox>
              </View>
            )}
            {deleteEveryOne ? (
              <View style={styles.deleteModalVerticalActionButtonsContainer}>
                <Pressable
                  contentContainerStyle={styles.deleteModalVerticalActionButton}
                  onPress={() => handleDeleteForMe(1)}>
                  <Text style={styles.deleteModalActionButtonText}>
                    DELETE FOR ME
                  </Text>
                </Pressable>
                <Pressable
                  contentContainerStyle={styles.deleteModalVerticalActionButton}
                  onPress={() => setRemove(false)}>
                  <Text style={styles.deleteModalActionButtonText}>CANCEL</Text>
                </Pressable>
                <Pressable
                  contentContainerStyle={styles.deleteModalVerticalActionButton}
                  onPress={() => handleDeleteForMe(2)}>
                  <Text style={styles.deleteModalActionButtonText}>
                    DELETE FOR EVERYONE
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.deleteModalHorizontalActionButtonsContainer}>
                <Pressable
                  contentContainerStyle={[
                    styles.deleteModalHorizontalActionButton,
                    commonStyles.marginRight_16,
                  ]}
                  onPress={() => setRemove(false)}>
                  <Text style={styles.deleteModalActionButtonText}>CANCEL</Text>
                </Pressable>
                <Pressable
                  contentContainerStyle={
                    styles.deleteModalHorizontalActionButton
                  }
                  onPress={() => handleDeleteForMe(1)}>
                  <Text style={styles.deleteModalActionButtonText}>
                    DELETE FOR ME
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </ModalCenteredContent>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 60,
    backgroundColor: ApplicationColors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: ApplicationColors.mainBorderColor,
    elevation: 2,
    shadowColor: '#181818',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  RootContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 60,
    backgroundColor: '#F2F2F2',
    borderBottomColor: ApplicationColors.mainBorderColor,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#181818',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  subContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 13,
    backgroundColor: ApplicationColors.headerBg,
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
  chatSearchInput: {
    fontSize: 17,
    fontWeight: '400',
    borderBottomWidth: 1,
    borderBottomColor: ApplicationColors.mainBorderColor,
  },
  userAvatharAndInfoContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNameAndLastSeenContainer: {
    justifyItems: 'center',
    paddingRight: 16,
    paddingLeft: 8,
    paddingVertical: 12,
  },
  userNameText: {
    color: '#181818',
    fontWeight: '700',
    fontSize: 14,
  },
  menuIconContainer: {
    paddingRight: 12,
  },
  selectedMsgsTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedMsgsText: {
    marginLeft: 30,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '400',
  },
  selectedMsgsActionsContainer: {
    // backgroundColor: 'salmon',
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteModalContentContainer: {
    width: '88%',
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontWeight: '300',
    backgroundColor: ApplicationColors.mainbg,
  },
  deleteModalContentText: {
    fontSize: 16,
    fontWeight: '400',
    color: ApplicationColors.modalTextColor,
    marginTop: 10,
  },
  deleteModalCheckboxLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  deleteModalVerticalActionButtonsContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingTop: 20,
  },
  deleteModalVerticalActionButton: {
    marginBottom: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteModalActionButtonText: {
    color: ApplicationColors.mainColor,
    fontWeight: '600',
  },
  deleteModalHorizontalActionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 12,
  },
  deleteModalHorizontalActionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});
