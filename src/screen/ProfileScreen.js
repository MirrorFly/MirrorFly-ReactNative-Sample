import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView } from 'native-base';
import React from 'react';
import { BackHandler, Platform, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { calculateKeyboardVerticalOffset } from '../Helper/Chat/ChatHelper';
import SDK from '../SDK/SDK';
import EditStatusPage from '../components/EditStatusPage';
import ProfilePage from '../components/ProfilePage';
import ProfilePhoto from '../components/ProfilePhoto';
import StatusPage from '../components/StatusPage';
import { CONNECTED, PROFILESCREEN, RECENTCHATSCREEN, REGISTERSCREEN, statusListConstant } from '../constant';
import { useNetworkStatus } from '../hooks';
import { navigate } from '../redux/Actions/NavigationAction';
import { profileDetail } from '../redux/Actions/ProfileAction';

const ProfileScreen = () => {
   const dispatch = useDispatch();
   const navigation = useNavigation();
   const prevPageInfo = useSelector(state => state.navigation.prevScreen);
   const isNetworkConnected = useNetworkStatus();
   const xmppConnection = useSelector(state => state.connection.xmppStatus);
   const [nav, setNav] = React.useState('ProfileScreen');
   const [statusList, setStatusList] = React.useState([]);
   const selectProfileInfo = useSelector(state => state.profile.profileDetails);
   const [profileInfo, setProfileInfo] = React.useState({});

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => backHandler.remove();
   }, [prevPageInfo]);

   const handleBackBtn = () => {
      let x = { prevScreen: PROFILESCREEN, screen: RECENTCHATSCREEN };
      if (prevPageInfo !== REGISTERSCREEN) {
         dispatch(navigate(x));
         navigation.goBack();
      }
      if (prevPageInfo === REGISTERSCREEN) {
         BackHandler.exitApp();
      }
      return true;
   };

   const handleDelete = value => {
      setStatusList(statusList.filter(item => item !== value));
      SDK.deleteProfileStatus(value);
   };

   const hasProfileInfoChanged = () => {
      if (Object.keys(profileInfo).length === 0) {
         return false;
      }
      return profileInfo?.nickName !== selectProfileInfo?.nickName || profileInfo?.email !== selectProfileInfo?.email;
   };

   const getProfileDetail = async () => {
      if (Object.keys(selectProfileInfo).length === 0) {
         const userIdentifier = await AsyncStorage.getItem('userIdentifier');
         let profileDetails = await SDK.getUserProfile(JSON.parse(userIdentifier), true);
         if (profileDetails.statusCode === 200) {
            AsyncStorage.setItem('vCardProfile', JSON.stringify(profileDetails.data));
            dispatch(profileDetail(profileDetails.data));
         }
         profileDetails.data.mobileNumber = JSON.parse(userIdentifier);
         if (profileDetails.data.status === '') {
            profileDetails.data.status = 'I am in Mirror Fly';
         }
         if (!profileInfo) {
            setProfileInfo(profileDetails.data);
         }
      }
   };

   const updateProfileDetail = async () => {
      if (selectProfileInfo !== profileInfo) {
         const userIdentifier = await AsyncStorage.getItem('userIdentifier');
         if (selectProfileInfo.status === '') {
            selectProfileInfo.status = 'I am in Mirror Fly';
         }
         setProfileInfo({ ...selectProfileInfo, mobileNumber: JSON.parse(userIdentifier) });
      }
   };

   React.useEffect(() => {
      hasProfileInfoChanged();
      updateProfileDetail();
   }, [selectProfileInfo]);

   React.useEffect(() => {
      if (isNetworkConnected && xmppConnection === CONNECTED) {
         getProfileDetail();
      }
   }, [isNetworkConnected, xmppConnection]);

   React.useEffect(() => {
      const fetchData = async () => {
         let fetchedStatusList = await SDK.getStatusList();
         if (fetchedStatusList.length === 0) {
            statusListConstant.forEach(item => SDK.addProfileStatus(item));
            setStatusList(statusListConstant);
         } else {
            setStatusList(fetchedStatusList);
         }
      };
      fetchData();
   }, []);

   React.useEffect(() => {
      if (statusList?.length) {
         if (profileInfo?.status && !statusList.includes(profileInfo?.status)) {
            setStatusList(prevStatusList => [...prevStatusList, profileInfo.status]);
            SDK.addProfileStatus(profileInfo.status.trim());
         }
      }
   }, [profileInfo]);

   const renderedComponent = React.useMemo(() => {
      switch (nav) {
         case 'EditStatusPage':
            return (
               <EditStatusPage
                  setStatusList={setStatusList}
                  setNav={setNav}
                  profileInfo={profileInfo}
                  setProfileInfo={setProfileInfo}
                  onChangeEvent={hasProfileInfoChanged}
                  handleBackBtn={handleBackBtn}
               />
            );
         case 'statusPage':
            return (
               <StatusPage
                  statusList={statusList}
                  setNav={setNav}
                  selectProfileInfo={selectProfileInfo}
                  profileInfo={profileInfo}
                  setProfileInfo={setProfileInfo}
                  removeItem={handleDelete}
                  onChangeEvent={hasProfileInfoChanged}
                  handleBackBtn={handleBackBtn}
               />
            );
         case 'ProfileImage':
            return (
               <ProfilePhoto
                  setNav={setNav}
                  profileInfo={profileInfo}
                  setProfileInfo={setProfileInfo}
                  handleBackBtn={handleBackBtn}
               />
            );
         case 'ProfileScreen':
         default:
            return (
               <ProfilePage
                  navigation={navigation}
                  selectProfileInfo={selectProfileInfo}
                  setNav={setNav}
                  profileInfo={profileInfo}
                  setProfileInfo={setProfileInfo}
                  onChangeEvent={hasProfileInfoChanged}
                  handleBackBtn={handleBackBtn}
               />
            );
      }
   }, [nav, profileInfo, statusList]);

   return (
      <KeyboardAvoidingView
         style={styles.keyBoardStyle}
         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
         keyboardVerticalOffset={Platform.OS === 'ios' ? calculateKeyboardVerticalOffset() : 0}>
         {renderedComponent}
      </KeyboardAvoidingView>
   );
};

export default ProfileScreen;

const styles = StyleSheet.create({
   keyBoardStyle: {
      flex: 1,
   },
});
