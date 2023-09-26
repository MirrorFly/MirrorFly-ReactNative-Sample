import {
  Box,
  Center,
  Divider,
  HStack,
  Icon,
  Pressable,
  ScrollView,
  Slide,
  Spacer,
  Spinner,
  Text,
  VStack,
  View,
} from 'native-base';
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import Avathar from '../common/Avathar';
import {
  AudioMusicIcon,
  ContactChatIcon,
  DocumentChatIcon,
  LocationMarkerIcon,
  SandTimer,
  VideoSmallIcon,
  imageIcon,
} from '../common/Icons';
import {
  convertUTCTOLocalTimeStamp,
  formatChatDateTime,
} from '../common/TimeStamp';
import { RECENTCHATLOADING } from '../constant';
import useRosterData from '../hooks/useRosterData';
import {
  THIS_MESSAGE_WAS_DELETED,
  YOU_DELETED_THIS_MESSAGE,
} from '../Helper/Chat/Constant';
import no_messages from '../assets/no_messages.png';
import { getImageSource } from '../common/utils';

const AudioIconFunc = () => (
  <AudioMusicIcon width="14" height="14" color={'#767676'} />
);

const LocationMarkerIconFunc = () => (
  <LocationMarkerIcon width="23" height="23" color={'#000'} />
);

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
          <HStack pl="1" alignItems={'center'}>
            <Icon as={imageIcon} />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              px={1}
              color="#767676"
              _dark={{ color: '#767676' }}>
              Image
            </Text>
          </HStack>
        );
      case 'video':
        return (
          <HStack pl="1" alignItems={'center'}>
            <Icon as={() => VideoSmallIcon('#767676')} />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              px={1}
              color="#767676"
              _dark={{ color: '#767676' }}>
              Video
            </Text>
          </HStack>
        );
      case 'file':
        return (
          <HStack pl="1" alignItems={'center'}>
            <Icon as={DocumentChatIcon} />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              px={1}
              color="#767676"
              _dark={{ color: '#767676' }}>
              File
            </Text>
          </HStack>
        );
      case 'audio':
        return (
          <HStack pl="1" alignItems={'center'}>
            <Icon as={AudioIconFunc} />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              px={1}
              color="#767676"
              _dark={{ color: '#767676' }}>
              Audio
            </Text>
          </HStack>
        );
      case 'location':
        return (
          <HStack alignItems={'center'}>
            <Icon as={LocationMarkerIconFunc} />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              color="#767676"
              _dark={{ color: '#767676' }}>
              Location
            </Text>
          </HStack>
        );
      case 'contact':
        return (
          <HStack alignItems={'center'}>
            <Icon as={ContactChatIcon} />
            <Text
              numberOfLines={1}
              ml={1}
              ellipsizeMode="tail"
              color="#767676"
              _dark={{ color: '#767676' }}>
              Contact
            </Text>
          </HStack>
        );
      default:
        return null;
    }
  };

  return (
    <Box key={index}>
      <Pressable
        py="2"
        android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
        onPress={_handlePress}
        onLongPress={() => {
          handleOnSelect(item);
        }}
        _dark={{ bg: 'coolGray.800' }}
        _light={{ bg: isSelected ? '#E2E2E2' : 'white' }}>
        <Box pl="4" pr="5" py="2">
          <HStack
            space={3}
            alignItems={item.msgBody.message_type ? 'center' : 'flex-start'}>
            <Avathar
              data={nickName}
              backgroundColor={colorCode}
              profileImage={image}
            />
            <VStack w="60%">
              <HighlightedText
                text={nickName || userId}
                searchValue={searchValue}
                index={index}
              />

              {item.deleteStatus === 1 ? (
                <HStack mt={'1'} alignItems={'center'}>
                  <Text
                    mb={'0.5'}
                    style={styles.message}
                    fontStyle={'italic'}
                    fontSize={14}
                    color={'#313131'}>
                    {isSame
                      ? YOU_DELETED_THIS_MESSAGE
                      : THIS_MESSAGE_WAS_DELETED}
                  </Text>
                </HStack>
              ) : (
                <HStack alignItems={'center'}>
                  {isSame && item?.msgStatus !== 3 ? (
                    <View
                      mr="1"
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
                    Object.keys(item.msgBody).length > 0 && (
                      <Icon px="3" as={SandTimer} name="emoji-happy" />
                    )
                  )}
                  {renderLastSentMessageBasedOnType()}
                </HStack>
              )}
            </VStack>
            <Spacer />
            <Text
              fontSize="xs"
              color="coolGray.800"
              _dark={{ color: 'warmGray.50' }}
              alignSelf="flex-start">
              {item?.createdAt &&
                formatChatDateTime(
                  convertUTCTOLocalTimeStamp(item?.createdAt),
                  'recent-chat',
                )}
            </Text>
          </HStack>
        </Box>
      </Pressable>
      <Divider
        w="83%"
        alignSelf="flex-end"
        _light={{ bg: '#f2f2f2' }}
        _dark={{ bg: 'muted.50' }}
      />
    </Box>
  );
};

