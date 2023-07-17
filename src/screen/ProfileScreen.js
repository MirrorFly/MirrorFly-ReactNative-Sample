import React from 'react';
import ProfilePage from '../components/ProfilePage';
import EditStatusPage from '../components/EditStatusPage';
import StatusPage from '../components/StatusPage';
import ProfilePhoto from '../components/ProfilePhoto';
import { useDispatch, useSelector } from 'react-redux';
import SDK from '../SDK/SDK';
import { statusListConstant } from '../constant';
import { profileDetail } from '../redux/profileSlice';
import { useNetworkStatus } from '../hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAvoidingView } from 'native-base';

const ProfileScreen = () => {
  const dispatch = useDispatch()
  const isNetworkConnected = useNetworkStatus();
  const [nav, setNav] = React.useState("ProfileScreen");
  const [statusList, setStatusList] = React.useState([]);
  const selectProfileInfo = useSelector((state) => state.profile.profileDetails);
  const [profileInfo, setProfileInfo] = React.useState();

  const handleDelete = (value) => {
    setStatusList(statusList.filter(item => item !== value));
    SDK.deleteProfileStatus(value);
  };

  const hasProfileInfoChanged = () => {
    return profileInfo?.nickName !== selectProfileInfo?.nickName || profileInfo?.email !== selectProfileInfo?.email;
  };

  const getProfileDetail = async () => {
    if (Object.keys(selectProfileInfo).length === 0) {
      const userIdentifier = await AsyncStorage.getItem('userIdentifier')
      const profileDetails = await SDK.getUserProfile(JSON.parse(userIdentifier));
      if (profileDetails.statusCode == 200) {
        AsyncStorage.setItem('vCardProfile', JSON.stringify(profileDetails.data))
        dispatch(profileDetail(profileDetails.data))
      }
      profileDetails.data.mobileNumber = JSON.parse(userIdentifier)
      if (profileDetails.data.status == "") profileDetails.data.status = "I am in Mirror Fly"
      if (!profileInfo)
        setProfileInfo(profileDetails.data)
    }
  }

  const updateProfileDetail = () => {
    if (selectProfileInfo !== profileInfo)
      setProfileInfo(selectProfileInfo)
  }

  React.useEffect(() => {
    hasProfileInfoChanged()
    updateProfileDetail()
  }, [selectProfileInfo])

  React.useEffect(() => {
    if (isNetworkConnected)
      getProfileDetail()
  }, [isNetworkConnected])

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
    if (statusList?.length)
      if (profileInfo?.status && !statusList.includes(profileInfo?.status)) {
        setStatusList(prevStatusList => [...prevStatusList, profileInfo.status]);
        SDK.addProfileStatus(profileInfo.status.trim())
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
          />
        );
      case 'statusPage':
        return (
          <StatusPage
            statusList={statusList}
            setNav={setNav}
            profileInfo={profileInfo}
            setProfileInfo={setProfileInfo}
            removeItem={handleDelete}
            onChangeEvent={hasProfileInfoChanged}
          />
        );
      case 'ProfileImage':
        return (
          <ProfilePhoto
            setNav={setNav}
            profileInfo={profileInfo}
            setProfileInfo={setProfileInfo}
          />
        );
      case 'ProfileScreen':
      default:
        return (
          <ProfilePage
            selectProfileInfo={selectProfileInfo}
            setNav={setNav}
            profileInfo={profileInfo}
            setProfileInfo={setProfileInfo}
            onChangeEvent={hasProfileInfoChanged}
          />
        );
    }
  }, [nav, profileInfo, statusList]);

  return <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >{renderedComponent}
  </KeyboardAvoidingView>;
};

export default ProfileScreen;
