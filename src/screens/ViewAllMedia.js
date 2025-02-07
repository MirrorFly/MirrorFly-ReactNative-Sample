import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Animated, BackHandler, Dimensions, I18nManager, StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import IconButton from '../common/IconButton';
import { LeftArrowIcon } from '../common/Icons';
import NickName from '../common/NickName';
import Pressable from '../common/Pressable';
import Text from '../common/Text';
import DocumentTab from '../components/DocumentTab';
import LinksTab from '../components/LinksTab';
import { default as MediaTab } from '../components/MediaTab';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { getStringSet } from '../localization/stringSet';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

const { width: screenWidth } = Dimensions.get('window');

// Function to fetch count based on message_type
export const getMessageTypeCount = (_messages, messageType) => {
   return _messages.filter(
      message =>
         message?.msgBody.message_type === messageType &&
         message.deleteStatus !== 1 &&
         message.recallStatus !== 1 &&
         message?.msgBody?.media?.is_uploading === 2 &&
         message?.msgBody?.media?.is_downloaded === 2,
   ).length;
};

const ViewAllMedia = () => {
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   const navigation = useNavigation();
   const {
      params: { jid = '' },
   } = useRoute();
   const pagerRef = React.useRef();
   const chatUserId = getUserIdFromJid(jid);
   const [index, setIndex] = React.useState(0);

   const [indicatorPosition] = React.useState(new Animated.Value(0)); // State to track the position of the active tab indicator
   const [indicatorWidth] = React.useState(screenWidth / 3); // State to track the width of the active tab indicator
   const isRTL = I18nManager.isRTL;

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
      };
   }, []);

   const handleBackBtn = () => {
      navigation.goBack();
      return true;
   };

   const handleTabPress = tabIndex => () => {
      pagerRef.current.setPage(tabIndex);
   };

   // Function to animate the movement of the active tab indicator
   const animateIndicator = toValue => {
      Animated.timing(indicatorPosition, {
         toValue,
         duration: 200, // Adjust the duration of the animation as needed
         useNativeDriver: false,
      }).start();
   };

   React.useEffect(() => {
      const tabWidth = screenWidth / 3; // Adjust the width of each tab as needed
      const direction = isRTL ? -1 : 1;
      animateIndicator(index * tabWidth * direction);
   }, [index]);

   const tabBar = React.useMemo(
      () => (
         <View style={[styles.mediaTabBar, { backgroundColor: themeColorPalatte.appBarColor }]}>
            <Pressable pressedStyle={{}} style={[styles.mediaTabItem]} onPress={handleTabPress(0)}>
               <View style={commonStyles.hstack}>
                  <Text
                     style={[
                        styles.mediaTabText,
                        index === 0
                           ? {
                                color: themeColorPalatte.primaryColor, // Color of the active tab text
                             }
                           : {
                                color: themeColorPalatte.primaryTextColor, // Color of the inactive tab text
                             },
                     ]}>
                     {stringSet.VIEW_ALL_MEDIA_SCREEN.TAB_HEADER_MEDIA}
                  </Text>
               </View>
            </Pressable>
            <Pressable pressedStyle={{}} style={[styles.mediaTabItem]} onPress={handleTabPress(1)}>
               <Text
                  style={[
                     styles.mediaTabText,
                     index === 1
                        ? {
                             color: themeColorPalatte.primaryColor, // Color of the active tab text
                          }
                        : {
                             color: themeColorPalatte.primaryTextColor, // Color of the inactive tab text
                          },
                  ]}>
                  {stringSet.VIEW_ALL_MEDIA_SCREEN.TAB_HEADER_DOCS}
               </Text>
            </Pressable>
            <Pressable pressedStyle={{}} style={[styles.mediaTabItem]} onPress={handleTabPress(2)}>
               <Text
                  style={[
                     styles.mediaTabText,
                     index === 2
                        ? {
                             color: themeColorPalatte.primaryColor, // Color of the active tab text
                          }
                        : {
                             color: themeColorPalatte.primaryTextColor, // Color of the inactive tab text
                          },
                  ]}>
                  {stringSet.VIEW_ALL_MEDIA_SCREEN.TAB_HEADER_LINKS}
               </Text>
            </Pressable>
            {/* Animated active tab indicator */}
            <Animated.View
               style={[
                  styles.mediaIndicator,
                  {
                     transform: [{ translateX: indicatorPosition }],
                     width: indicatorWidth,
                     backgroundColor: themeColorPalatte.primaryColor, // Color of the active tab indicator
                  },
               ]}
            />
         </View>
      ),
      [index, themeColorPalatte],
   );

   const renderPagerView = React.useMemo(
      () => (
         <PagerView
            ref={pagerRef}
            style={commonStyles.flex1}
            initialPage={index}
            onPageSelected={e => setIndex(e.nativeEvent.position)}>
            <View key="1" style={[commonStyles.marginTop_5]}>
               <MediaTab chatUserId={chatUserId} jid={jid} />
            </View>
            <View key="2" style={[commonStyles.marginTop_5]}>
               <DocumentTab jid={jid} />
            </View>
            <View key="3" style={[commonStyles.marginTop_5]}>
               <LinksTab chatUserId={chatUserId} jid={jid} />
            </View>
         </PagerView>
      ),
      [],
   );

   return (
      <View style={[styles.tabContainer, { backgroundColor: themeColorPalatte.screenBgColor }]}>
         <View
            style={[styles.headerContainer, commonStyles.hstack, { backgroundColor: themeColorPalatte.appBarColor }]}>
            <View
               style={[
                  commonStyles.hstack,
                  commonStyles.alignItemsCenter,
                  commonStyles.flex1,
                  commonStyles.marginLeft_10,
               ]}>
               <IconButton onPress={handleBackBtn}>
                  <LeftArrowIcon color={themeColorPalatte.iconColor} />
               </IconButton>
               <NickName
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  style={[styles.titleText, { color: themeColorPalatte.headerPrimaryTextColor }]}
                  userId={chatUserId}
               />
            </View>
         </View>
         {tabBar}
         {renderPagerView}
      </View>
   );
};
export default ViewAllMedia;
const styles = StyleSheet.create({
   mediaTabBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
   },
   mediaTabItem: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      height: 50,
      width: '33.33%',
   },
   mediaTabText: {
      fontSize: 16,
      fontWeight: 'bold',
   },
   mediaIndicator: {
      position: 'absolute',
      bottom: 0,
      height: 3,
   },
   mediapagerView: {
      flex: 1,
   },
   parentContainer: {
      flex: 1,
      backgroundColor: '#fff',
   },
   headerContainer: {
      height: 60,
   },
   titleText: {
      fontSize: 18,
      paddingHorizontal: 12,
      fontWeight: '500',
      width: 250,
   },
   tabContainer: {
      flex: 1,
   },
   tabbar: {
      backgroundColor: '#F2F2F2',
      color: 'black',
   },
   tabbarIndicator: {
      borderWidth: 1.3,
   },
   tabarLabel: {
      color: 'black',
      fontWeight: 'bold',
   },
   bottomCountContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      paddingVertical: 10,
   },
});
