import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Avathar from '../common/Avathar';
import {
  AudioMusicIcon,
  ContactChatIcon,
  DocumentChatIcon,
  LocationMarkerIcon,
  SandTimer,
  VideoSmallIcon,
  imageIcon as ImageIcon,
} from '../common/Icons';
import {
  convertUTCTOLocalTimeStamp,
  formatChatDateTime,
} from '../common/TimeStamp';
import useRosterData from '../hooks/useRosterData';
import {
  THIS_MESSAGE_WAS_DELETED,
  YOU_DELETED_THIS_MESSAGE,
} from '../Helper/Chat/Constant';
import no_messages from '../assets/no_messages.png';
import { getImageSource } from '../common/utils';
import Pressable from '../common/Pressable';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';
import { escapeRegExpReservedChars } from '../Helper';
import SDK from '../SDK/SDK';
import { updateRosterData } from '../redux/Actions/rosterAction';
import { addRecentChat } from '../redux/Actions/RecentChatAction';
import { sortBydate } from '../Helper/Chat/RecentChat';
import { formatUserIdToJid } from '../Helper/Chat/ChatHelper';
import { CHATSCREEN } from '../constant';
import { navigate } from '../redux/Actions/NavigationAction';
import * as RootNav from '../Navigation/rootNavigation';
import { updateRecentChatSelectedItems } from '../redux/Actions/recentChatSearchAction';

const VideoSmallIconComponent = () => VideoSmallIcon('#767676');

const RecentChatItem = ({
  item,
  index,
  isSame,
  isSelected,
  statusVisible,
  handleSelect,
  handleOnSelect,
  searchValue,
}) => {
  const _handlePress = () => {
    handleSelect(item);
  };
  const { profileDetails = {} } = item;
  let {
    nickName,
    userId = '',
    image,
    colorCode,
  } = useRosterData(item?.fromUserId);
  // updating default values
  nickName = nickName || profileDetails.nickName || item?.fromUserId || '';
  image = image || '';
  userId = userId || item?.fromUserId || '';
  colorCode = colorCode || profileDetails?.colorCode;

  const renderLastSentMessageBasedOnType = () => {
    switch (item?.msgBody?.message_type) {
      case 'text':
        return (
          <HighlightedMessage
            text={item?.msgBody?.message}
            searchValue={searchValue}
            index={index}
          />
        );
      case 'image':
        return (
          <View
            style={[styles.lastSentMessageWrapper, commonStyles.paddingLeft_4]}>
            <ImageIcon />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.lastSentMessageTypeText}>
              Image
            </Text>
          </View>
        );
      case 'video':
        return (
          <View
            style={[styles.lastSentMessageWrapper, commonStyles.paddingLeft_4]}>
            <VideoSmallIconComponent />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.lastSentMessageTypeText}>
              Video
            </Text>
          </View>
        );
      case 'file':
        return (
          <View
            style={[styles.lastSentMessageWrapper, commonStyles.paddingLeft_4]}>
            <DocumentChatIcon />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.lastSentMessageTypeText}>
              File
            </Text>
          </View>
        );
      case 'audio':
        return (
          <View
            style={[styles.lastSentMessageWrapper, commonStyles.paddingLeft_4]}>
            <AudioMusicIcon width="14" height="14" color={'#767676'} />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.lastSentMessageTypeText}>
              Audio
            </Text>
          </View>
        );
      case 'location':
        return (
          <View style={styles.lastSentMessageWrapper}>
            <LocationMarkerIcon width="23" height="23" color={'#000'} />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.lastSentMessageTypeText,
                commonStyles.paddingLeft_0,
              ]}>
              Location
            </Text>
          </View>
        );
      case 'contact':
        return (
          <View style={styles.lastSentMessageWrapper}>
            <ContactChatIcon />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.lastSentMessageTypeText]}>
              Contact
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View key={index}>
      <Pressable
        contentContainerStyle={[
          styles.recentChatItemContainer,
          isSelected && commonStyles.pressedBg,
        ]}
        onPress={_handlePress}
        onLongPress={() => {
          handleOnSelect(item);
        }}>
        <View
          style={[
            commonStyles.hstack,
            item.msgBody.message_type
              ? commonStyles.alignItemsCenter
              : commonStyles.alignItemsFlexStart,
          ]}>
          <Avathar
            data={nickName}
            backgroundColor={colorCode}
            profileImage={image}
          />
          <View style={[commonStyles.flex1, commonStyles.marginLeft_15]}>
            <HighlightedText
              text={nickName || userId}
              searchValue={searchValue}
              index={index}
            />

            {item.deleteStatus === 1 ? (
              <View style={styles.lastSentDeletedMessageContainer}>
                <Text style={styles.deletedMessageText}>
                  {isSame ? YOU_DELETED_THIS_MESSAGE : THIS_MESSAGE_WAS_DELETED}
                </Text>
              </View>
            ) : (
              <View style={styles.lastSentMessageContainer}>
                {isSame && item?.msgStatus !== 3 ? (
                  <View
                    style={[
                      styles.msgStatus,
                      isSame && Object.keys(item.msgBody).length
                        ? statusVisible
                        : '',
                    ]}
                  />
                ) : (
                  isSame &&
                  item?.msgStatus === 3 &&
                  Object.keys(item.msgBody).length > 0 && <SandTimer />
                )}
                {renderLastSentMessageBasedOnType()}
              </View>
            )}
          </View>
          <Text style={styles.lastMessageTimestamp}>
            {item?.createdAt &&
              formatChatDateTime(
                convertUTCTOLocalTimeStamp(item?.createdAt),
                'recent-chat',
              )}
          </Text>
        </View>
      </Pressable>
      <View style={styles.divider} />
    </View>
  );
};

