import React from 'react';
import { BackHandler, Dimensions, StyleSheet, Text, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { batch, useDispatch, useSelector } from 'react-redux';
import { FloatingBtn } from '../common/Button';
import RecentCalls from '../components/RecentCalls';
import RecentChat from '../components/RecentChat';
import ScreenHeader from '../components/ScreenHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ResetStore } from '../redux/Actions/ResetAction';
import * as RootNav from '../Navigation/rootNavigation';
import SDK from '../SDK/SDK';
import {
  CONTACTLIST,
  PROFILESCREEN,
  RECENTCHATSCREEN,
  REGISTERSCREEN,
} from '../constant';
import { navigate } from '../redux/Actions/NavigationAction';
import { profileDetail } from '../redux/Actions/ProfileAction';
import { deleteActiveChatAction } from '../redux/Actions/RecentChatAction';
import RecentHeader from '../components/RecentHeader';
import { formatUserIdToJid } from '../Helper/Chat/ChatHelper';
import { DeleteChatHistoryAction } from '../redux/Actions/ConversationAction';
import logo from '../assets/mirrorfly-logo.png';
import Modal, { ModalCenteredContent } from '../common/Modal';
import ApplicationColors from '../config/appColors';
import commonStyles from '../common/commonStyles';
import Pressable from '../common/Pressable';
import {
  clearRecentChatSelectedItems,
  toggleRecentChatSearch,
  updateRecentChatSearchText,
} from '../redux/Actions/recentChatSearchAction';

const scenesMap = SceneMap({
  first: () => <RecentChat />,
  second: RecentCalls,
});

function RecentScreen() {
  const dispatch = useDispatch();
  const { isSearching, selectedItems } =
    useSelector(state => state.recentChatSearchData) || {};
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'first', title: 'Chats' },
    { key: 'second', title: 'Calls' },
  ]);
  const [showDeleteChatModal, setShowDeleteChatModal] = React.useState(false);

  useFocusEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackBtn,
    );
    return () => {
      backHandler.remove();
    };
  });

  const closeSearch = () => {
    dispatch(toggleRecentChatSearch(false));
    dispatch(updateRecentChatSearchText(''));
  };

  const handleClearSearch = () => {
    dispatch(updateRecentChatSearchText(''));
  };

  const renderTabBar = React.useCallback(
    props => {
      return (
        !isSearching && (
          <TabBar
            {...props}
            style={styles.tabbar}
            indicatorStyle={styles.tabbarIndicator}
            labelStyle={styles.tabarLabel}
            activeColor={'#3276E2'}
          />
        )
      );
    },
    [isSearching],
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
        item?.userJid ||
        formatUserIdToJid(
          item?.fromUserId,
        ); /** Need to add chat type here while working in Group
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
        <RecentHeader
          handleRemove={handleRemove}
          recentItem={selectedItems}
          handleDeleteChat={toggleDeleteModal}
        />
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
                    `${
                      selectedItems[0]?.profileDetails?.nickName ||
                      selectedItems[0]?.fromUserId
                    }"` +
                    '?'
                  }`
                : `Delete ${selectedItems.length} selected chats?`}
            </Text>
            <View style={styles.modalActionButtonContainer}>
              <Pressable
                style={commonStyles.marginRight_8}
                onPress={toggleDeleteModal}>
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
});
