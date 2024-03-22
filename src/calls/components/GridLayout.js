import React from 'react';
import { StyleSheet, View, Animated, Text, Pressable } from 'react-native';
import Avathar from '../../common/Avathar';
import useRosterData from '../../hooks/useRosterData';
import { getUserIdFromJid } from '../../Helper/Chat/Utility';
import ApplicationColors from '../../config/appColors';
import { AudioMuteIcon } from '../../common/Icons';
import VideoComponent from './VideoComponent';
import { CALL_STATUS_RECONNECT } from '../../Helper/Calls/Constant';

const GridItem = ({
   wrapperStyle,
   item,
   isLocalUser,
   isFullSize,
   onPress,
   isAudioMuted,
   isVideoMuted,
   localStream,
   isFrontCameraEnabled,
   callStatus,
}) => {
   const userId = getUserIdFromJid(item?.fromJid || '');
   const userProfile = useRosterData(userId);
   const nickName = userProfile.nickName || userId || '';
   let stream = isLocalUser ? localStream : item?.stream;
   let reconnectStatus =
      callStatus && callStatus?.toLowerCase() === CALL_STATUS_RECONNECT && !isLocalUser ? true : false;

   return (
      <Pressable style={[wrapperStyle]} onPress={onPress}>
         <View style={styles.gridItem}>
            {!isVideoMuted && stream && stream.video && !reconnectStatus && (
               <VideoComponent
                  stream={stream}
                  isFrontCameraEnabled={isLocalUser ? isFrontCameraEnabled : false}
                  zIndex={0}
               />
            )}
            <View style={styles.gridItemInnerView}>
               {isAudioMuted ? (
                  <View style={styles.gridItemUserMuteIcon}>
                     <AudioMuteIcon width={10} height={16} color={'#fff'} />
                  </View>
               ) : (
                  <View style={styles.gridItemVoiceLevelWrapper}>
                     <View style={styles.gridItemVoiceLevelIndicator} />
                     <View style={styles.gridItemVoiceLevelIndicator} />
                     <View style={styles.gridItemVoiceLevelIndicator} />
                  </View>
               )}
               {(isVideoMuted || reconnectStatus || !stream.video) && (
                  <View style={styles.gridItemUserAvathar}>
                     <Avathar
                        width={isFullSize ? 100 : 60}
                        height={isFullSize ? 100 : 60}
                        backgroundColor={userProfile.colorCode}
                        data={nickName}
                        profileImage={userProfile.image}
                     />
                  </View>
               )}
               <View>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.gridItemUserName}>
                     {isLocalUser ? 'You' : nickName}
                  </Text>
               </View>
            </View>
         </View>
      </Pressable>
   );
};

export const GridLayout = ({
   remoteStreams,
   localUserJid,
   onPressAnywhere,
   offsetTop,
   animatedOffsetTop,
   remoteAudioMuted,
   localStream,
   remoteVideoMuted,
   isFrontCameraEnabled,
   callStatus,
}) => {
   const [scrollViewDimension, setScrollViewDimension] = React.useState({
      width: null,
      height: null,
   });

   const [calculatedColumns, calculatedGridItemStyle] = React.useMemo(() => {
      let { width, height } = scrollViewDimension;
      width = width ?? 0;
      height = height ?? 0;
      width = width - 10; // subtracting the horizontal padding for the scroll view content
      const _usersLength = remoteStreams?.length || 0;
      const _calculatedColumns = _usersLength <= 3 ? 1 : 2;
      return [
         _calculatedColumns,
         _calculatedColumns === 1
            ? {
                 width: width - 10, // subtracting the horizontal padding (5 + 5)
                 padding: 5,
                 height: height / _usersLength - 10, // subtracting the vertical padding (5 + 5)
              }
            : {
                 width: width / 2 - 10, // subtracting the horizontal padding (5 + 5)
                 padding: 5,
                 height: width / 2 - 10, // subtracting the vertical padding (5 + 5)
              },
      ];
   }, [remoteStreams?.length, scrollViewDimension]);

   const handleLayout = ({ nativeEvent }) => {
      const { height, width } = nativeEvent.layout;
      setScrollViewDimension({
         width,
         height,
      });
   };

   const sortedRemoteStreams = React.useMemo(() => {
      const _sortedData = [...(remoteStreams || [])];
      const localStreamIndex = _sortedData.findIndex(s => s.fromJid === localUserJid);
      if (localStreamIndex > -1) {
         const _localStream = _sortedData.splice(localStreamIndex, 1);
         _sortedData.push(..._localStream); // using spread operator while pushing bcoz the splice method will return an array of deleted elements
      }
      return _sortedData;
   }, [remoteStreams]);

   const renderGridItem = ({ item }) => {
      const isAudioMuted = remoteAudioMuted?.[item?.fromJid] || false;
      const isVideoMuted = remoteVideoMuted?.[item?.fromJid] || false;
      return (
         <GridItem
            wrapperStyle={calculatedGridItemStyle}
            item={item}
            isLocalUser={item?.fromJid === localUserJid}
            isFullSize={calculatedColumns === 1}
            onPress={onPressAnywhere}
            isAudioMuted={isAudioMuted}
            isVideoMuted={isVideoMuted}
            localStream={localStream}
            isFrontCameraEnabled={isFrontCameraEnabled}
            callStatus={callStatus}
         />
      );
   };

   return (
      <Animated.FlatList
         key={calculatedColumns}
         numColumns={calculatedColumns}
         onLayout={handleLayout}
         style={[
            styles.container,
            {
               transform: [
                  {
                     translateY: animatedOffsetTop.interpolate({
                        inputRange: [offsetTop * -1, 0],
                        outputRange: [-22, 0],
                     }),
                  },
               ],
            },
         ]}
         contentContainerStyle={[
            styles.scrollContentContainer,
            {
               minHeight: scrollViewDimension.height - 100,
            },
         ]}
         data={sortedRemoteStreams}
         renderItem={renderGridItem}
         keyExtractor={_user => String(_user.fromJid)}
      />
   );
};

export default GridLayout;

const styles = StyleSheet.create({
   container: {
      flex: 1,
      marginTop: 5,
   },
   scrollContentContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 5,
   },
   halfWidth: {
      width: '47%',
      margin: '1.5%',
   },
   fullWidth: {
      width: '97%',
      margin: '1.5%',
   },
   gridItem: {
      flex: 1,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: '#151F32',
   },
   gridItemUserMuteIcon: {
      backgroundColor: 'rgba(0,0,0,.3)',
      width: 25,
      height: 25,
      borderRadius: 15,
      alignSelf: 'flex-end',
      justifyContent: 'center',
      alignItems: 'center',
   },
   gridItemVoiceLevelWrapper: {
      backgroundColor: '#3ABF87',
      width: 25,
      height: 25,
      borderRadius: 15,
      alignSelf: 'flex-end',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
   },
   gridItemVoiceLevelIndicator: {
      width: 4,
      height: 4,
      borderRadius: 3,
      marginHorizontal: 1,
      backgroundColor: ApplicationColors.white,
   },
   gridItemUserAvathar: {
      alignSelf: 'center',
      marginTop: -10,
   },
   gridItemUserName: {
      color: ApplicationColors.white,
   },
   gridItemInnerView: {
      flex: 1,
      justifyContent: 'space-between',
      padding: 10,
   },
});
