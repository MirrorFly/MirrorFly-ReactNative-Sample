import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React from 'react';
import { Animated, Dimensions, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import RootNavigation from '../Navigation/rootNavigation';
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
import Text from '../common/Text';
import { useNetworkStatus } from '../common/hooks';
import config from '../config/config';
import { getUserIdFromJid, isLocalUser, showNetWorkToast, showToast } from '../helpers/chatHelpers';
import { getStringSet, replacePlaceholders } from '../localization/stringSet';
import { clearChatMessageData } from '../redux/chatMessageDataSlice';
import { deleteRecentChatOnUserId } from '../redux/recentChatDataSlice';
import { getUserImage, useThemeColorPalatte, useUserType } from '../redux/reduxHook';
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
import MuteToggle from './MuteToggle';

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

const RenderItem = ({ item, index, onhandlePress, stringSet, themeColorPalatte }) => {
   // updating default values
   const handlePress = () => onhandlePress(item);

   return (
      <React.Fragment key={index}>
         <Pressable onPress={handlePress}>
            <View style={styles.groupwrapper}>
               <UserAvathar userId={item?.userId} userProfile={item.userProfile} />
               <View style={[commonStyles.marginLeft_15, commonStyles.flex1]}>
                  <NickName
                     userId={item?.userId}
                     style={[styles.groupnickNameText, { color: themeColorPalatte.primaryTextColor }]}
                     numberOfLines={1}
                     ellipsizeMode="tail"
                  />
                  <UserStatus
                     userId={item?.userId}
                     style={styles.groupstautsText}
                     numberOfLines={1}
                     ellipsizeMode="tail"
                  />
               </View>
               {item.userType === 'o' && (
                  <Text style={{ color: themeColorPalatte.primaryColor }}>
                     {stringSet.INFO_SCREEN.ADMIN_LABEL_TEXT}
                  </Text>
               )}
            </View>
         </Pressable>
         <View style={[commonStyles.dividerLine(themeColorPalatte.dividerBg)]} />
      </React.Fragment>
   );
};

RenderItem.propTypes = {
   item: PropTypes.shape({
      userId: PropTypes.string,
      userProfile: PropTypes.object,
      userType: PropTypes.string,
   }),
   index: PropTypes.number,
   onhandlePress: PropTypes.func,
   stringSet: PropTypes.shape({
      INFO_SCREEN: PropTypes.shape({
         ADMIN_LABEL_TEXT: PropTypes.string,
      }),
   }),
   themeColorPalatte: PropTypes.shape({
      primaryTextColor: PropTypes.string,
      primaryColor: PropTypes.string,
      dividerBg: PropTypes.string,
   }),
};

const GrpCollapsibleToolbar = ({
   chatUser,
   toolbarMaxHeight = 400,
   toolbarMinHeight = 60,
   handleBackBtn,
   participants = [],
   getGroupParticipants,
   handleTakePhoto,
   handleFromGallery,
   handleRemovePhoto,
}) => {
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   const navigation = useNavigation();
   const dispatch = useDispatch();
   const isNetworkconneted = useNetworkStatus();
   const grpscrollY = React.useRef(new Animated.Value(0)).current;
   const [animatedTitleColor, setAnimatedTitleColor] = React.useState(250);
   const [userDetails, setUserDetails] = React.useState({});
   const scrollDistance = toolbarMaxHeight - toolbarMinHeight;
   const { height: screenHeight } = Dimensions.get('window');
   const chatUserId = getUserIdFromJid(chatUser);
   const userType = useUserType(chatUser);
   const layout = useWindowDimensions();
   const [modalContent, setModalContent] = React.useState(null);

   const adaptiveMinHeight = screenHeight * 0.92;

   /**
    * const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    * const pixelRatio = PixelRatio.get();
      const baseFontSize = 45;
    * const scaledFontSize = ((baseFontSize * screenWidth) / 375) * pixelRatio;
    * */

   const [grpoptionModelOpen, setGrpoptionModelOpen] = React.useState(false);

   const toggleOptionModel = () => {
      setGrpoptionModelOpen(val => !val);
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
      return (
         <RenderItem
            item={item}
            index={index}
            onhandlePress={onhandlePress}
            stringSet={stringSet}
            themeColorPalatte={themeColorPalatte}
         />
      );
   };

   const localUser = React.useMemo(() => participants?.find(item => isLocalUser(item?.userId), [participants]));

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
         return showToast(
            replacePlaceholders(stringSet.INFO_SCREEN.MAXIMUM_ALLOWED_GROUP_MEMBERS, {
               maxAllowdGroupMembers: config.maxAllowdGroupMembers,
            }),
         );
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
            RootNavigation.reset(RECENTCHATSCREEN);
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
         title: replacePlaceholders(stringSet.POPUP_TEXT.REMOVE_PARTICIPANT_FROM_GROUP, {
            nickName:
               userDetails?.userProfile?.nickName ||
               userDetails?.userProfile?.mobileNumber ||
               userDetails?.userId ||
               '',
         }),
         noButton: stringSet.BUTTON_LABEL.NO_BUTTON,
         yesButton: stringSet.BUTTON_LABEL.YES_BUTTON,
         yesAction: handleRemoveUser,
      });
   };

   const toggleConfirmRemovePhotoModal = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: stringSet.POPUP_TEXT.REMOVE_PROFILE_HEADER_TITLE,
         noButton: stringSet.BUTTON_LABEL.NO_BUTTON,
         yesButton: stringSet.BUTTON_LABEL.YES_BUTTON,
         yesAction: handleRemovePhoto,
      });
   };

   const toggleConfirmAdminModal = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: replacePlaceholders(stringSet.POPUP_TEXT.MAKE_PARTICIPANT_ADMIN, {
            nickName:
               userDetails?.userProfile?.nickName ||
               userDetails?.userProfile?.mobileNumber ||
               userDetails?.userId ||
               '',
         }),
         noButton: stringSet.BUTTON_LABEL.NO_BUTTON,
         yesButton: stringSet.BUTTON_LABEL.YES_BUTTON,
         yesAction: handleMakeAdmin,
      });
   };

   const toggleLeaveGroup = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: stringSet.INFO_SCREEN.LEAVE_GROUP_HEADER,
         noButton: stringSet.BUTTON_LABEL.CANCEL_BUTTON,
         yesButton: stringSet.BUTTON_LABEL.LEAVE_BUTTON,
         yesAction: handleLeaveGroup,
      });
   };

   const toggleDeleteGroup = () => {
      setModalContent({
         visible: true,
         onRequestClose: toggleModalContent,
         title: stringSet.POPUP_TEXT.DELETE_GROUP_HEADER,
         noButton: stringSet.BUTTON_LABEL.CANCEL_BUTTON,
         yesButton: stringSet.BUTTON_LABEL.DELETE_BUTTON,
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
      <View style={commonStyles.flex1}>
         <Animated.View
            style={[
               styles.grpHeader,
               {
                  zIndex: 9,
                  shadowColor: themeColorPalatte.shadowColor,
                  backgroundColor: themeColorPalatte.appBarColor,
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
               <Pressable onPress={handleViewImage} style={styles.groupprofileImage}>
                  <InfoImageView userId={chatUserId} style={styles.groupprofileImage} />
               </Pressable>
            </Animated.View>
            <Animated.View
               style={[
                  styles.grpAction,
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
                        styles.grouptitle,
                        {
                           color: animatedTitleColor < 280 ? '#fff' : themeColorPalatte.primaryTextColor,
                        },
                     ]}
                  />
                  {animatedTitleColor < 280 && (
                     <Animated.Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[styles.groupstautsText, commonStyles.colorWhite]}>
                        {stringSet.INFO_SCREEN.MEMBERS_LABEL_TEXT.replace('{participantslength}', participants.length)}
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
         <Animated.View style={styles.grpBar}>
            <View style={styles.groupleft}>
               <IconButton onPress={handleBackBtn}>
                  <LeftArrowIcon color={animatedTitleColor < 280 ? '#fff' : themeColorPalatte.iconColor} />
               </IconButton>
            </View>
            {Boolean(userType) && (
               <Pressable onPress={handelGroupProfileUpdate} style={styles.groupleft}>
                  <ImageEditIcon
                     width="25"
                     height="25"
                     color={animatedTitleColor < 280 ? '#fff' : themeColorPalatte.iconColor}
                  />
               </Pressable>
            )}
         </Animated.View>
         <Animated.ScrollView
            bounces={false}
            style={commonStyles.flex1}
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
                           <AddUserIcon color={themeColorPalatte.iconColor} />
                           <Text
                              style={[
                                 commonStyles.marginLeft_8,
                                 commonStyles.fontSize_14,
                                 commonStyles.fw_500,
                                 { color: themeColorPalatte.primaryTextColor },
                              ]}>
                              {stringSet.INFO_SCREEN.ADD_PARTICIPANTS}
                           </Text>
                        </View>
                     </View>
                  </Pressable>
               )}
               <View
                  style={[
                     commonStyles.hstack,
                     { marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f2f2f2' },
                  ]}>
                  <MuteToggle chatUser={chatUser} />
               </View>
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
                        <GalleryAllIcon color={themeColorPalatte.iconColor} />
                        <Text
                           style={[
                              commonStyles.marginLeft_8,
                              commonStyles.fontSize_14,
                              { color: themeColorPalatte.primaryTextColor },
                              commonStyles.fw_500,
                           ]}>
                           {stringSet.INFO_SCREEN.VIEW_ALL_MEDIA}
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
                  <Pressable
                     onPress={toggleLeaveGroup}
                     contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 10 }}>
                     <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                        <ExitIcon color="#ff3939" />
                        <Text style={styles.groupgroupActionButton}>{stringSet.INFO_SCREEN.LEAVE_GROUP_LABEL}</Text>
                     </View>
                  </Pressable>
               )}
               {!userType && (
                  <Pressable onPress={toggleDeleteGroup}>
                     <View style={[commonStyles.hstack, commonStyles.alignItemsCenter, commonStyles.p_10]}>
                        <ExitIcon color="#ff3939" />
                        <Text style={styles.groupgroupActionButton}>{stringSet.INFO_SCREEN.DELETE_GROUP_LABEL}</Text>
                     </View>
                  </Pressable>
               )}
               <View mb="5" />
            </View>
         </Animated.ScrollView>
         <Modal visible={modelOpen} onRequestClose={toggleModel}>
            <ModalCenteredContent onPressOutside={toggleModel}>
               <View
                  style={[
                     modelStyles.inviteFriendModalContentContainer,
                     commonStyles.bg_color(themeColorPalatte.screenBgColor),
                  ]}>
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
                           <Text style={modelStyles.modalOption(themeColorPalatte.primaryTextColor)}>
                              {stringSet.INFO_SCREEN.REMOVE_FROM_GROUP}
                           </Text>
                        </Pressable>
                        {userDetails.userType !== 'o' && (
                           <Pressable
                              onPress={() => {
                                 toggleModel();
                                 toggleConfirmAdminModal();
                              }}>
                              <Text style={modelStyles.modalOption(themeColorPalatte.primaryTextColor)}>
                                 {stringSet.INFO_SCREEN.MAKE_ADMIN_BUTTON}
                              </Text>
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
                  style={[
                     styles.groupoptionModelContainer,
                     { transform: [{ translateY: translateBottomSlide }], backgroundColor: themeColorPalatte.screenBgColor },
                  ]}>
                  <Text
                     style={[styles.groupoptionTitleText, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}>
                     {stringSet.INFO_SCREEN.PROFILE_PIC_EDIT_HEADER}
                  </Text>
                  <Pressable onPress={handleOptionTakePhoto}>
                     <Text
                        style={[styles.grouppressableText, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}>
                        {stringSet.COMMON_TEXT.TAKE_PHOTO}
                     </Text>
                  </Pressable>
                  <Pressable onPress={handleOptionGallery}>
                     <Text
                        style={[styles.grouppressableText, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}>
                        {stringSet.COMMON_TEXT.CHOOSE_FROM_GALLERY}
                     </Text>
                  </Pressable>
                  {Boolean(getUserImage(chatUserId)) && (
                     <Pressable onPress={handleOptionRemove}>
                        <Text
                           style={[
                              styles.grouppressableText,
                              commonStyles.textColor(themeColorPalatte.primaryTextColor),
                           ]}>
                           {stringSet.COMMON_TEXT.REMOVE_PHOTO}
                        </Text>
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

export default GrpCollapsibleToolbar;
const styles = StyleSheet.create({
   grpHeader: {
      top: 0,
      left: 0,
      right: 0,
      /** overflow: 'hidden', commented to display shadow in iOS */
      position: 'absolute',
      elevation: 5,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
   },
   grpAction: {
      left: 20,
      right: 20,
      bottom: 15,
      flexDirection: 'row',
      position: 'absolute',
   },
   grpBar: {
      zIndex: 10,
      height: 65,
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
   groupleft: {
      top: 0,
      left: 0,
      width: 50,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
   },
   groupright: {
      top: 0,
      right: 0,
      width: 50,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
   },
   grouptitle: {
      fontSize: 25,
      paddingVertical: 2,
      alignItems: 'center',
      maxWidth: 350,
   },
   groupprofileImage: {
      width: '100%',
      height: '100%',
   },
   groupwrapper: {
      width: '100%',
      marginVertical: 12,
      paddingLeft: 16,
      paddingRight: 20,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
   },
   groupnickNameText: {
      flexWrap: 'wrap',
      fontWeight: 'bold',
      marginVertical: 2,
   },
   groupstautsText: {
      marginVertical: 2,
   },
   groupdivider: {
      width: '83%',
      height: 1,
      alignSelf: 'flex-end',
   },
   groupoptionTitleText: {
      fontSize: 16,
      marginVertical: 5,
      marginHorizontal: 20,
      lineHeight: 25,
   },
   groupoptionModelContainer: {
      maxWidth: 500,
      width: '98%',
      paddingVertical: 12,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      borderBottomWidth: 3,
   },
   grouppressableText: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      fontWeight: '600',
   },
   groupgroupActionButton: { marginLeft: 20, fontSize: 14, color: '#FF0000' },
});
