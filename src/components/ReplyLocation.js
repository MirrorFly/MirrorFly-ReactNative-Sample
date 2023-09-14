import { Pressable, Image, StyleSheet } from 'react-native';
import React from 'react';
import { ClearTextIcon, LocationMarkerIcon } from '../common/Icons';
import { HStack, Text, View } from 'native-base';
import { formatUserIdToJid } from '../Helper/Chat/ChatHelper';
import { useSelector } from 'react-redux';
import useRosterData from '../hooks/useRosterData';
import mapStaticBlurImage from '../assets/google-maps-blur.png';
import { getImageSource } from '../common/utils';

const ReplyLocation = props => {
  const { replyMsgItems, handleRemove } = props;
  const vCardProfile = useSelector(state => state.profile.profileDetails);
  const currentUserJID = formatUserIdToJid(vCardProfile?.userId);
  const profileDetails = useSelector(state => state.navigation.profileDetails);

  const { fromUserJid = '', fromUserId = '' } = replyMsgItems;
  const isSender = fromUserJid === currentUserJID;
  let { nickName } = useRosterData(isSender ? '' : fromUserId);
  // updating default values
  nickName = nickName || profileDetails?.nickName || fromUserId || '';

  const RemoveHandle = () => {
    handleRemove();
  };

  return (
    <View style={styles.container}>
      <HStack justifyContent={'space-between'} alignItems={'center'}>
        {isSender ? (
          <Text
            color={'#000'}
            fontSize={14}
            mb={1}
            pl={1}
            fontWeight={600}
            py="0">
            You
          </Text>
        ) : (
          <Text
            mb={1}
            pl={1}
            color={'#000'}
            fontSize={14}
            fontWeight={600}
            py="0">
            {nickName}
          </Text>
        )}
      </HStack>
      <View style={styles.replyMessageSection}>
        <Image
          resizeMode="cover"
          style={styles.mapStaticImage}
          source={getImageSource(mapStaticBlurImage)}
        />

        <Pressable style={styles.clearButton} onPress={RemoveHandle}>
          <ClearTextIcon />
        </Pressable>
      </View>

      <HStack alignItems={'center'}>
        <LocationMarkerIcon color={'#7285B5'} />
        <Text pl={1} fontSize={14} color={'#313131'} fontWeight={400}>
          Location
        </Text>
      </HStack>
    </View>
  );
};

export default ReplyLocation;

const styles = StyleSheet.create({
  container: { position: 'relative' },
  replyMessageSection: {
    width: 70,
    height: 64,
    alignItems: 'flex-end',
    position: 'absolute',
    top: -12,
    bottom: 0,
    right: -10,
  },
  mapStaticImage: { width: 60, height: 69 },
  clearButton: {
    padding: 5,
    top: -65,
    right: 10,
    bottom: 0,
    backgroundColor: '#FFF',
    borderRadius: 20,
  },
});
