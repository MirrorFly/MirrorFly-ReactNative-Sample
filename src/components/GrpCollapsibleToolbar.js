import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React from 'react';
import { Animated, Dimensions, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import SDK from '../SDK/SDK';
import AlertModal from '../common/AlertModal';
import IconButton from '../common/IconButton';
import {
   AddUserIcon,
   ExitIcon,
   FrontArrowIcon,
   GalleryAllIcon,
   ImageEditIcon,
   LeftArrowIcon,
   TextEditIcon,
} from '../common/Icons';
import InfoImageView from '../common/InfoImageView';
import Modal, { ModalBottomContent, ModalCenteredContent } from '../common/Modal';
import NickName from '../common/NickName';
import Pressable from '../common/Pressable';
import { useNetworkStatus } from '../common/hooks';
import ApplicationColors from '../config/appColors';
import config from '../config/config';
import { getUserIdFromJid, isLocalUser, showNetWorkToast, showToast } from '../helpers/chatHelpers';
import { clearChatMessageData } from '../redux/chatMessageDataSlice';
import { deleteRecentChatOnUserId } from '../redux/recentChatDataSlice';
import { getUserImage, useFilteredRecentChatData } from '../redux/reduxHook';
import {
   EDITNAME,
   GROUP_INFO,
   IMAGEVIEW,
   RECENTCHATSCREEN,
   USERS_LIST_SCREEN,
   VIEWALLMEDIA,
} from '../screens/constants';
import commonStyles, { modelStyles } from '../styles/commonStyles';
import UserAvathar from './UserAvathar';
import UserStatus from './UserStatus';

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
   // updating default values
   const handlePress = () => onhandlePress(item);

   return (
      <React.Fragment key={index}>
         <Pressable onPress={handlePress}>
            <View style={styles.wrapper}>
               <UserAvathar userId={item?.userId} userProfile={item.userProfile} />
               <View style={[commonStyles.marginLeft_15, commonStyles.flex1]}>
                  <NickName userId={item?.userId} style={styles.nickNameText} numberOfLines={1} ellipsizeMode="tail" />
                  <UserStatus userId={item?.userId} style={styles.stautsText} numberOfLines={1} ellipsizeMode="tail" />
               </View>
               {item.userType === 'o' && <Text style={{ color: ApplicationColors.mainColor }}>Admin</Text>}
            </View>
         </Pressable>
         <View style={commonStyles.dividerLine} />
      </React.Fragment>
   );
};

