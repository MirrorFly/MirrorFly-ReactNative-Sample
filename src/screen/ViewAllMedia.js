import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, Animated, BackHandler, Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSelector } from 'react-redux';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import IconButton from '../common/IconButton';
import { LeftArrowIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import commonStyles from '../common/commonStyles';
import DocTile from '../components/DocTile';
import MediaTile from '../components/MediaTile';
import NickName from '../components/NickName';
import ApplicationColors from '../config/appColors';
import { MEDIA_POST_PRE_VIEW_SCREEN } from '../constant';

const LeftArrowComponent = () => LeftArrowIcon();

const { width: screenWidth } = Dimensions.get('window');

const ViewAllMedia = () => {
   const navigation = useNavigation();
   const {
      params: { jid = '' },
   } = useRoute();
   const pagerRef = React.useRef();
   const chatUserId = getUserIdFromJid(jid);
   const messages = useSelector(state => state.chatConversationData.data[chatUserId]);
   const messagesArr = Object.values(messages.messages);
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
   }, [messages]);

   const messageList = React.useMemo(() => {
      const filteredMessages = messagesArr.filter(message => {
         const { message_type = '' } = message || {};
         return ['image', 'video', 'audio', 'file'].includes(message_type);
      });
      return filteredMessages;
   }, [messages, jid]);

   // Function to fetch count based on message_type
   const getMessageTypeCount = (_messages, messageType) => {
      return _messages.filter(message => message.message_type === messageType).length;
   };

   const handleGetMedia = async () => {
      const imageCount = messageList?.reverse()?.filter(res => ['image'].includes(res.message_type));
      setCountBasedOnType({
         ...countBasedOnType,
         imageCount: imageCount.length,
      });
      const filtedMediaMessages = messageList.filter(res => ['image', 'video', 'audio'].includes(res?.message_type));
      const filtedDocsMessages = messageList.filter(res => ['file'].includes(res?.message_type));
      setDocsMessages(filtedDocsMessages || []);
      setMediaMessages(filtedMediaMessages || []);
      setLoading(false);
   };

   const handleBackBtn = () => {
      navigation.goBack();
      return true;
   };

   const handleMediaDeleteMessageId = msgId => {
      // Filter out the deleted message from the mediaMessages state
      const updatedMediaMessages = mediaMessages.filter(message => message.msgId !== msgId);

      // Update the mediaMessages state with the filtered messages
      setMediaMessages(updatedMediaMessages);
   };

   const handleDocDeleteMessageId = msgId => {
      // Filter out the deleted message from the mediaMessages state
      const updatedDocMessages = docsMessages.filter(message => message.msgId !== msgId);

      // Update the mediaMessages state with the filtered messages
      setDocsMessages(updatedDocMessages);
   };

   const handleTabPress = tabIndex => () => {
      pagerRef.current.setPage(tabIndex);
   };

   const renderImageCountLabel = () => {
      return getMessageTypeCount(mediaMessages, 'image') > 1
         ? getMessageTypeCount(mediaMessages, 'image') + ' Photos'
         : getMessageTypeCount(mediaMessages, 'image') + ' Photo';
   };

   const renderVideoCountLabel = () => {
      return getMessageTypeCount(mediaMessages, 'video') > 1
         ? getMessageTypeCount(mediaMessages, 'video') + ' Videos'
         : getMessageTypeCount(mediaMessages, 'video') + ' Video';
   };

   const renderAudioCountLabel = () => {
      return getMessageTypeCount(mediaMessages, 'audio') > 1
         ? getMessageTypeCount(mediaMessages, 'audio') + ' Audios'
         : getMessageTypeCount(mediaMessages, 'audio') + ' Audio';
   };

   const renderDocCountLabel = () => {
      return getMessageTypeCount(docsMessages, 'file') > 1
         ? getMessageTypeCount(docsMessages, 'file') + ' Documents'
         : getMessageTypeCount(docsMessages, 'file') + ' Document';
   };

   const renderMediaFooter = () => {
      return (
         <>
            {mediaMessages.length > 0 && (
               <Text style={[commonStyles.textCenter, commonStyles.colorBlack]}>
                  {renderImageCountLabel()}, {renderVideoCountLabel()}, {renderAudioCountLabel()}
               </Text>
            )}
            {loading && (
               <View style={[commonStyles.mb_130, commonStyles.marginTop_5]}>
                  <ActivityIndicator size="large" color={ApplicationColors.mainColor} />
               </View>
            )}
         </>
      );
   };

   const renderDocFooter = () => {
      return (
         <>
            {docsMessages.length > 0 && (
               <Text style={[commonStyles.textCenter, commonStyles.colorBlack]}>{renderDocCountLabel()}</Text>
            )}
            {loading && (
               <View style={[commonStyles.mb_130, commonStyles.marginTop_5]}>
                  <ActivityIndicator size="large" color={ApplicationColors.mainColor} />
               </View>
            )}
         </>
      );
   };

   const renderTileBasedOnMessageType = item => {
      return <MediaTile item={item} onDelete={handleMediaDeleteMessageId} />;
   };

   const renderMediaTile = ({ item }) => {
      const handleMediaPress = () => {
         navigation.navigate(MEDIA_POST_PRE_VIEW_SCREEN, { jid, msgId: item.msgId });
      };
      return <Pressable onPress={handleMediaPress}>{renderTileBasedOnMessageType(item)}</Pressable>;
   };

   const renderDocTile = ({ item }) => {
      return <DocTile item={item} onDelete={handleDocDeleteMessageId} />;
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
         <View style={styles.tabBar}>
            <Pressable pressedStyle={{}} style={[styles.tabItem, { width: '33.33%' }]} onPress={handleTabPress(0)}>
               <View style={commonStyles.hstack}>
                  <Text style={[styles.tabText, index === 0 ? styles.activeTabText : styles.inactiveTabText]}>
                     Media
                  </Text>
               </View>
            </Pressable>
            <Pressable pressedStyle={{}} style={[styles.tabItem, { width: '33.33%' }]} onPress={handleTabPress(1)}>
               <Text style={[styles.tabText, index === 1 ? styles.activeTabText : styles.inactiveTabText]}>Docs</Text>
            </Pressable>
            <Pressable pressedStyle={{}} style={[styles.tabItem, { width: '33.33%' }]} onPress={handleTabPress(2)}>
               <Text style={[styles.tabText, index === 2 ? styles.activeTabText : styles.inactiveTabText]}>Links</Text>
            </Pressable>
            {/* Animated active tab indicator */}
            <Animated.View
               style={[styles.indicator, { transform: [{ translateX: indicatorPosition }], width: indicatorWidth }]}
            />
         </View>
      ),
      [index],
   );

   const renderPagerView = React.useMemo(
      () => (
         <PagerView
            ref={pagerRef}
            style={styles.pagerView}
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
                        <FlatList
                           numColumns={4}
                           keyExtractor={item => item.msgId}
                           data={mediaMessages}
                           bounces={false}
                           ListFooterComponent={renderMediaFooter}
                           renderItem={renderMediaTile}
                           initialNumToRender={20}
                           maxToRenderPerBatch={20}
                           windowSize={15}
                        />
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
                        <FlatList
                           showsVerticalScrollIndicator={false}
                           data={docsMessages}
                           keyExtractor={item => item.msgId}
                           bounces={false}
                           renderItem={renderDocTile}
                           ListFooterComponent={renderDocFooter}
                           initialNumToRender={20}
                           maxToRenderPerBatch={20}
                           windowSize={15}
                        />
                     </View>
                  )}
               </View>
            </View>
            <View key="3">
               <View style={[commonStyles.justifyContentCenter, commonStyles.alignItemsCenter, commonStyles.flex1]}>
                  <Text> No Links Found...!!!</Text>
               </View>
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
                  <LeftArrowComponent />
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
   tabBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: ApplicationColors.headerBg,
   },
   tabItem: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      height: 50,
   },
   tabText: {
      fontSize: 16,
      fontWeight: 'bold',
   },
   activeTabText: {
      color: ApplicationColors.mainColor, // Color of the active tab text
   },
   inactiveTabText: {
      color: 'black', // Color of the inactive tab text
   },
   indicator: {
      position: 'absolute',
      bottom: 0,
      height: 3,
      backgroundColor: ApplicationColors.mainColor, // Color of the active tab indicator
   },
   pagerView: {
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
