import { useNavigation } from '@react-navigation/native';
import { HStack, Icon, IconButton, Switch, Text, View } from 'native-base';
import PropTypes from 'prop-types';
import React from 'react';
import { Animated, BackHandler, Dimensions, Image, StyleSheet } from 'react-native';
import { showToast } from '../Helper';
import { isLocalUser } from '../Helper/Chat/ChatHelper';
import { SDK } from '../SDK';
import grpImage from '../assets/ic_grp_bg.png';
import Avathar from '../common/Avathar';
import { AddUserIcon, ExitIcon, ImageEditIcon, LeftArrowIcon, ReportGroupIcon, TextEditIcon } from '../common/Icons';
import Modal, { ModalCenteredContent } from '../common/Modal';
import Pressable from '../common/Pressable';
import commonStyles, { modelStyles } from '../common/commonStyles';
import { getImageSource } from '../common/utils';
import ApplicationColors from '../config/appColors';
import { CONTACTLIST, EDITNAME, GROUP_INFO, IMAGEVIEW } from '../constant';
import { useNetworkStatus } from '../hooks';
import useFetchImage from '../hooks/useFetchImage';
import useRosterData from '../hooks/useRosterData';

const propTypes = {
   chatUser: PropTypes.string,
   title: PropTypes.string,
   toolbarMaxHeight: PropTypes.number,
   toolbarMinHeight: PropTypes.number,
   participants: PropTypes.array,
   imageToken: PropTypes.string,
   handleBackBtn: PropTypes.func,
};

const defaultProps = {
   title: 'Ashik',
   toolbarMaxHeight: 400,
   toolbarMinHeight: 60,
   participants: [],
   handleBackBtn: () => {},
   imageToken: '',
};

const RenderItem = ({ item, index, onhandlePress }) => {
   let { nickName, image: imageToken, colorCode, status } = useRosterData(item?.userId);
   // updating default values
   nickName = nickName || item?.nickName || item?.userId || '';
   imageToken = imageToken || '';
   colorCode = colorCode || SDK.getRandomColorCode();
   status = status || item.status || '';
   const handlePress = () => onhandlePress(item);

   return (
      <React.Fragment key={index}>
         <Pressable onPress={handlePress}>
            <View style={styles.wrapper}>
               <Avathar data={nickName} profileImage={imageToken} backgroundColor={colorCode} />
               <View style={[commonStyles.marginLeft_15, commonStyles.flex1]}>
                  <Text style={styles.nickNameText} numberOfLines={1} ellipsizeMode="tail">
                     {isLocalUser(item?.userId) ? 'You' : nickName}
                  </Text>
                  <Text style={styles.stautsText} numberOfLines={1} ellipsizeMode="tail">
                     {status}
                  </Text>
               </View>
               {item.userType === 'o' && <Text style={{ color: ApplicationColors.mainColor }}>Admin</Text>}
            </View>
         </Pressable>
         <View style={styles.divider} />
      </React.Fragment>
   );
};

