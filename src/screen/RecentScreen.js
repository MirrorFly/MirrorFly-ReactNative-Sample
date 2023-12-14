import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { BackHandler, Dimensions, StyleSheet, Text, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { batch, useDispatch, useSelector } from 'react-redux';
import { endOngoingCallLogout } from '../Helper/Calls/Utility';
import { formatUserIdToJid } from '../Helper/Chat/ChatHelper';
import * as RootNav from '../Navigation/rootNavigation';
import SDK from '../SDK/SDK';
import logo from '../assets/mirrorfly-logo.png';
import { FloatingBtn } from '../common/Button';
import Modal, { ModalCenteredContent } from '../common/Modal';
import Pressable from '../common/Pressable';
import commonStyles from '../common/commonStyles';
import RecentCalls from '../components/RecentCalls';
import RecentChat from '../components/RecentChat';
import RecentHeader from '../components/RecentHeader';
import ScreenHeader from '../components/ScreenHeader';
import ApplicationColors from '../config/appColors';
import { CONTACTLIST, PROFILESCREEN, RECENTCHATSCREEN, REGISTERSCREEN } from '../constant';
import { DeleteChatHistoryAction } from '../redux/Actions/ConversationAction';
import { navigate } from '../redux/Actions/NavigationAction';
import { profileDetail } from '../redux/Actions/ProfileAction';
import { deleteActiveChatAction } from '../redux/Actions/RecentChatAction';
import { ResetStore } from '../redux/Actions/ResetAction';
import {
   clearRecentChatSelectedItems,
   toggleRecentChatSearch,
   updateRecentChatSearchText,
} from '../redux/Actions/recentChatSearchAction';

const scenesMap = SceneMap({
   chats: () => <RecentChat />,
   calls: RecentCalls,
});

function RecentScreen() {
   const dispatch = useDispatch();
   const { isSearching, selectedItems } = useSelector(state => state.recentChatSearchData) || {};
   const [index, setIndex] = React.useState(0);
   const recentChatData = useSelector(state => state.recentChatData.data);
   const [routes] = React.useState([
      { key: 'chats', title: 'Chats' },
      { key: 'calls', title: 'Calls' },
   ]);
   const [showDeleteChatModal, setShowDeleteChatModal] = React.useState(false);
   const [chatsBadge, setChatsBadge] = React.useState('');
   const [callsBadge] = React.useState('');

   const tabBarSceneBadgeMap = React.useMemo(() => {
      return {
         chats: chatsBadge,
         calls: callsBadge,
      };
   }, [chatsBadge, callsBadge]);

   useFocusEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
      };
   });

   React.useEffect(() => {
      if (recentChatData.length) {
         const unreadChatCount = recentChatData.filter(d => d.unreadCount > 0).length;
         setChatsBadge(unreadChatCount > 99 ? '99+' : String(unreadChatCount || ''));
      } else {
         setChatsBadge('');
      }
   }, [recentChatData]);

   const closeSearch = () => {
      dispatch(toggleRecentChatSearch(false));
      dispatch(updateRecentChatSearchText(''));
   };

   const handleClearSearch = () => {
      dispatch(updateRecentChatSearchText(''));
   };
   const renderTabBadge = scene => {
      const badgeValue = tabBarSceneBadgeMap[scene.route?.key] || '';
      return badgeValue ? (
         <View style={styles.tabBadgeWrapper}>
            <Text style={styles.tabBadgeText}>{badgeValue}</Text>
         </View>
      ) : null;
   };

   const renderLabel = React.useCallback(
      scene => {
         return (
            <View style={commonStyles.hstack}>
               <Text style={[styles.tabarLabel, { color: scene.color }]}>{scene.route.title.toUpperCase()}</Text>
               {renderTabBadge(scene)}
            </View>
         );
      },
      [chatsBadge, callsBadge],
   );

   const renderTabBar = React.useCallback(
      props => {
         return (
            !isSearching && (
               <TabBar
                  {...props}
                  style={styles.tabbar}
                  indicatorStyle={styles.tabbarIndicator}
                  labelStyle={styles.tabarLabel}
                  renderLabel={renderLabel}
                  activeColor={ApplicationColors.mainColor}
                  inactiveColor={ApplicationColors.black}
               />
            )
         );
      },
      [isSearching, chatsBadge, callsBadge],
   );

   const handleBackBtn = () => {
      if (selectedItems.length) {
         dispatch(clearRecentChatSelectedItems());
         return true;
      }
      if (isSearching) {
         batch(() => {
            dispatch(toggleRecentChatSearch(false));
            dispatch(updateRecentChatSearchText(''));
         });
         return true;
      }
   };

   const handleRemove = () => {
      dispatch(clearRecentChatSelectedItems());
   };

   const deleteChat = () => {
      selectedItems.forEach(item => {
         let userJid =
            item?.userJid || formatUserIdToJid(item?.fromUserId); /** Need to add chat type here while working in Group
         formatUserIdToJid(
          item?.fromUserId,
          item?.chatType,
        )
        */
         SDK.deleteChat(userJid);
         batch(() => {
            dispatch(deleteActiveChatAction({ fromUserId: item?.fromUserId }));
            dispatch(DeleteChatHistoryAction({ fromUserId: item?.fromUserId }));
         });
      });
      dispatch(clearRecentChatSelectedItems());
      toggleDeleteModal();
   };

   const handleLogout = async () => {
      SDK.logout();
      const getPrevUserIdentifier = await AsyncStorage.getItem('userIdentifier');
      AsyncStorage.setItem('prevUserIdentifier', getPrevUserIdentifier || '');
      AsyncStorage.setItem('credential', '');
      AsyncStorage.setItem('userIdentifier', '');
      AsyncStorage.setItem('screenObj', '');
      AsyncStorage.setItem('vCardProfile', '');
      endOngoingCallLogout();
      batch(() => {
         dispatch(profileDetail({}));
         dispatch(navigate({ screen: REGISTERSCREEN }));
         dispatch(ResetStore());
      });
      RootNav.reset(REGISTERSCREEN);
   };

   const toggleDeleteModal = () => {
      setShowDeleteChatModal(val => !val);
   };

   const menuItems = React.useMemo(
      () => [
         {
            label: 'Profile',
            formatter: () => {
               let x = { prevScreen: RECENTCHATSCREEN, screen: PROFILESCREEN };
               dispatch(navigate(x));
               RootNav.navigate(PROFILESCREEN);
            },
         },
         {
            label: 'Logout',
            formatter: handleLogout,
         },
      ],
      [],
   );

   const toggleSearching = val => {
      dispatch(toggleRecentChatSearch(val));
   };

   const handleSearch = text => {
      dispatch(updateRecentChatSearchText(text));
   };

   return (
      <>
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
         <TabView
            navigationState={{ index, routes }}
            renderScene={scenesMap}
            onIndexChange={setIndex}
            initialLayout={{ width: Dimensions.get('window').width }}
            renderTabBar={renderTabBar}
            tabStyle={styles.tabView}
            activeTabStyle={styles.activeTab}
            lazy
         />
         <FloatingBtn
            onPress={() => {
               RootNav.navigate(CONTACTLIST);
               dispatch(navigate({ screen: CONTACTLIST }));
            }}
         />
         <Modal visible={showDeleteChatModal} onRequestClose={toggleDeleteModal}>
            <ModalCenteredContent onPressOutside={toggleDeleteModal}>
               <View style={styles.deleteChatModalContentContainer}>
                  <Text style={styles.deleteChatModalTitle}>
                     {selectedItems.length === 1
                        ? `${
                             'Delete chat with "' +
                             `${selectedItems[0]?.profileDetails?.nickName || selectedItems[0]?.fromUserId}"` +
                             '?'
                          }`
                        : `Delete ${selectedItems.length} selected chats?`}
                  </Text>
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
      </>
   );
}

export default RecentScreen;

const styles = StyleSheet.create({
   tabView: { borderColor: 'black', borderWidth: 1 },
   activeTab: { backgroundColor: 'black' },
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