export default function RecentChat() {
  const dispatch = useDispatch();
  const [filteredData, setFilteredData] = React.useState([]);
  const [filteredMessages, setFilteredMessages] = React.useState([]);
  const [recentData, setrecentData] = React.useState([]);
  const recentChatList = useSelector(state => state.recentChatData.data);
  const { isSearching, selectedItems, searchText, selectedItemsObj } =
    useSelector(state => state.recentChatSearchData) || {};

  const currentUserJID = useSelector(state => state.auth.currentUserJID);

  React.useEffect(() => {
    (async () => {
      const recentChats = await SDK.getRecentChatsDB();
      const recentChatsFilter = recentChats?.data.filter(
        item => item.chatType === 'chat',
      );
      dispatch(addRecentChat(recentChatsFilter));
      updateRosterDataForRecentChats(recentChatsFilter);
    })();
  }, []);

  React.useEffect(() => {
    let recentChatItems = constructRecentChatItems(recentChatList);
    setrecentData(recentChatItems);
  }, [recentChatList]);

  React.useEffect(() => {
    if (!searchText) {
      setFilteredData(recentData);
    } else {
      searchFilter(searchText);
    }
  }, [recentData, searchText]);

  const updateRosterDataForRecentChats = singleRecentChatList => {
    const userProfileDetails = singleRecentChatList.map(
      chat => chat.profileDetails,
    );
    dispatch(updateRosterData(userProfileDetails));
  };

  const constructRecentChatItems = recentChatArrayConstruct => {
    let recent = [];
    sortBydate([...recentChatArrayConstruct]).map(async chat => {
      recent.push(chat);
    });

    return recent.filter(eachmessage => eachmessage);
  };

  const searchFilter = text => {
    const filtered = recentData?.filter(
      item =>
        item.fromUserId.toLowerCase().includes(text.toLowerCase()) ||
        item?.profileDetails?.nickName
          ?.toLowerCase()
          .includes(text.toLowerCase()),
    );
    SDK.messageSearch(text).then(res => {
      if (res.statusCode === 200) {
        setFilteredMessages(res.data);
      }
    });
    setFilteredData(filtered);
  };

  const handleRecentItemSelect = item => {
    if (isSearching) {
      handleSelect(item);
    } else {
      const _item = { ...item };
      if (!_item.userJid) {
        _item.userJid = formatUserIdToJid(
          _item?.fromUserId,
        ); /** Need to add chat type here while working in Group
        formatUserIdToJid(
         item?.fromUserId,
         item?.chatType,
       )
       */
      }
      dispatch(updateRecentChatSelectedItems(_item));
    }
  };

  const handleSelect = item => {
    if (selectedItems.length) {
      handleRecentItemSelect(item);
    } else {
      let jid = formatUserIdToJid(
        item?.fromUserId,
      ); /** Need to add chat type here while working in Group
      formatUserIdToJid(
       item?.fromUserId,
       item?.chatType,
     )
     */
      SDK.activeChatUser(jid);
      let x = {
        screen: CHATSCREEN,
        fromUserJID: item?.userJid || jid,
        profileDetails: item?.profileDetails,
      };
      dispatch(navigate(x));
      RootNav.navigate(CHATSCREEN);
    }
  };

  const renderItem = (item, index) => {
    const isSame = currentUserJID?.split('@')[0] === item?.publisherId;
    const jid =
      item?.userJid ||
      formatUserIdToJid(
        item?.fromUserId,
      ); /** Need to add chat type here while working in Group
    formatUserIdToJid(
     item?.fromUserId,
     item?.chatType,
   )
   */
    const isSelected = selectedItemsObj[jid];
    let statusVisible;
    switch (item?.msgStatus) {
      case 0:
        statusVisible = styles.notDelivered;
        break;
      case 1:
        statusVisible = styles.delivered;
        break;
      case 2:
        statusVisible = styles.seen;
        break;
    }
    return (
      <RecentChatItem
        key={item?.fromUserId}
        item={item}
        index={index}
        isSame={isSame}
        isSelected={isSelected}
        statusVisible={statusVisible}
        handleOnSelect={handleRecentItemSelect}
        handleSelect={handleSelect}
        searchValue={searchText}
      />
    );
  };
  if (!filteredData.length && !filteredMessages.length) {
    return (
      <View style={styles.emptyChatView}>
        <Image
          style={styles.image}
          resizeMode="cover"
          source={getImageSource(no_messages)}
        />
        {isSearching ? (
          <Text style={styles.noMsg}>No Result Found</Text>
        ) : (
          <>
            <Text style={styles.noMsg}>No New Messages</Text>
            <Text>Any new messages will appear here</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      {searchText && filteredData.length > 0 && (
        <View style={styles.chatsSearchSubHeader}>
          <Text style={styles.chatsSearchSubHeaderText}>Chats</Text>
          <Text style={styles.chatsSearchSubHeaderCountText}>
            ({filteredData.length})
          </Text>
        </View>
      )}
      {filteredData.length > 0 &&
        filteredData.map((item, index) => renderItem(item, index))}
      {searchText && filteredMessages.length > 0 && (
        <View style={styles.chatsSearchSubHeader}>
          <Text style={styles.chatsSearchSubHeaderText}>Messages</Text>
          <Text style={styles.chatsSearchSubHeaderCountText}>
            ({filteredMessages.length})
          </Text>
        </View>
      )}
      {searchText &&
        filteredMessages.length > 0 &&
        filteredMessages.map((item, index) => renderItem(item, index))}
    </ScrollView>
  );
}

export const HighlightedText = ({ text, searchValue = '', index }) => {
  const parts = searchValue
    ? text.split(
        new RegExp(`(${escapeRegExpReservedChars(searchValue)})`, 'gi'),
      )
    : [text];

  return (
    <View style={commonStyles.hstack}>
      {parts.map((part, i) => {
        const isSearchMatch =
          part.toLowerCase() === searchValue.toLowerCase()
            ? styles.highlight
            : {};
        return (
          <Text
            numberOfLines={1}
            key={++i + '-' + index}
            ellipsizeMode="tail"
            style={[styles.highlightedText, isSearchMatch]}>
            {part}
          </Text>
        );
      })}
    </View>
  );
};

export const HighlightedMessage = ({ text, searchValue = '', index }) => {
  const parts = searchValue
    ? text.split(
        new RegExp(`(${escapeRegExpReservedChars(searchValue)})`, 'gi'),
      )
    : [text];

  return (
    <View style={commonStyles.hstack}>
      {parts.map((part, i) => {
        const isSearchMatch =
          part.toLowerCase() === searchValue.toLowerCase()
            ? styles.highlight
            : {};
        return (
          <Text
            numberOfLines={1}
            key={++i + '-' + index}
            ellipsizeMode="tail"
            style={[styles.highlightedMessageText, isSearchMatch]}>
            {part}
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  msgStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  bgClr: {
    backgroundColor: 'red',
  },
  notDelivered: {
    backgroundColor: '#818181',
  },
  delivered: {
    backgroundColor: '#FFA500',
  },
  seen: {
    backgroundColor: '#66E824',
  },
  highlight: {
    color: '#3276E2',
    fontWeight: 'bold',
  },
  lastSentDeletedMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  lastSentMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deletedMessageText: {
    marginBottom: 2,
    fontStyle: 'italic',
    fontSize: 14,
    color: '#313131',
  },
  lastSentMessageWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastSentMessageTypeText: {
    paddingHorizontal: 5,
    color: '#767676',
  },
  lastMessageTimestamp: {
    fontSize: 10,
    color: '#1f2937',
    alignSelf: 'flex-start',
  },
  divider: {
    width: '83%',
    height: 1,
    alignSelf: 'flex-end',
    backgroundColor: '#F2F2F2',
  },
  imageView: {
    flex: 0.72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
  noMsg: {
    color: '#181818',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyChatView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ApplicationColors.white,
  },
  scrollView: {
    padding: 0,
    flex: 1,
    backgroundColor: ApplicationColors.white,
  },
  chatsSearchSubHeader: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#E5E5E5',
  },
  chatsSearchSubHeaderText: {
    marginLeft: 8,
    color: '#181818',
    fontSize: 16,
    fontWeight: '500',
  },
  chatsSearchSubHeaderCountText: {
    color: '#181818',
    marginLeft: 2,
    fontSize: 16,
    fontWeight: '800',
  },
  recentChatItemContainer: {
    width: '100%',
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 20,
  },
  highlightedText: {
    color: '#1f2937',
    fontWeight: 'bold',
  },
  highlightedMessageText: {
    color: '#767676',
  },
});