const GrpCollapsibleToolbar = ({
   chatUser,
   title,
   imageToken,
   toolbarMaxHeight,
   toolbarMinHeight,
   handleBackBtn,
   participants,
   getGrpParticipants,
}) => {
   const navigation = useNavigation();
   const isNetworkconneted = useNetworkStatus();
   const scrollY = React.useRef(new Animated.Value(0)).current;
   const [animatedTitleColor, setAnimatedTitleColor] = React.useState(250);
   const [userDetails, setUserDetails] = React.useState({});
   const scrollDistance = toolbarMaxHeight - toolbarMinHeight;
   const { height: screenHeight } = Dimensions.get('window');

   const adaptiveMinHeight = screenHeight * 0.92;
   /**
    * const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    * const pixelRatio = PixelRatio.get();
      const baseFontSize = 45;
    * const scaledFontSize = ((baseFontSize * screenWidth) / 375) * pixelRatio;
    * */

   const [modelOpen, setModelOpen] = React.useState(false);

   const toggleModel = () => {
      setModelOpen(val => !val);
   };

   const { imageUrl, authToken } = useFetchImage(imageToken);

   const headerTranslate = scrollY.interpolate({
      inputRange: [0, scrollDistance],
      outputRange: [0, -scrollDistance],
      extrapolate: 'clamp',
   });

   const imageOpacity = scrollY.interpolate({
      inputRange: [0, scrollDistance / 2, scrollDistance],
      outputRange: [1, 1, 0],
      extrapolate: 'clamp',
   });

   const titleScale = scrollY.interpolate({
      inputRange: [0, scrollDistance / 2, scrollDistance],
      outputRange: [1, 1, 0.8],
      extrapolate: 'clamp',
   });

   const onhandlePress = item => {
      setUserDetails(item);
      if (!isLocalUser(item.userId)) {
         toggleModel();
      }
   };

   const renderParticipant = ({ item, index }) => {
      return <RenderItem item={item} index={index} onhandlePress={onhandlePress} />;
   };

   const localUser = React.useMemo(() => participants.find(item => isLocalUser(item?.userId)));

   const renderParticipants = () => {
      return (
         <View style={{ zIndex: 0 }}>
            {participants?.map((item, index) => (
               <React.Fragment key={item.userId}>{renderParticipant({ item, index })}</React.Fragment>
            ))}
         </View>
      );
   };

   const handleAddParticipants = () => {
      navigation.navigate(CONTACTLIST, {
         prevScreen: GROUP_INFO,
         grpDetails: { grpJid: chatUser, grpName: title, participants },
      });
   };

   const handelGrpProfileUpdate = () => {
      if (!isNetworkconneted) {
         return showToast('Please check your internet connection', {
            id: 'internet-connection-toast',
         });
      }
      // SDK.setGroupProfile(chatUser, title, '');
   };

   const handleViewImage = () => {
      navigation.navigate(IMAGEVIEW, { imageUrl, authToken, title });
   };

   const handleEditText = () => {
      navigation.navigate(EDITNAME, { imageUrl, authToken, title });
   };

   const handleLeaveGroup = async () => {
      const { statusCode } = await SDK.userExitGroup(chatUser, localUser?.userType === 'o');
      if (statusCode === 200) {
         getGrpParticipants();
      }
   };

   const handleRemoveUser = async () => {
      const { statusCode } = await SDK.removeParticipant(chatUser, userDetails.userJid, userDetails.userType === 'o');
      if (statusCode === 200) {
         getGrpParticipants();
      }
      toggleModel();
   };

   const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);

   React.useEffect(() => {
      return () => {
         backHandler.remove();
      };
   }, []);

   return (
      <View style={styles.fill}>
         <Animated.View
            style={[
               styles.header,
               {
                  zIndex: 9,
                  backgroundColor: '#f2f2f2',
                  height: toolbarMaxHeight,
                  transform: [{ translateY: headerTranslate }],
                  elevation: 5,
                  shadowColor: '#181818',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.1,
               },
            ]}>
            <Animated.View
               style={[
                  // styles.header,
                  {
                     justifyContent: 'center',
                     alignItems: 'center',
                     backgroundColor: '#f2f2f2',
                     height: toolbarMaxHeight,
                     opacity: imageOpacity,
                  },
               ]}>
               {imageUrl ? (
                  <Pressable onPress={handleViewImage} style={styles.profileImage}>
                     <Image
                        style={styles.profileImage}
                        source={{
                           uri: imageUrl,
                           method: 'GET',
                           cache: 'force-cache',
                           headers: {
                              Authorization: authToken,
                           },
                        }}
                     />
                  </Pressable>
               ) : (
                  <Image style={styles.profileImage} source={getImageSource(grpImage)} />
               )}
            </Animated.View>
            <Animated.View
               style={[
                  styles.action,
                  commonStyles.justifyContentSpaceBetween,
                  {
                     backgroundColor: 'transparent',
                     transform: [{ scale: titleScale }],
                  },
               ]}>
               <Animated.Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                     styles.title,
                     {
                        color: animatedTitleColor < 280 ? '#fff' : '#000',
                     },
                  ]}>
                  {title}
               </Animated.Text>
               {animatedTitleColor < 260 && (
                  <Pressable
                     onPress={handleEditText}
                     style={[commonStyles.alignItemsCenter, commonStyles.justifyContentCenter]}
                     contentContainerStyle={commonStyles.p_4}>
                     <TextEditIcon color="#fff" width="20" height="20" />
                  </Pressable>
               )}
            </Animated.View>
         </Animated.View>
         <Animated.View style={styles.bar}>
            <View style={styles.left}>
               <IconButton
                  onPress={handleBackBtn}
                  _pressed={{
                     bg: animatedTitleColor < 280 ? 'rgba(0,0,0, 0.2)' : 'rgba(50,118,226, 0.1)',
                  }}
                  icon={
                     <Icon as={() => LeftArrowIcon(animatedTitleColor < 280 ? '#fff' : '#000')} name="emoji-happy" />
                  }
                  borderRadius="full"
               />
            </View>
            <Pressable onPress={handelGrpProfileUpdate} style={styles.right}>
               <ImageEditIcon width="25" height="25" color={animatedTitleColor < 280 ? '#fff' : '#000'} />
            </Pressable>
         </Animated.View>
         <Animated.ScrollView
            bounces={false}
            style={styles.scrollView}
            scrollEventThrottle={1}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
               useNativeDriver: true,
               listener: event => {
                  const { y } = event.nativeEvent.contentOffset;
                  setAnimatedTitleColor(y);
               },
            })}>
            <View mx="3" mt={toolbarMaxHeight} minHeight={adaptiveMinHeight}>
               <HStack mb="7" justifyContent={'space-between'}>
                  <Text fontSize={14} fontWeight={500} color={'#181818'}>
                     Mute Notification
                  </Text>
                  <Switch
                     size="md"
                     offTrackColor="indigo.100"
                     onTrackColor="indigo.200"
                     onThumbColor="blue.500"
                     offThumbColor="indigo.50"
                  />
               </HStack>
               {localUser?.userType == 'o' && (
                  <Pressable onPress={handleAddParticipants}>
                     <HStack my="3" alignItems={'center'} justifyContent={'space-between'}>
                        <HStack alignItems={'center'}>
                           <AddUserIcon />
                           <Text ml="3" fontSize={14} color={'#181818'} fontWeight={500}>
                              Add Participants
                           </Text>
                        </HStack>
                     </HStack>
                  </Pressable>
               )}
               {renderParticipants()}
               <View mt="5" />
               <Pressable>
                  <View style={[commonStyles.hstack, commonStyles.m_12, commonStyles.p_4]}>
                     <ReportGroupIcon width="20" height="20" />
                     <Text ml="5" fontSize={14} color="#FF0000">
                        Report Group
                     </Text>
                  </View>
               </Pressable>
               <Pressable onPress={handleLeaveGroup}>
                  <View style={[commonStyles.hstack, commonStyles.m_12, commonStyles.p_4]}>
                     <ExitIcon color="#ff3939" />
                     <Text ml="5" fontSize={14} color="#FF0000">
                        Leave Group
                     </Text>
                  </View>
               </Pressable>
               <View mb="5" />
            </View>
         </Animated.ScrollView>
         <Modal visible={modelOpen} onRequestClose={toggleModel}>
            <ModalCenteredContent onPressOutside={toggleModel}>
               <View style={modelStyles.inviteFriendModalContentContainer}>
                  <Pressable>
                     <Text style={modelStyles.modalOption}>Start Chat</Text>
                  </Pressable>
                  <Pressable>
                     <Text style={modelStyles.modalOption}>View Info</Text>
                  </Pressable>
                  {localUser?.userType === 'o' && (
                     <>
                        <Pressable onPress={handleRemoveUser}>
                           <Text style={modelStyles.modalOption}>Remove form Group</Text>
                        </Pressable>
                        <Pressable>
                           <Text style={modelStyles.modalOption}>Make Admin</Text>
                        </Pressable>
                     </>
                  )}
               </View>
            </ModalCenteredContent>
         </Modal>
      </View>
   );
};

