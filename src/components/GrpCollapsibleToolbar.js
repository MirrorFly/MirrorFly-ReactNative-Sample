import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React from 'react';
import { Animated, BackHandler, Dimensions, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { batch, useDispatch, useSelector } from 'react-redux';
import { showToast } from '../Helper';
import { isLocalUser, showInternetconnectionToast } from '../Helper/Chat/ChatHelper';
import { SDK } from '../SDK';
import grpImage from '../assets/ic_grp_bg.png';
import Avathar from '../common/Avathar';
import IconButton from '../common/IconButton';
import { AddUserIcon, ExitIcon, ImageEditIcon, LeftArrowIcon, TextEditIcon } from '../common/Icons';
import Modal, { ModalBottomContent, ModalCenteredContent } from '../common/Modal';
import Pressable from '../common/Pressable';
import commonStyles, { modelStyles } from '../common/commonStyles';
import { getImageSource } from '../common/utils';
import ApplicationColors from '../config/appColors';
import { CONTACTLIST, EDITNAME, GROUP_INFO, IMAGEVIEW, RECENTCHATSCREEN } from '../constant';
import { useNetworkStatus } from '../hooks';
import useFetchImage from '../hooks/useFetchImage';
import useRosterData from '../hooks/useRosterData';
import { DeleteChatHistoryAction } from '../redux/Actions/ConversationAction';
import { deleteActiveChatAction } from '../redux/Actions/RecentChatAction';
import AlertModal from './AlertModal';
import { getUserIdFromJid } from '../Helper/Chat/Utility';

const propTypes = {
   chatUser: PropTypes.string,
   title: PropTypes.string,
   toolbarMaxHeight: PropTypes.number,
   toolbarMinHeight: PropTypes.number,
   participants: PropTypes.array,
   imageToken: PropTypes.string,
   handleBackBtn: PropTypes.func,
   handleTakePhoto: PropTypes.func,
   handleFromGallery: PropTypes.func,
   handleRemovePhoto: PropTypes.func,
   getGroupParticipants: PropTypes.func,
};

const defaultProps = {
   title: '',
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
   getGroupParticipants,
   handleTakePhoto,
   handleFromGallery,
   handleRemovePhoto,
}) => {
   const navigation = useNavigation();
   const dispatch = useDispatch();
   const isNetworkconneted = useNetworkStatus();
   const scrollY = React.useRef(new Animated.Value(0)).current;
   const [animatedTitleColor, setAnimatedTitleColor] = React.useState(250);
   const [userDetails, setUserDetails] = React.useState({});
   const scrollDistance = toolbarMaxHeight - toolbarMinHeight;
   const { height: screenHeight } = Dimensions.get('window');
   const recentChatList = useSelector(state => state.recentChatData.data || []);
   const userType = recentChatList.find(r => r.fromUserJid === chatUser)?.userType || '';
   const layout = useWindowDimensions();
   const [modalContent, setModalContent] = React.useState(null);

   const adaptiveMinHeight = screenHeight * 0.92;
   /**
    * const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    * const pixelRatio = PixelRatio.get();
      const baseFontSize = 45;
    * const scaledFontSize = ((baseFontSize * screenWidth) / 375) * pixelRatio;
    * */

   const [optionModelOpen, setOptionModelOpen] = React.useState(false);

   const toggleOptionModel = () => {
      setOptionModelOpen(val => !val);
   };

   const translateY = React.useRef(new Animated.Value(layout.height)).current;
   React.useEffect(() => {
      if (optionModelOpen) {
         // Animate in if visible
         Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
         }).start();
      } else {
         // Animate out if not visible
         Animated.timing(translateY, {
            toValue: layout.height,
            duration: 300,
            useNativeDriver: true,
         }).start();
      }
   }, [optionModelOpen, translateY, layout.height]);

   const toggleModalContent = () => {
      setModalContent(null);
   };

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
      if (!isLocalUser(item.userId) && localUser?.userType === 'o') {
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

   const handelGroupProfileUpdate = () => {
      if (!isNetworkconneted) {
         return showInternetconnectionToast();
      }
      toggleOptionModel();
   };

   const handleViewImage = () => {
      navigation.navigate(IMAGEVIEW, { imageUrl, authToken, title });
   };

   const handleEditText = () => {
      navigation.navigate(EDITNAME, { imageToken, authToken, chatUser, title });
   };

   const handleLeaveGroup = async () => {
      if (!isNetworkconneted) {
         return showInternetconnectionToast();
      }
      const { statusCode } = await SDK.userExitGroup(chatUser, localUser?.userType === 'o');
      if (statusCode === 200) {
         getGroupParticipants(1000);
      }
   };
   const handleDeleteGroup = async () => {
      if (!isNetworkconneted) {
         return showInternetconnectionToast();
      }
      if (isNetworkconneted) {
         const { statusCode } = await SDK.userDeleteGroup(chatUser);
         if (statusCode === 200) {
            navigation.navigate(RECENTCHATSCREEN);
            batch(() => {
               dispatch(deleteActiveChatAction({ fromUserId: getUserIdFromJid(chatUser) }));
               dispatch(DeleteChatHistoryAction({ fromUserId: getUserIdFromJid(chatUser) }));
            });
         }
      }
   };

   const handleRemoveUser = async () => {
      if (!isNetworkconneted) {
         return showInternetconnectionToast();
      }
      toggleModel();
      const { statusCode, message } = await SDK.removeParticipant(
         chatUser,
         userDetails.userJid,
         userDetails.userType === 'o',
      );
      if (statusCode === 200) {
         getGroupParticipants(1000);
      } else {
         showToast(message, { id: message });
      }
   };

   const handleMakeAdmin = async () => {
      if (!isNetworkconneted) {
         return showInternetconnectionToast();
      }
      const { statusCode, message } = await SDK.makeAsAdmin(chatUser, userDetails.userJid);
      if (statusCode === 200) {
         getGroupParticipants(1000);
      } else {
         showToast(message, { id: message });
      }
   };

   const toggleConfirmUserRemoveModal = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: `Are you sure you want to remove \n${
            userDetails?.userProfile?.nickName || userDetails?.userProfile?.mobileNumber || userDetails?.userId || ''
         }?`,
         noButton: 'No',
         yesButton: 'Yes',
         yesAction: handleRemoveUser,
      });
   };

   const toggleConfirmRemovePhotoModal = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: 'Are you sure you want to remove the photo?',
         noButton: 'No',
         yesButton: 'Yes',
         yesAction: handleRemovePhoto,
      });
   };

   const toggleConfirmAdminModal = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: `Are you sure you want to make ${
            userDetails?.userProfile?.nickName || userDetails?.userProfile?.mobileNumber || userDetails?.userId || ''
         } the admin?`,
         noButton: 'No',
         yesButton: 'Yes',
         yesAction: handleMakeAdmin,
      });
   };

   const toggleLeaveGroup = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: 'Are you sure you want to leave from group?',
         noButton: 'CANCEL',
         yesButton: 'LEAVE',
         yesAction: handleLeaveGroup,
      });
   };

   const toggleDeleteGroup = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: 'Are you sure you want to leave from group?',
         noButton: 'CANCEL',
         yesButton: 'DELETE',
         yesAction: handleDeleteGroup,
      });
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
               },
            ]}>
            <Animated.View
               style={[
                  {
                     justifyContent: 'center',
                     alignItems: 'center',
                     backgroundColor: '#f2f2f2',
                     height: toolbarMaxHeight,
                     opacity: imageOpacity,
                     shadowColor: '#181818',
                     shadowOffset: { width: 0, height: 6 },
                     shadowOpacity: 0.1,
                     shadowRadius: 6,
                  },
               ]}>
               {Boolean(imageUrl) ? (
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
               {Boolean(userType) && animatedTitleColor < 260 && (
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
               <IconButton onPress={handleBackBtn}>
                  {LeftArrowIcon(animatedTitleColor < 280 ? '#fff' : '#000')}
               </IconButton>
            </View>
            {Boolean(userType) && (
               <Pressable onPress={handelGroupProfileUpdate} style={styles.right}>
                  <ImageEditIcon width="25" height="25" color={animatedTitleColor < 280 ? '#fff' : '#000'} />
               </Pressable>
            )}
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
            <View style={{ marginHorizontal: 12, marginTop: toolbarMaxHeight, minHeight: adaptiveMinHeight }}>
               <View style={[commonStyles.hstack]} mb="7" justifyContent={'space-between'}>
                  {/* <Text fontSize={14} fontWeight={500} color={'#181818'}>
                     Mute Notification
                  </Text> */}
                  {/* <Switch
                     size="md"
                     offTrackColor="indigo.100"
                     onTrackColor="indigo.200"
                     onThumbColor="blue.500"
                     offThumbColor="indigo.50"
                  /> */}
               </View>
               {localUser?.userType === 'o' && (
                  <Pressable onPress={handleAddParticipants}>
                     <View
                        style={[
                           commonStyles.hstack,
                           commonStyles.alignItemsCenter,
                           commonStyles.justifyContentSpaceBetween,
                           { marginVertical: 12, marginLeft: 20 },
                        ]}>
                        <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                           <AddUserIcon />
                           <Text style={{ marginLeft: 12, fontSize: 14, color: '#181818' }}>Add Participants</Text>
                        </View>
                     </View>
                  </Pressable>
               )}
               {renderParticipants()}
               <View mt="5" />
               {/* <Pressable>
                  <View style={[commonStyles.hstack, commonStyles.m_12, commonStyles.p_4]}>
                     <ReportGroupIcon width="20" height="20" />
                     <Text style={{ marginLeft: 20, fontSize: 14, color: '#FF0000' }}>Report Group</Text>
                  </View>
               </Pressable> */}
               {Boolean(userType) && (
                  <Pressable onPress={toggleLeaveGroup}>
                     <View style={[commonStyles.hstack, commonStyles.m_12, commonStyles.p_4]}>
                        <ExitIcon color="#ff3939" />
                        <Text style={styles.groupActionButton}>Leave Group</Text>
                     </View>
                  </Pressable>
               )}
               {!userType && (
                  <Pressable onPress={toggleDeleteGroup}>
                     <View style={[commonStyles.hstack, commonStyles.m_12, commonStyles.p_4]}>
                        <ExitIcon color="#ff3939" />
                        <Text style={styles.groupActionButton}>Delete Group</Text>
                     </View>
                  </Pressable>
               )}
               <View mb="5" />
            </View>
         </Animated.ScrollView>
         <Modal visible={modelOpen} onRequestClose={toggleModel}>
            <ModalCenteredContent onPressOutside={toggleModel}>
               <View style={modelStyles.inviteFriendModalContentContainer}>
                  {/* <Pressable>
                     <Text style={modelStyles.modalOption}>Start Chat</Text>
                  </Pressable>
                  <Pressable>
                     <Text style={modelStyles.modalOption}>View Info</Text>
                  </Pressable> */}
                  {localUser?.userType === 'o' && (
                     <>
                        <Pressable
                           onPress={() => {
                              toggleModel();
                              toggleConfirmUserRemoveModal();
                           }}>
                           <Text style={modelStyles.modalOption}>Remove form Group</Text>
                        </Pressable>
                        {userDetails.userType !== 'o' && (
                           <Pressable
                              onPress={() => {
                                 toggleModel();
                                 toggleConfirmAdminModal();
                              }}>
                              <Text style={modelStyles.modalOption}>Make Admin</Text>
                           </Pressable>
                        )}
                     </>
                  )}
               </View>
            </ModalCenteredContent>
         </Modal>
         <Modal visible={optionModelOpen} onRequestClose={toggleOptionModel}>
            <ModalBottomContent onPressOutside={toggleOptionModel}>
               <Animated.View style={[styles.optionModelContainer, { transform: [{ translateY }] }]}>
                  <Text style={styles.optionTitleText}>Options</Text>
                  <Pressable
                     onPress={() => {
                        toggleOptionModel();
                        handleTakePhoto();
                     }}>
                     <Text style={styles.pressableText}>Take Photo</Text>
                  </Pressable>
                  <Pressable
                     onPress={() => {
                        toggleOptionModel();
                        handleFromGallery();
                     }}>
                     <Text style={styles.pressableText}>Choose from Gallery</Text>
                  </Pressable>
                  {Boolean(imageUrl) && (
                     <Pressable
                        onPress={() => {
                           toggleOptionModel();
                           toggleConfirmRemovePhotoModal();
                        }}>
                        <Text style={styles.pressableText}>Remove Photo</Text>
                     </Pressable>
                  )}
               </Animated.View>
            </ModalBottomContent>
         </Modal>
         {modalContent && <AlertModal {...modalContent} />}
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
      /** overflow: 'hidden', commented to display shadow in iOS */
      position: 'absolute',
      elevation: 5,
      shadowColor: ApplicationColors.shadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
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
   optionTitleText: { fontSize: 16, color: '#000', marginVertical: 5, marginHorizontal: 20, lineHeight: 25 },
   optionModelContainer: {
      maxWidth: 500,
      width: '98%',
      backgroundColor: '#fff',
      paddingVertical: 12,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      borderBottomWidth: 3,
   },
   pressableText: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      fontWeight: '600',
   },
   buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
   },
   groupActionButton: { marginLeft: 20, fontSize: 14, color: '#FF0000' },
});
