import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Animated, BackHandler, Dimensions, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view'; // Import PagerView components
import { batch, useDispatch, useSelector } from 'react-redux';
import { showToast } from '../Helper';
import { formatUserIdToJid } from '../Helper/Chat/ChatHelper';
import { MIX_BARE_JID } from '../Helper/Chat/Constant';
import SDK from '../SDK/SDK';
import logo from '../assets/mirrorfly-logo.png';
import { FloatingBtn } from '../common/Button';
import LoadingModal from '../common/LoadingModal';
import Modal, { ModalCenteredContent } from '../common/Modal';
import Pressable from '../common/Pressable';
import commonStyles from '../common/commonStyles';
import { handleLogOut } from '../common/utils';
import RecentCalls from '../components/RecentCalls';
import RecentChat from '../components/RecentChat';
import RecentHeader from '../components/RecentHeader';
import ScreenHeader from '../components/ScreenHeader';
import ApplicationColors from '../config/appColors';
import { CONTACTLIST, GROUPSCREEN, PROFILESCREEN, RECENTCHATSCREEN } from '../constant';
import { getUserName } from '../hooks/useRosterData';
import { DeleteChatHistoryAction } from '../redux/Actions/ConversationAction';
import { navigate } from '../redux/Actions/NavigationAction';
import { deleteActiveChatAction } from '../redux/Actions/RecentChatAction';
import {
   clearRecentChatSelectedItems,
   toggleRecentChatSearch,
   updateRecentChatSearchText,
} from '../redux/Actions/recentChatSearchAction';

const { width: screenWidth } = Dimensions.get('window');