export default function RecentChat(props) {
  const {
    searchValue,
    handleOnSelect,
    handleSelect,
    recentItem,
    filteredMessages,
  } = props;
  const recentLoading = useSelector(state => state.chat.recentChatStatus);

  const currentUserJID = useSelector(state => state.auth.currentUserJID);

  const renderItem = (item, index) => {
    const isSame = currentUserJID?.split('@')[0] === item?.publisherId;
    const isSelected = recentItem.some(selectedItem =>
      selectedItem?.userJid
        ? selectedItem?.userJid === item?.userJid
        : selectedItem?.toUserId === item?.toUserId,
    );
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
        handleOnSelect={handleOnSelect}
        handleSelect={handleSelect}
        searchValue={searchValue}
      />
    );
  };
  if (!props?.data?.length && !filteredMessages.length) {
    return (
      <Center h="full" bgColor={'#fff'}>
        <Image
          style={styles.image}
          resizeMode="cover"
          source={getImageSource(no_messages)}
        />
        {props.isSearching ? (
          <Text style={styles.noMsg}>No Result Found</Text>
        ) : (
          <>
            <Text style={styles.noMsg}>No New Messages</Text>
            <Text>Any new messages will appear here</Text>
          </>
        )}
      </Center>
    );
  }

  if (recentLoading === RECENTCHATLOADING) {
    return (
      <Slide mt="20" in={recentLoading === RECENTCHATLOADING} placement="top">
        <HStack space={8} justifyContent="center" alignItems="center">
          <Spinner size="lg" color={'#3276E2'} />
        </HStack>
      </Slide>
    );
  }

  return (
    <ScrollView p="0" flex={1} bg={'#fff'}>
      {searchValue && props.data.length > 0 && (
        <View
          width={'100%'}
          height={10}
          bg={'#E5E5E5'}
          justifyContent={'center'}>
          <HStack>
            <Text ml={2} color={'#181818'} fontSize={16} fontWeight={'500'}>
              Chats
            </Text>
            <Text ml={'0.5'} fontSize={16} fontWeight={'700'}>
              ({props.data.length})
            </Text>
          </HStack>
        </View>
      )}
      {props.data.length > 0 &&
        props.data.map((item, index) => renderItem(item, index))}
      {/* <SwipeListView
        showsVerticalScrollIndicator={false}
        data={props.data}
        renderItem={renderItem}
        rightOpenValue={-130}
        previewRowKey={'0'}
        previewOpenValue={-40}
        previewOpenDelay={3000}
        onRowDidOpen={onRowDidOpen}
      /> */}
      {searchValue && filteredMessages.length > 0 && (
        <View
          width={'100%'}
          height={10}
          bg={'#E5E5E5'}
          justifyContent={'center'}>
          <HStack>
            <Text ml={2} color={'#181818'} fontSize={16} fontWeight={'500'}>
              Messages
            </Text>
            <Text ml={'0.5'} fontSize={16} fontWeight={'700'}>
              ({filteredMessages.length})
            </Text>
          </HStack>
        </View>
      )}
      {
        searchValue &&
          filteredMessages.length > 0 &&
          filteredMessages.map((item, index) => renderItem(item, index))
        // <SwipeListView
        //   showsVerticalScrollIndicator={false}
        //   data={filteredMessages}
        //   renderItem={renderItem}
        //   rightOpenValue={-130}
        //   previewRowKey={'0'}
        //   previewOpenValue={-40}
        //   previewOpenDelay={3000}
        //   onRowDidOpen={onRowDidOpen}
        // />
      }
    </ScrollView>
  );
}

export const HighlightedText = ({ text, searchValue = '', index }) => {
  const parts = searchValue
    ? text.split(new RegExp(`(${searchValue})`, 'gi'))
    : [text];

  return (
    <HStack>
      {parts.map((part, i) => {
        const isSearchMatch =
          part.toLowerCase() === searchValue.toLowerCase()
            ? styles.highlight
            : {};
        return (
          <Text
            numberOfLines={1}
            color="coolGray.800"
            key={++i + '-' + index}
            dark={{ color: 'warmGray.50' }}
            ellipsizeMode="tail"
            bold
            style={isSearchMatch}>
            {part}
          </Text>
        );
      })}
    </HStack>
  );
};

export const HighlightedMessage = ({ text, searchValue = '', index }) => {
  const parts = searchValue
    ? text.split(new RegExp(`(${searchValue})`, 'gi'))
    : [text];

  return (
    <HStack>
      {parts.map((part, i) => {
        const isSearchMatch =
          part.toLowerCase() === searchValue.toLowerCase()
            ? styles.highlight
            : {};
        return (
          <Text
            color="#767676"
            numberOfLines={1}
            key={++i + '-' + index}
            ellipsizeMode="tail"
            style={isSearchMatch}>
            {part}
          </Text>
        );
      })}
    </HStack>
  );
};

const styles = StyleSheet.create({
  msgStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
});
