import {
  GalleryAllIcon,
  CameraSmallIcon,
  VideoSmallIcon,
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
  const imageUrl = 'https://subli.info/wp-content/uploads/2015/05/google-maps-blur.png';

  console.log('repliedMsg', media);

  const isSameUser = fromUserJid === currentUserJID;

  const renderFileIcon = React.useCallback(() => {
    switch (fileExtension) {
      case 'pdf':
        return <PdfIcon width={10} height={15} />;
      case 'ppt':
      case 'pptx':
        return <PPTIcon width={10} height={15} />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <XLSIcon width={10} height={15} />;
      case 'doc':
      case 'docx':
        return <DocIcon width={10} height={15} />;
      case 'zip':
      case 'rar':
        return <ZipIcon width={10} height={15} />;
      case 'txt':
      case 'text':
        return <DocIcon width={10} height={15} />;
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
      //---- Reply Text -------

      <View
        mt="1"
        px="4"
        py="1"
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

      //---Image Reply ------

      // <View
      //   mt="1"
      //   px="1"
      //   py="1"
      //   borderRadius={7}
      //   bgColor={props.isSame ? '#D0D8EB' : '#EFEFEF'}>
      //   <Text numberOfLines={1} fontSize={11} ellipsizeMode="tail" fontWeight={'bold'}>
      //     {!isSameUser
      //       ? profileDetails?.nickName || getUserIdFromJid(fromUserJId)
      //       : 'You'}
      //   </Text>

      //   <View
      //   style={{
      //     width: 30,
      //     height: 14,
      //     position: 'absolute',
      //     top: 0,
      //     bottom: 0,
      //     right: 0,

      //   }}>
      //    <Image
      //       resizeMode="cover"
      //       style={{ width: 30, height: 43, borderTopRightRadius:5,borderBottomRightRadius:5 }}
      //       source={{
      //         uri: `data:image/png;base64,${media?.thumb_image}`,
      //       }}
      //     />
      //   </View>

      //  <HStack alignItems={'center'} pl={1}>
      //   <CameraSmallIcon  color={props.isSame ?"#7285B5": "#959595"} />
      //   <Text pl={1} fontSize={12} color="#313131" fontWeight={400}>
      //     Photo
      //   </Text>
      // </HStack>
      // </View>

      //---Video Reply ------

      // <View
      //   mt="1"
      //   px="2"
      //   py="1"
      //   borderRadius={7}
      //   bgColor={props.isSame ? '#D0D8EB' : '#EFEFEF'}>
      //   <Text numberOfLines={1} fontSize={11} ellipsizeMode="tail" fontWeight={'bold'}>
      //     {!isSameUser
      //       ? profileDetails?.nickName || getUserIdFromJid(fromUserJId)
      //       : 'You'}
      //   </Text>

      //      <View
      //   style={{
      //     width: 30,
      //     height: 20,
      //     position: 'absolute',
      //     top: 0,
      //     bottom: 0,
      //     right: 0,

      //   }}>
      //    <Image
      //       resizeMode="cover"
      //       style={{ width: 30, height: 43, borderTopRightRadius:5,borderBottomRightRadius:5 }}
      //       source={{
      //         uri: `data:image/png;base64,${media?.thumb_image}`,
      //       }}
      //     />
      //   </View>

      //  <HStack alignItems={'center'} pl={0}>
      //  <VideoIcon  color={props.isSame ?"#7285B5": "#959595"} width="12" height="10" />
      //   <Text pl={1} fontSize={12} color="#313131" fontWeight={400}>
      //     Video
      //   </Text>
      //  </HStack>

      // </View>

      // ---- Document  Reply ----

      //   <View
      //   mt="1"
      //   px="2"
      //   py="1"
      //   borderRadius={7}
      //   flex={0.8}
      //   bgColor={props.isSame ? '#D0D8EB' : '#EFEFEF'}>
      //   <Text numberOfLines={1} fontSize={11} ellipsizeMode="tail" fontWeight={'bold'}>
      //     {!isSameUser
      //       ? profileDetails?.nickName || getUserIdFromJid(fromUserJId)
      //       : 'You'}
      //   </Text>
      //   <View
      //     style={{
      //       width: 25,
      //       height: 39,
      //       position: 'absolute',
      //       top: 0,
      //       bottom: 0,
      //       right: 0,
      //       backgroundColor:props.isSame ? "#fff": '#D0D8EB',
      //       borderTopRightRadius:5,borderBottomRightRadius:5

      //     }}>
      //      <View flex={1} style={{ width: 30,
      //       height: 21,bgColor:"#fff" ,top: 8,
      //       bottom: 0,
      //       right: -10,}}  py={1}>{renderFileIcon()}</View>
      //     </View>

      //   <HStack flex={0.1}    alignItems={'center'} >
      //     <DocumentChatIcon  width="12" height="12" color={props.isSame ?"#7285B5": "#959595"}/>
      //     <Text flex={0.69}  numberOfLines={1} pl={1} color="#313131" fontSize={10}  fontWeight={400}>
      //       {media?.fileName}
      //     </Text>
      //   </HStack>
      // </View>

      //---- Reply Audio -------

      // <View
      //   mt="1"
      //   px="2"
      //   py="1"
      //   borderRadius={7}
      //   bgColor={props.isSame ? '#D0D8EB' : '#EFEFEF'}>
      //   <Text
      //     numberOfLines={1}
      //     fontSize={11}
      //     ellipsizeMode="tail"
      //     fontWeight={'bold'}>
      //     {!isSameUser
      //       ? profileDetails?.nickName || getUserIdFromJid(fromUserJId)
      //       : 'You'}
      //   </Text>
      //   <View
      //     style={{
      //       width: 30,
      //       height: 42,
      //       position: 'absolute',
      //       top: 0,
      //       bottom: 0,
      //       right: 0,
      //       backgroundColor: props.isSame ? '#7285B5' : '#959595',
      //       borderTopRightRadius: 5,
      //       borderBottomRightRadius: 5,
      //     }}>
      //     <View
      //       style={{
      //         position: 'absolute',
      //         top: 12,
      //         bottom: 0,
      //         left: 8,
      //       }}>
      //       <AudioMusicIcon
      //         width="18"
      //         height="18"
      //         color={props.isSame ? '#fff' : '#959595'}
      //       />
      //     </View>
      //   </View>

      //   <Text color="#313131" fontSize={12} fontWeight={400}>
      //     {durationString}
      //   </Text>
      // </View>

      //---- Reply contact -------

      //    <View
      //   mt="1"
      //   px="2"
      //   py="1"
      //   borderRadius={7}
      //   bgColor={props.isSame ? '#D0D8EB' : '#EFEFEF'}>
      //   <Text
      //     numberOfLines={1}
      //     fontSize={11}
      //     ellipsizeMode="tail"
      //     fontWeight={'bold'}>
      //     {!isSameUser
      //       ? profileDetails?.nickName || getUserIdFromJid(fromUserJId)
      //       : 'You'}
      //   </Text>
      //   <HStack alignItems={'center'} pl={1}>
      //   <ContactChatIcon  width="12" height="12" color={props.isSame ?"#7285B5": "#959595"}  />
      //   <Text pl={1} color="#313131" fontSize={12} fontWeight={400}>
      //     Contact: Afzal Qa
      //   </Text>
      // </HStack>
      //  </View>

      // Reply Location -----

      // <View
      //   mt="1"
      //   px="2"
      //   py="1"
      //   borderRadius={7}
      //   bgColor={props.isSame ? '#D0D8EB' : '#EFEFEF'}>
      //   <Text
      //     numberOfLines={1}
      //     fontSize={11}
      //     ellipsizeMode="tail"
      //     fontWeight={'bold'}>
      //     {!isSameUser
      //       ? profileDetails?.nickName || getUserIdFromJid(fromUserJId)
      //       : 'You'}
      //   </Text>

      //   <View
      //     style={{
      //       width: 30,
      //       height: 14,
      //       position: 'absolute',
      //       top: 0,
      //       bottom: 0,
      //       right: 0,
      //     }}>

      //     <Image
      //       resizeMode="cover"
      //       style={{
      //         width: 30,
      //         height: 43,
      //         borderTopRightRadius: 5,
      //         borderBottomRightRadius: 5,
      //       }}
      //       source={{ uri: imageUrl }}
      //     />
      //   </View>

      //   <HStack alignItems={'center'} pl={1}>
      //     <LocationIcon
      //       width="12"
      //       height="10"
      //       color={props.isSame ? '#7285B5' : '#959595'}
      //     />
      //     <Text pl={2} fontSize={12} color={'#313131'} fontWeight={400}>
      //       Location
      //     </Text>
      //   </HStack>
      // </View>

    );
  }
}

export default ReplyMessage;
