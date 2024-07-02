import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React from 'react';
import { Animated, Dimensions, PixelRatio, StyleSheet, Text, View } from 'react-native';
import AlertModal from '../common/AlertModal';
import IconButton from '../common/IconButton';
import { CallIcon, FrontArrowIcon, GalleryAllIcon, LeftArrowIcon, MailIcon, StatusIcon } from '../common/Icons';
import InfoImageView from '../common/InfoImageView';
import Pressable from '../common/Pressable';
import ApplicationColors from '../config/appColors';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { CHAT_TYPE_SINGLE } from '../helpers/constants';
import { VIEWALLMEDIA } from '../screens/constants';
import commonStyles from '../styles/commonStyles';
import MuteToggle from './MuteToggle';

const propTypes = {
   chatUser: PropTypes.string,
   title: PropTypes.string,
   toolbarMaxHeight: PropTypes.number,
   toolbarMinHeight: PropTypes.number,
   imageToken: PropTypes.string,
   handleBackBtn: PropTypes.func,
};

const defaultProps = {
   title: '',
   toolbarMaxHeight: 400,
   toolbarMinHeight: 60,
   handleBackBtn: () => {},
   imageToken: '',
};

const CollapsibleToolbar = ({
   chatUser,
   bgColor,
   title,
   imageToken,
   titleStatus,
   toolbarMaxHeight,
   toolbarMinHeight,
   mobileNo,
   email,
   handleBackBtn,
}) => {
   const navigation = useNavigation();
   const scrollY = React.useRef(new Animated.Value(0)).current;
   const [animatedTitleColor, setAnimatedTitleColor] = React.useState(250);
   const scrollDistance = toolbarMaxHeight - toolbarMinHeight;
   const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
   const chatUserId = getUserIdFromJid(chatUser);
   const [modalContent, setModalContent] = React.useState(null);

   const adaptiveMinHeight = screenHeight * 0.92;
   const pixelRatio = PixelRatio.get();
   const baseFontSize = 45;
   const scaledFontSize = ((baseFontSize * screenWidth) / 375) * pixelRatio;

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

   const handleViewAllMedia = () => {
      navigation.navigate(VIEWALLMEDIA, { jid: chatUser });
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
                  transform: [{ translateY: headerTranslate }],
               },
            ]}>
            <Animated.View
               style={[
                  {
                     justifyContent: 'center',
                     alignItems: 'center',
                     height: toolbarMaxHeight,
                     backgroundColor: bgColor,
                     opacity: imageOpacity,
                     shadowColor: '#181818',
                     shadowOffset: { width: 0, height: 6 },
                     shadowOpacity: 0.1,
                     shadowRadius: 6,
                  },
               ]}>
               <InfoImageView
                  type={CHAT_TYPE_SINGLE}
                  userId={chatUserId}
                  style={styles.profileImage}
                  scaledFontSize={scaledFontSize}
               />
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
               <View>
                  <Animated.Text
                     style={[
                        styles.title,
                        {
                           color: animatedTitleColor < 280 ? '#fff' : '#000',
                        },
                     ]}>
                     {title}
                  </Animated.Text>
                  {animatedTitleColor < 280 && (
                     <Animated.Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[styles.stautsText, commonStyles.colorWhite]}>
                        {titleStatus}
                     </Animated.Text>
                  )}
               </View>
            </Animated.View>
         </Animated.View>
         <Animated.View style={styles.bar}>
            <View style={styles.left}>
               <IconButton onPress={handleBackBtn}>
                  <LeftArrowIcon color={animatedTitleColor < 280 ? '#fff' : '#000'} />
               </IconButton>
            </View>
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
               <View>
                  <View
                     style={[
                        commonStyles.hstack,
                        { marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f2f2f2' },
                     ]}>
                     <MuteToggle chatUser={chatUser} />
                  </View>
                  <View style={{ marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f2f2f2' }}>
                     <Text style={{ marginBottom: 8, fontSize: 14, color: '#181818', fontWeight: '800' }}>Email</Text>
                     <View style={commonStyles.hstack}>
                        <MailIcon />
                        <Text
                           style={{
                              marginBottom: 8,
                              marginLeft: 8,
                              fontSize: 13,
                              color: '#959595',
                           }}>
                           {email}
                        </Text>
                     </View>
                  </View>
                  <View style={{ marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f2f2f2' }}>
                     <Text style={{ marginBottom: 8, fontSize: 14, color: '#181818', fontWeight: '800' }}>
                        Mobile Number
                     </Text>
                     <View style={commonStyles.hstack}>
                        <CallIcon />
                        <Text
                           style={{
                              marginBottom: 8,
                              marginLeft: 8,
                              fontSize: 13,
                              color: '#959595',
                           }}>
                           {mobileNo}
                        </Text>
                     </View>
                  </View>
                  <View style={{ marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f2f2f2' }}>
                     <Text style={{ marginBottom: 8, fontSize: 14, color: '#181818', fontWeight: '800' }}>Status</Text>
                     <View style={commonStyles.hstack}>
                        <StatusIcon />
                        <Text
                           style={{
                              marginBottom: 8,
                              marginLeft: 8,
                              fontSize: 13,
                              color: '#959595',
                           }}>
                           {titleStatus}
                        </Text>
                     </View>
                  </View>
                  <View style={styles.divider} />
               </View>
               <Pressable
                  onPress={handleViewAllMedia}
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
            </View>
         </Animated.ScrollView>
         {modalContent && <AlertModal {...modalContent} />}
      </View>
   );
};

CollapsibleToolbar.propTypes = propTypes;
CollapsibleToolbar.defaultProps = defaultProps;

export default CollapsibleToolbar;
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
