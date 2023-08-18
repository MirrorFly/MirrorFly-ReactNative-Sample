/* eslint-disable react-native/no-inline-styles */
import {
  CameraSmallIcon,
  VideoIcon,
  DocumentChatIcon,
  AudioMusicIcon,
  ContactChatIcon,
  LocationIcon,
} from 'common/Icons';
import { getMessageFromHistoryById } from 'Helper/Chat/ChatHelper';
import {
  getUserIdFromJid,
  millisToMinutesAndSeconds,
} from 'Helper/Chat/Utility';
import { HStack, Image, Text, View } from 'native-base';
import React from 'react';
import { DocIcon, PdfIcon, PPTIcon, XLSIcon, ZipIcon } from '../common/Icons';
import { getExtension } from './chat/common/fileUploadValidation';
import { useSelector } from 'react-redux';

function ReplyMessage(props) {
  const fromUserJId = useSelector(state => state.navigation.fromUserJid);
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  const profileDetails = useSelector(state => state.navigation.profileDetails);
  const [repliedMsg, setRepliedMsg] = React.useState({});
  const { msgBody: { replyTo = '' } = {} } = props.message;
  const {
    msgBody: { message_type = '', message = '', media = {} } = {},
    fromUserJid = '',
  } = repliedMsg;
  const fileExtension = getExtension(media?.fileName, false);
  const imageUrl =
    'https://subli.info/wp-content/uploads/2015/05/google-maps-blur.png';

  const isSameUser = fromUserJid === currentUserJID;

  const renderFileIcon = React.useCallback(() => {
    switch (fileExtension) {
      case 'pdf':
        return <PdfIcon width={35} height={35} />;
      case 'ppt':
      case 'pptx':
        return <PPTIcon width={35} height={35} />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <XLSIcon width={35} height={35} />;
      case 'doc':
      case 'docx':
        return <DocIcon width={35} height={35} />;
      case 'zip':
      case 'rar':
        return <ZipIcon width={35} height={35} />;
      case 'txt':
      case 'text':
        return <DocIcon width={35} height={35} />;
      default:
        return null;
    }
  }, [fileExtension]);

  React.useEffect(() => {
    setRepliedMsg(
      getMessageFromHistoryById(getUserIdFromJid(fromUserJId), replyTo),
    );
  }, []);

  const durationString = millisToMinutesAndSeconds(media.duration);

  if (message_type === 'text') {
    return (
      <View
        mt="1"
        px="4"
        py="1"
        mb="1"
        borderRadius={7}
        bgColor={props.isSame ? '#D0D8EB' : '#EFEFEF'}>
        <Text numberOfLines={1} ellipsizeMode="tail" fontWeight={'bold'}>
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

  if (message_type === 'image' || message_type === 'video') {
    return (
      <View
        mt="1"
        mb="1"
        position={'relative'}
        minW={200}
        minH={60}
        borderRadius={7}
        bgColor={props.isSame ? '#D0D8EB' : '#EFEFEF'}
        py="1"
        px={'3'}>
        <Text
          numberOfLines={1}
          fontSize={14}
          ellipsizeMode="tail"
          fontWeight={'bold'}>
          {!isSameUser
            ? profileDetails?.nickName || getUserIdFromJid(fromUserJId)
            : 'You'}
        </Text>
        <HStack mt="1" alignItems={'center'} pl={1}>
          <CameraSmallIcon color={'#7285B5'} width={13} height={13} />
          <Text pl={1} fontSize={14} color="#313131" fontWeight={400}>
            Photo
          </Text>
        </HStack>
        <View
          style={{
            width: 60,
            height: 60,
            position: 'absolute',
            right: 0,
            borderBottomRightRadius: 5,
            borderTopRightRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            alt="reply-img"
            resizeMode="cover"
            style={{
              width: 60,
              height: 60,
              borderTopRightRadius: 5,
              borderBottomRightRadius: 5,
            }}
            source={{
              uri: `data:image/png;base64,${media?.thumb_image}`,
            }}
          />
        </View>
      </View>
    );
  }
  if (message_type === 'audio') {
    return (
      <View
        mt="1"
        mb="1"
        position={'relative'}
        minW={200}
        minH={60}
        borderRadius={7}
        bgColor={props.isSame ? '#D0D8EB' : '#EFEFEF'}
        py="1"
        px={'3'}>
        <Text
          numberOfLines={1}
          fontSize={14}
          ellipsizeMode="tail"
          fontWeight={'bold'}>
          {!isSameUser
            ? profileDetails?.nickName || getUserIdFromJid(fromUserJId)
            : 'You'}
        </Text>
        <Text color="#313131" mt="1" fontSize={14} fontWeight={400}>
          {durationString}
        </Text>
        <View
          style={{
            width: 60,
            height: 60,
            backgroundColor: '#97A5C7',
            position: 'absolute',
            right: 0,
            borderBottomRightRadius: 5,
            borderTopRightRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <AudioMusicIcon width="22" height="22" color={'#fff'} />
        </View>
      </View>
    );
  }
  if (message_type === 'file') {
    return (
      <View
        mt="1"
        mb="1"
        position={'relative'}
        minW={250}
        minH={60}
        borderRadius={7}
        bgColor={props.isSame ? '#D0D8EB' : '#EFEFEF'}
        py="1"
        px={'3'}>
        <Text
          width={200}
          numberOfLines={1}
          fontSize={14}
          ellipsizeMode="tail"
          fontWeight={'bold'}>
          {!isSameUser
            ? profileDetails?.nickName || getUserIdFromJid(fromUserJId)
            : 'You'}
        </Text>
        <HStack mt="1" alignItems={'center'}>
          <DocumentChatIcon
            width="12"
            height="12"
            color={props.isSame ? '#7285B5' : '#959595'}
          />
          <Text
            width={200}
            numberOfLines={1}
            pl={1}
            ellipsizeMode="tail"
            color="#313131"
            fontSize={14}
            fontWeight={400}>
            {media?.fileName}
          </Text>
        </HStack>
        <View
          style={{
            width: 60,
            height: 60,
            position: 'absolute',
            right: 0,
            backgroundColor: props.isSame ? '#fff' : '#A9A9A9',
            borderBottomRightRadius: 5,
            borderTopRightRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {renderFileIcon()}
        </View>
      </View>
    );
  }

  if (message_type === 'contact') {
    return (
      <View
        mt="1"
        mb="1"
        px="2"
        py="1"
        borderRadius={7}
        bgColor={props.isSame ? '#D0D8EB' : '#EFEFEF'}>
        <Text
          numberOfLines={1}
          fontSize={11}
          ellipsizeMode="tail"
          fontWeight={'bold'}>
          {!isSameUser
            ? profileDetails?.nickName || getUserIdFromJid(fromUserJId)
            : 'You'}
        </Text>
        <HStack alignItems={'center'} pl={1}>
          <ContactChatIcon
            width="12"
            height="12"
            color={props.isSame ? '#7285B5' : '#959595'}
          />
          <Text pl={1} color="#313131" fontSize={12} fontWeight={400}>
            Contact: Afzal Qa
          </Text>
        </HStack>
      </View>
    );
  }

  if (message_type === 'location') {
    return (
      <View
        mt="1"
        px="2"
        mb="1"
        py="1"
        minW={200}
        borderRadius={7}
        bgColor={props.isSame ? '#D0D8EB' : '#EFEFEF'}>
        <Text
          numberOfLines={1}
          fontSize={11}
          ellipsizeMode="tail"
          fontWeight={'bold'}>
          {!isSameUser
            ? profileDetails?.nickName || getUserIdFromJid(fromUserJId)
            : 'You'}
        </Text>

        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
          }}>
          <Image
            resizeMode="cover"
            style={{
              width: 45,
              height: 43,
              borderTopRightRadius: 5,
              borderBottomRightRadius: 5,
            }}
            source={{ uri: imageUrl }}
          />
        </View>

        <HStack alignItems={'center'} pl={1}>
          <LocationIcon
            width="12"
            height="10"
            color={props.isSame ? '#7285B5' : '#959595'}
          />
          <Text pl={2} fontSize={12} color={'#313131'} fontWeight={400}>
            Location
          </Text>
        </HStack>
      </View>
    );
  }
}

export default ReplyMessage;