const RecentScreen = () => {
   const navigaiton = useNavigation();
   const dispatch = useDispatch();
   const pagerRef = React.useRef();
   const { isSearching, selectedItems } = useSelector(state => state.recentChatSearchData) || {};
   const recentChatData = useSelector(state => state.recentChatData.data);
   const [index, setIndex] = React.useState(0); // State to track the active tab index
   const [indicatorWidth] = React.useState(screenWidth / 2); // State to track the width of the active tab indicator
   const [indicatorPosition] = React.useState(new Animated.Value(0)); // State to track the position of the active tab indicator
   const [showDeleteChatModal, setShowDeleteChatModal] = React.useState(false);
   const [chatsBadge, setChatsBadge] = React.useState(0);
   const [isLoggingOut, setIsLoggingOut] = React.useState(false);

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => backHandler.remove();
   }, [navigaiton, selectedItems, isSearching, handleBackBtn]);

   React.useEffect(() => {
      if (recentChatData.length) {
         const unreadChatCount = recentChatData.filter(d => d.unreadCount > 0).length;
         setChatsBadge(unreadChatCount > 99 ? '99+' : String(unreadChatCount || 0));
      } else {
         setChatsBadge(0);
      }
   }, [recentChatData]);

   const handleBackBtn = React.useCallback(() => {
      switch (true) {
         case selectedItems.length:
            dispatch(clearRecentChatSelectedItems());
            break;
         case isSearching:
            batch(() => {
               dispatch(toggleRecentChatSearch(false));
               dispatch(updateRecentChatSearchText(''));
            });
            break;
         default:
            BackHandler.exitApp();
            break;
      }
      return true;
   }, [dispatch, isSearching, selectedItems.length]);

   // Function to handle tab press
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
      const tabWidth = screenWidth / 2; // Adjust the width of each tab as needed
      const toValue = index * tabWidth;
      animateIndicator(toValue);
   }, [index]);

   const handleLogout = async () => {
      setIsLoggingOut(true);
      await handleLogOut().then(() => {
         setIsLoggingOut(false);
      });
   };

   const toggleSearching = val => {
      dispatch(toggleRecentChatSearch(val));
   };

   const handleSearch = text => {
      dispatch(updateRecentChatSearchText(text));
   };

   const closeSearch = () => {
      dispatch(toggleRecentChatSearch(false));
      dispatch(updateRecentChatSearchText(''));
   };

   const handleClearSearch = () => {
      dispatch(updateRecentChatSearchText(''));
   };

   const handleRemove = () => {
      dispatch(clearRecentChatSelectedItems());
   };

   const deleteChat = () => {
      const isUserLeft = selectedItems.every(res => (MIX_BARE_JID.test(res.userJid) ? res.userType === '' : true));
      if (!isUserLeft && selectedItems.length > 1) {
         toggleDeleteModal();
         return showToast('You are a member of a certain group', { id: 'You are a member of a certain group' });
      }

      if (!isUserLeft) {
         toggleDeleteModal();
         return showToast('You are a participant in this group', { id: 'You are a participant in this group' });
      }

      selectedItems.forEach(item => {
         let userJid = item?.userJid || formatUserIdToJid(item?.fromUserId, item?.chatType);
         SDK.deleteChat(userJid);
         batch(() => {
            dispatch(deleteActiveChatAction({ fromUserId: item?.fromUserId }));
            dispatch(DeleteChatHistoryAction({ fromUserId: item?.fromUserId }));
         });
      });
      toggleDeleteModal();
      dispatch(clearRecentChatSelectedItems());
   };

   const toggleDeleteModal = () => {
      setShowDeleteChatModal(val => !val);
   };

   const menuItems = React.useMemo(
      () => [
         {
            label: 'New Group',
            formatter: () => {
               navigaiton.navigate(GROUPSCREEN);
            },
         },
         {
            label: 'Profile',
            formatter: () => {
               dispatch(navigate({ prevScreen: RECENTCHATSCREEN }));
               navigaiton.navigate(PROFILESCREEN);
            },
         },
         {
            label: 'Logout',
            formatter: handleLogout,
         },
      ],
      [],
   );

   const userName = getUserName(selectedItems[0]?.fromUserId);

   const deleteMessage =
      selectedItems.length === 1 ? `Delete chat with "${userName}"?` : `Delete ${selectedItems.length} selected chats?`;

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
         <>
            {console.log('first')}
            <PagerView
               ref={pagerRef}
               style={[styles.pagerView, commonStyles.bg_white]}
               initialPage={index}
               onPageSelected={e => setIndex(e.nativeEvent.position)}>
               <View style={{ flex: 1 }} key="1">
                  <RecentChat />
               </View>
               <View style={{ flex: 1 }} key="2">
                  <RecentCalls />
               </View>
            </PagerView>
         </>
      ),
      [],
   );

   return (
      <View style={styles.container}>
         {!selectedItems.length ? (
            <ScreenHeader
               setIsSearching={toggleSearching}
               onhandleSearch={handleSearch}
               onCloseSearch={closeSearch}
               menuItems={menuItems}
               logo={logo}
               handleBackBtn={handleBackBtn}
               isSearching={isSearching}
               handleClear={handleClearSearch}
            />
         ) : (
            <RecentHeader handleRemove={handleRemove} recentItem={selectedItems} handleDeleteChat={toggleDeleteModal} />
         )}
         {/* Custom Tab Navigation */}
         {tabBar}
         {/* PagerView for Tab Content */}
         {renderPagerView}
         <FloatingBtn
            onPress={() => {
               navigaiton.navigate(CONTACTLIST);
            }}
         />
         <LoadingModal visible={isLoggingOut} />
         <Modal visible={showDeleteChatModal} onRequestClose={toggleDeleteModal}>
            <ModalCenteredContent onPressOutside={toggleDeleteModal}>
               <View style={styles.deleteChatModalContentContainer}>
                  <Text style={styles.deleteChatModalTitle}>{deleteMessage}</Text>
                  <View style={styles.modalActionButtonContainer}>
                     <Pressable style={commonStyles.marginRight_8} onPress={toggleDeleteModal}>
                        <Text style={styles.modalActionButtonText}>NO</Text>
                     </Pressable>
                     <Pressable onPress={deleteChat}>
                        <Text style={styles.modalActionButtonText}>YES</Text>
                     </Pressable>
                  </View>
               </View>
            </ModalCenteredContent>
         </Modal>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
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
   pagerView: {
      flex: 1,
   },
   deleteChatModalContentContainer: {
      backgroundColor: ApplicationColors.white,
      width: '88%',
      borderRadius: 0,
      paddingHorizontal: 20,
      paddingVertical: 12,
      fontWeight: '300',
   },
   deleteChatModalTitle: {
      marginTop: 10,
      marginLeft: 10,
      fontSize: 16,
      color: ApplicationColors.black,
   },
   modalActionButtonContainer: {
      flexDirection: 'row',
      flexGrow: 1,
      justifyContent: 'flex-end',
      paddingBottom: 10,
      marginTop: 20,
   },
   modalActionButtonText: {
      fontWeight: '500',
      color: ApplicationColors.mainColor,
      paddingVertical: 2,
      paddingHorizontal: 10,
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

export default RecentScreen;
