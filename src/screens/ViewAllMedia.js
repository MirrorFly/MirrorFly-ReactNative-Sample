import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Animated, BackHandler, Dimensions, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import IconButton from '../common/IconButton';
import { LeftArrowIcon } from '../common/Icons';
import NickName from '../common/NickName';
import Pressable from '../common/Pressable';
import DocumentTab from '../components/DocumentTab';
import { default as MediaTab } from '../components/MediaTab';
import ApplicationColors from '../config/appColors';
import { getUserIdFromJid } from '../helpers/chatHelpers';
import { useChatMessages } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

const { width: screenWidth } = Dimensions.get('window');

// Function to fetch count based on message_type
export const getMessageTypeCount = (_messages, messageType) => {
   return _messages.filter(
      message =>
         message?.msgBody.message_type === messageType && message.deleteStatus !== 1 && message.recallStatus !== 1,
   ).length;
};

const ViewAllMedia = () => {
   const navigation = useNavigation();
   const {
      params: { jid = '' },
   } = useRoute();
   const pagerRef = React.useRef();
   const chatUserId = getUserIdFromJid(jid);
   const messagesArr = useChatMessages(chatUserId);
   const [index, setIndex] = React.useState(0);
   const [loading, setLoading] = React.useState(true);
   const [countBasedOnType, setCountBasedOnType] = React.useState({});
   const [mediaMessages, setMediaMessages] = React.useState([]);
   const [docsMessages, setDocsMessages] = React.useState([]);
   const [indicatorPosition] = React.useState(new Animated.Value(0)); // State to track the position of the active tab indicator
   const [indicatorWidth] = React.useState(screenWidth / 3); // State to track the width of the active tab indicator

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
      };
   }, []);

   React.useEffect(() => {
      handleGetMedia();
   }, [messagesArr]);

   const messageList = React.useMemo(() => {
      const filteredMessages = messagesArr.filter(message => {
         const { msgBody: { message_type = '' } = {} } = message || {};
         return ['image', 'video', 'audio', 'file'].includes(message_type);
      });
      return filteredMessages;
   }, [messagesArr, jid]);

   const handleGetMedia = async () => {
      const imageCount = messageList?.reverse()?.filter(res => ['image'].includes(res.message_type));
      setCountBasedOnType({
         ...countBasedOnType,
         imageCount: imageCount.length,
      });
      const filtedMediaMessages = messageList.filter(res =>
         ['image', 'video', 'audio'].includes(res?.msgBody?.message_type),
      );
      const filtedDocsMessages = messageList.filter(res => ['file'].includes(res?.msgBody?.message_type));
      setDocsMessages(filtedDocsMessages || []);
      setMediaMessages(filtedMediaMessages || []);
      setLoading(false);
   };

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
      const toValue = index * tabWidth;
      animateIndicator(toValue);
   }, [index]);

   const tabBar = React.useMemo(
      () => (
         <View style={styles.mediaTabBar}>
            <Pressable pressedStyle={{}} style={[styles.mediaTabItem, { width: '33.33%' }]} onPress={handleTabPress(0)}>
               <View style={commonStyles.hstack}>
                  <Text
                     style={[
                        styles.mediaTabText,
                        index === 0 ? styles.mediaActiveTabText : styles.mediaInactiveTabText,
                     ]}>
                     Media
                  </Text>
               </View>
            </Pressable>
            <Pressable pressedStyle={{}} style={[styles.mediaTabItem, { width: '33.33%' }]} onPress={handleTabPress(1)}>
               <Text
                  style={[styles.mediaTabText, index === 1 ? styles.mediaActiveTabText : styles.mediaInactiveTabText]}>
                  Docs
               </Text>
            </Pressable>
            <Pressable pressedStyle={{}} style={[styles.mediaTabItem, { width: '33.33%' }]} onPress={handleTabPress(2)}>
               <Text
                  style={[styles.mediaTabText, index === 2 ? styles.mediaActiveTabText : styles.mediaInactiveTabText]}>
                  Links
               </Text>
            </Pressable>
            {/* Animated active tab indicator */}
            <Animated.View
               style={[
                  styles.mediaIndicator,
                  { transform: [{ translateX: indicatorPosition }], width: indicatorWidth },
               ]}
            />
         </View>
      ),
      [index],
   );

   const renderPagerView = React.useMemo(
      () => (
         <PagerView
            ref={pagerRef}
            style={commonStyles.flex1}
            initialPage={index}
            onPageSelected={e => setIndex(e.nativeEvent.position)}>
            <View key="1">
               <View>
                  {!loading && mediaMessages.length === 0 ? (
                     <View
                        style={[
                           commonStyles.justifyContentCenter,
                           commonStyles.alignItemsCenter,
                           commonStyles.height_100_per,
                        ]}>
                        <Text>No Media Found ...!!!</Text>
                     </View>
                  ) : (
                     <View style={commonStyles.marginTop_5}>
                        <MediaTab mediaMessages={mediaMessages} loading={loading} />
                     </View>
                  )}
               </View>
            </View>
            <View key="2">
               <View>
                  {!loading && docsMessages.length === 0 ? (
                     <View
                        style={[
                           commonStyles.justifyContentCenter,
                           commonStyles.alignItemsCenter,
                           commonStyles.height_100_per,
                        ]}>
                        <Text>No Docs Found...!!!</Text>
                     </View>
                  ) : (
                     <View style={[commonStyles.marginTop_5, commonStyles.padding_8]}>
                        <DocumentTab docsMessages={docsMessages} loading={loading} />
                     </View>
                  )}
               </View>
            </View>
            <View
               key="3"
               style={[commonStyles.flex1, commonStyles.justifyContentCenter, commonStyles.alignItemsCenter]}>
               <Text> No Links Found...!!!</Text>
            </View>
         </PagerView>
      ),
      [mediaMessages, docsMessages],
   );

   return (
      <View style={styles.tabContainer}>
         <View style={[styles.headerContainer, commonStyles.hstack]}>
            <View
               style={[
                  commonStyles.hstack,
                  commonStyles.alignItemsCenter,
                  commonStyles.flex1,
                  commonStyles.marginLeft_10,
               ]}>
               <IconButton onPress={handleBackBtn}>
                  <LeftArrowIcon color={'#000'} />
               </IconButton>
               <NickName ellipsizeMode="tail" numberOfLines={1} style={styles.titleText} userId={chatUserId} />
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
      backgroundColor: ApplicationColors.headerBg,
   },
   mediaTabItem: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      height: 50,
   },
   mediaTabText: {
      fontSize: 16,
      fontWeight: 'bold',
   },
   mediaActiveTabText: {
      color: ApplicationColors.mainColor, // Color of the active tab text
   },
   mediaInactiveTabText: {
      color: 'black', // Color of the inactive tab text
   },
   mediaIndicator: {
      position: 'absolute',
      bottom: 0,
      height: 3,
      backgroundColor: ApplicationColors.mainColor, // Color of the active tab indicator
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
      backgroundColor: ApplicationColors.headerBg,
   },
   titleText: {
      fontSize: 18,
      paddingHorizontal: 12,
      fontWeight: '500',
      color: ApplicationColors.black,
   },
   tabContainer: {
      flex: 1,
      backgroundColor: '#fff',
   },
   tabbar: {
      backgroundColor: '#F2F2F2',
      color: 'black',
   },
   tabbarIndicator: {
      backgroundColor: '#3276E2',
      borderColor: '#3276E2',
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