const GrpCollapsibleToolbar = ({
   chatUser,
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
   const grpscrollY = React.useRef(new Animated.Value(0)).current;
   const [animatedTitleColor, setAnimatedTitleColor] = React.useState(250);
   const [userDetails, setUserDetails] = React.useState({});
   const scrollDistance = toolbarMaxHeight - toolbarMinHeight;
   const { height: screenHeight } = Dimensions.get('window');
   const recentChatList = useFilteredRecentChatData();
   const chatUserId = getUserIdFromJid(chatUser);
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

   const [grpoptionModelOpen, setOptionModelOpen] = React.useState(false);

   const toggleOptionModel = () => {
      setOptionModelOpen(val => !val);
   };

   const translateBottomSlide = React.useRef(new Animated.Value(layout.height)).current;
   React.useEffect(() => {
      if (grpoptionModelOpen) {
         // Animate in if visible
         Animated.timing(translateBottomSlide, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
         }).start();
      } else {
         // Animate out if not visible
         Animated.timing(translateBottomSlide, {
            toValue: layout.height,
            duration: 300,
            useNativeDriver: true,
         }).start();
      }
   }, [grpoptionModelOpen, translateBottomSlide, layout.height]);

   const toggleModalContent = () => {
      setModalContent(null);
   };

   const [modelOpen, setModelOpen] = React.useState(false);

   const toggleModel = () => {
      setModelOpen(val => !val);
   };

   const grpheaderTranslate = grpscrollY.interpolate({
      inputRange: [0, scrollDistance],
      outputRange: [0, -scrollDistance],
      extrapolate: 'clamp',
   });

   const grpimageOpacity = grpscrollY.interpolate({
      inputRange: [0, scrollDistance / 2, scrollDistance],
      outputRange: [1, 1, 0],
      extrapolate: 'clamp',
   });

   const grptitleScale = grpscrollY.interpolate({
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

   const localUser = React.useMemo(() => participants.find(item => isLocalUser(item?.userId), [participants]));

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
      if (participants.length === config.maxAllowdGroupMembers) {
         return showToast('Maximum allowed group members ' + config.maxAllowdGroupMembers, {
            id: 'Maximum_allowed_group_members',
         });
      }
      navigation.navigate(USERS_LIST_SCREEN, {
         prevScreen: GROUP_INFO,
         grpDetails: { jid: chatUser, participants },
      });
   };

   const handelGroupProfileUpdate = () => {
      if (!isNetworkconneted) {
         return showNetWorkToast();
      }
      toggleOptionModel();
   };

   const handleViewImage = () => {
      const image = getUserImage(chatUserId);
      if (!image) {
         return;
      }
      navigation.navigate(IMAGEVIEW, { jid: chatUser });
   };

   const handleEditText = () => {
      navigation.navigate(EDITNAME, { jid: chatUser });
   };

   const handleLeaveGroup = async () => {
      if (!isNetworkconneted) {
         return showNetWorkToast();
      }
      const { statusCode, message } = await SDK.userExitGroup(chatUser, localUser?.userType === 'o');
      if (statusCode === 200) {
         getGroupParticipants(2500);
      } else {
         showToast(message);
      }
   };
   const handleDeleteGroup = async () => {
      if (!isNetworkconneted) {
         return showNetWorkToast();
      }
      if (isNetworkconneted) {
         const { statusCode, message } = await SDK.userDeleteGroup(chatUser);
         if (statusCode === 200) {
            navigation.navigate(RECENTCHATSCREEN);
            dispatch(deleteRecentChatOnUserId(chatUser));
            dispatch(clearChatMessageData({ userId: getUserIdFromJid(chatUser) }));
         } else {
            showToast(message);
         }
      }
   };

   const handleRemoveUser = async () => {
      if (!isNetworkconneted) {
         return showNetWorkToast();
      }
      const { statusCode, message } = await SDK.removeParticipant(
         chatUser,
         userDetails.userJid,
         userDetails.userType === 'o',
      );
      if (statusCode === 200) {
         getGroupParticipants(2500);
      } else {
         showToast(message);
      }
   };

   const handleMakeAdmin = async () => {
      if (!isNetworkconneted) {
         return showNetWorkToast();
      }
      const { statusCode, message } = await SDK.makeAsAdmin(chatUser, userDetails.userJid);
      if (statusCode === 200) {
         getGroupParticipants(2500);
      } else {
         showToast(message);
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
         title: 'Are you sure you want to delete this group?',
         noButton: 'CANCEL',
         yesButton: 'DELETE',
         yesAction: handleDeleteGroup,
      });
   };

   const grphandleViewAllMedia = () => {
      navigation.navigate(VIEWALLMEDIA, { jid: chatUser });
   };

   const handleOptionTakePhoto = () => {
      toggleOptionModel();
      handleTakePhoto();
   };

   const handleOptionGallery = () => {
      toggleOptionModel();
      handleFromGallery();
   };

   const handleOptionRemove = () => {
      toggleOptionModel();
      toggleConfirmRemovePhotoModal();
   };

   return (
      <View style={styles.fill}>
         <Animated.View
            style={[
               styles.header,
               {
                  zIndex: 9,
                  backgroundColor: '#f2f2f2',
                  height: toolbarMaxHeight,
                  transform: [{ translateY: grpheaderTranslate }],
               },
            ]}>
            <Animated.View
               style={[
                  {
                     justifyContent: 'center',
                     alignItems: 'center',
                     backgroundColor: '#f2f2f2',
                     height: toolbarMaxHeight,
                     opacity: grpimageOpacity,
                     shadowColor: '#181818',
                     shadowOffset: { width: 0, height: 6 },
                     shadowOpacity: 0.1,
                     shadowRadius: 6,
                  },
               ]}>
               <Pressable onPress={handleViewImage} style={styles.profileImage}>
                  <InfoImageView userId={chatUserId} style={styles.profileImage} />
               </Pressable>
            </Animated.View>
            <Animated.View
               style={[
                  styles.action,
                  commonStyles.justifyContentSpaceBetween,
                  {
                     backgroundColor: 'transparent',
                     transform: [{ scale: grptitleScale }],
                  },
               ]}>
               <View>
                  <NickName
                     userId={chatUserId}
                     numberOfLines={1}
                     ellipsizeMode="tail"
                     style={[
                        styles.title,
                        {
                           color: animatedTitleColor < 280 ? '#fff' : '#000',
                        },
                     ]}
                  />
                  {animatedTitleColor < 280 && (
                     <Animated.Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[styles.stautsText, commonStyles.colorWhite]}>
                        {participants.length} members
                     </Animated.Text>
                  )}
               </View>
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
                  <LeftArrowIcon color={animatedTitleColor < 280 ? '#fff' : '#000'} />
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
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: grpscrollY } } }], {
               useNativeDriver: true,
               listener: event => {
                  const { y } = event.nativeEvent.contentOffset;
                  setAnimatedTitleColor(y);
               },
            })}>
            <View style={{ marginHorizontal: 12, marginTop: toolbarMaxHeight, minHeight: adaptiveMinHeight }}>
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
                           <Text
                              style={[
                                 commonStyles.marginLeft_8,
                                 commonStyles.fontSize_14,
                                 commonStyles.colorBlack,
                                 commonStyles.fw_500,
                              ]}>
                              Add Participants
                           </Text>
                        </View>
                     </View>
                  </Pressable>
               )}
               {renderParticipants()}
               <View mt="5" />
               <Pressable
                  onPress={grphandleViewAllMedia}
                  contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 10 }}>
                  <View
                     style={[
                        commonStyles.hstack,
                        commonStyles.justifyContentSpaceBetween,
                        commonStyles.alignItemsCenter,
                     ]}>
                     <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                        <GalleryAllIcon />
                        <Text
                           style={[
                              commonStyles.marginLeft_8,
                              commonStyles.fontSize_14,
                              commonStyles.colorBlack,
                              commonStyles.fw_500,
                           ]}>
                           View All Media
                        </Text>
                     </View>
                     <FrontArrowIcon />
                  </View>
               </Pressable>
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
                  {Boolean(localUser?.userType) && localUser?.userType === 'o' && (
                     <>
                        <Pressable
                           onPress={() => {
                              toggleModel();
                              toggleConfirmUserRemoveModal();
                           }}>
                           <Text style={modelStyles.modalOption}>Remove from Group</Text>
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
         <Modal visible={grpoptionModelOpen} onRequestClose={toggleOptionModel}>
            <ModalBottomContent onPressOutside={toggleOptionModel}>
               <Animated.View
                  style={[styles.optionModelContainer, { transform: [{ translateY: translateBottomSlide }] }]}>
                  <Text style={styles.optionTitleText}>Options</Text>
                  <Pressable onPress={handleOptionTakePhoto}>
                     <Text style={styles.pressableText}>Take Photo</Text>
                  </Pressable>
                  <Pressable onPress={handleOptionGallery}>
                     <Text style={styles.pressableText}>Choose from Gallery</Text>
                  </Pressable>
                  {Boolean(getUserImage(chatUserId)) && (
                     <Pressable onPress={handleOptionRemove}>
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
      shadowOffset: { width: 0, height: 3 },
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
      maxWidth: 350,
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