GrpCollapsibleToolbar.propTypes = propTypes;
GrpCollapsibleToolbar.defaultProps = defaultProps;

export default GrpCollapsibleToolbar;
const styles = StyleSheet.create({
   fill: {
      flex: 1,
   },
   scrollView: {
      flex: 1,
   },
   header: {
      top: 0,
      left: 0,
      right: 0,
      overflow: 'hidden',
      position: 'absolute',
   },
   action: {
      left: 20,
      right: 20,
      bottom: 15,
      flexDirection: 'row',
      position: 'absolute',
   },
   bar: {
      zIndex: 10,
      height: 65,
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
   left: {
      top: 0,
      left: 0,
      width: 50,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
   },
   right: {
      top: 0,
      right: 0,
      width: 50,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
   },
   title: {
      fontSize: 25,
      padding: 2,
      alignItems: 'center',
   },
   titleStatus: {
      fontSize: 14,
   },
   profileImage: {
      width: '100%',
      height: '100%',
   },
   wrapper: {
      width: '100%',
      marginVertical: 12,
      paddingLeft: 16,
      paddingRight: 20,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
   },
   nickNameText: {
      flexWrap: 'wrap',
      color: '#1f2937',
      fontWeight: 'bold',
      marginVertical: 2,
   },
   stautsText: {
      color: '#4b5563',
      marginVertical: 2,
   },
   divider: {
      width: '83%',
      height: 1,
      alignSelf: 'flex-end',
      backgroundColor: ApplicationColors.dividerBg,
   },
});
