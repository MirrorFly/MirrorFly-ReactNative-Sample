import React from 'react';
import { BackHandler, View } from 'react-native';
import { useSelector } from 'react-redux';
import ImageInfo from './ImageInfo';
import VideoInfo from './VideoInfo';
import { BackArrowIcon } from '../common/Icons';
import { Icon, IconButton, Text } from 'native-base';

const PostPreViewPage = props => {
  const { setLocalNav } = props;
  const chatSelectedMediaImage = useSelector(
    state => state.chatSelectedMedia.data,
  );
  const { msgBody } = chatSelectedMediaImage;
  const currentUserJID = useSelector(state => state.auth.currentUserJID);
  const isSender = currentUserJID === chatSelectedMediaImage?.fromUserJid;

  /** const openBottomSheet = async () => {
    try {
      const base64Image = SingleSelectedImage.thumb_image;
      const shareOptions = {
        type: 'image/png',
        url: `data:image/png;base64,${base64Image}`,
        message: 'Hey This is sample message..!!!',
      };
      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  }; */

  const handleBackBtn = () => {
    setLocalNav('CHATCONVERSATION');
    return true;
  };

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    handleBackBtn,
  );

  React.useEffect(() => {
    return () => {
      backHandler.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          padding: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F2F2F2',
          width: '100%',
          borderBottomColor: '#0000001A',
          borderBottomWidth: 1,
          zIndex: 10,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            onPress={handleBackBtn}
            _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
            borderRadius="full"
            icon={<Icon as={BackArrowIcon} name="emoji-happy" />}
          />
          <Text
            style={{
              color: '#000',
              fontSize: 20,
              fontWeight: '500',
              marginLeft: 20,
            }}>
            {isSender ? 'Sent' : 'Received'} Media
          </Text>
        </View>
        {/* <Pressable onPress={openBottomSheet}>
                    <ShareIcon width="24" height="24" color={"#000"} />
                </Pressable> */}
      </View>
      {
        {
          image: (
            <ImageInfo selectedMedia={msgBody} handleBackBtn={handleBackBtn} />
          ),
          video: (
            <VideoInfo selectedMedia={msgBody} handleBackBtn={handleBackBtn} />
          ),
        }[[msgBody.message_type]]
      }
    </View>
  );
};

export default PostPreViewPage;
