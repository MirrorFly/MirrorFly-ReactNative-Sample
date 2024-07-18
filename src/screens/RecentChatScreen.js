import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Animated, BackHandler, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useDispatch } from 'react-redux';
import { FloatingBtn } from '../common/Button';
import RecentCalls from '../components/RecentCall';
import RecentChat from '../components/RecentChat';
import RecentChatHeader from '../components/RecentChatHeader';
import ApplicationColors from '../config/appColors';
import { resetChatSelections } from '../redux/recentChatDataSlice';
import { useFilteredRecentChatData } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { USERS_LIST_SCREEN } from './constants';

const { width: screenWidth } = Dimensions.get('window');
const tabWidth = screenWidth / 2;

function RecentChatScreen() {
   const pagerRef = React.useRef();
   const navigation = useNavigation();
   const dispatch = useDispatch();
   const recentChatData = useFilteredRecentChatData();
   const [index, setIndex] = React.useState(0);
   const [chatsBadge, setChatsBadge] = React.useState(0);
   const [indicatorPosition] = React.useState(new Animated.Value(0));
   const indicatorWidth = screenWidth / 2;

   const isAnySelected = React.useMemo(() => {
      return recentChatData.some(item => item.isSelected === 1);
   }, [recentChatData.map(item => item.isSelected).join(',')]); // Include isSelected in the dependency array

   React.useEffect(() => {
      if (recentChatData.length) {
         const unreadChatCount = recentChatData.filter(d => d.unreadCount > 0).length;
         setChatsBadge(unreadChatCount > 99 ? '99+' : String(unreadChatCount || 0));
      } else {
         setChatsBadge(0);
      }
   }, [recentChatData]);

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => backHandler.remove();
   }, [isAnySelected, index]);

   React.useEffect(() => {
      const toValue = index * tabWidth;
      animateIndicator(toValue);
   }, [index]);

   const handleBackBtn = React.useCallback(() => {
      switch (true) {
         case index !== 0:
            setIndex(0);
            pagerRef.current.setPage(0);
            break;
         case isAnySelected:
            dispatch(resetChatSelections());
            break;
         case navigation.canGoBack():
            navigation.goBack();
            break;
         default:
            BackHandler.exitApp();
            break;
      }
      return true;
   }, [recentChatData, index]);

   // Function to handle tab press
   const handleTabPress = tabIndex => () => {
      pagerRef.current.setPage(tabIndex);
   };

   const handleRoute = screen => () => {
      navigation.navigate(screen);
   };

   const animateIndicator = toValue => {
      Animated.timing(indicatorPosition, {
         toValue,
         duration: 200, // Adjust the duration of the animation as needed
         useNativeDriver: true,
      }).start();
   };

   const onScroll = e => {
      const { offset, position } = e.nativeEvent;
      const scrollPosition = position * tabWidth + offset * tabWidth;
      indicatorPosition.setValue(scrollPosition);
   };

   const tabBar = React.useMemo(
      () => (
         <View style={styles.tabBar}>
            <Pressable pressedStyle={{}} style={[styles.tabItem, { width: '50%' }]} onPress={handleTabPress(0)}>
               <View style={commonStyles.hstack}>
                  <Text style={[styles.tabText, index === 0 ? styles.activeTabText : styles.inactiveTabText]}>
                     CHATS
                  </Text>
                  {chatsBadge > 0 && (
                     <View style={styles.tabBadgeWrapper}>
                        <Text style={styles.tabBadgeText}>{chatsBadge}</Text>
                     </View>
                  )}
               </View>
            </Pressable>
            <Pressable pressedStyle={{}} style={[styles.tabItem, { width: '50%' }]} onPress={handleTabPress(1)}>
               <Text style={[styles.tabText, index === 1 ? styles.activeTabText : styles.inactiveTabText]}>CALLS</Text>
            </Pressable>
            {/* Animated active tab indicator */}
            <Animated.View
               style={[styles.indicator, { transform: [{ translateX: indicatorPosition }], width: indicatorWidth }]}
            />
         </View>
      ),
      [index, chatsBadge],
   );

   const renderPagerView = React.useMemo(
      () => (
         <PagerView
            ref={pagerRef}
            style={[commonStyles.flex1, commonStyles.bg_white]}
            initialPage={index}
            onPageScroll={onScroll}
            onPageSelected={e => setIndex(e.nativeEvent.position)}>
            <View style={commonStyles.flex1} key="1">
               <RecentChat />
            </View>
            <View style={commonStyles.flex1} key="2">
               <RecentCalls />
            </View>
         </PagerView>
      ),
      [],
   );

   return (
      <View style={commonStyles.flex1}>
         <RecentChatHeader handleBackBtn={handleBackBtn} />
         {tabBar}
         {renderPagerView}
         <FloatingBtn onPress={handleRoute(USERS_LIST_SCREEN)} />
      </View>
   );
}

const styles = StyleSheet.create({
   py_1: {
      paddingVertical: 10,
   },
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
   tabBadgeWrapper: {
      minWidth: 20,
      paddingVertical: 1,
      paddingHorizontal: 4,
      backgroundColor: ApplicationColors.mainColor,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 7,
   },
   tabBadgeText: {
      color: ApplicationColors.white,
      fontSize: 13,
   },
});

export default RecentChatScreen;
