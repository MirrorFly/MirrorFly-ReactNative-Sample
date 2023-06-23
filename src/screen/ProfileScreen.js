import React from 'react';
import ProfilePage from '../components/ProfilePage';
import EditStatusPage from '../components/EditStatusPage';
import StatusPage from '../components/StatusPage';
import ProfilePhoto from '../components/ProfilePhoto';
import { useDispatch, useSelector } from 'react-redux';
import SDK from '../SDK/SDK';
import { statusListConstant } from '../constant';
import { profileData } from '../redux/profileSlice';
import { useNetworkStatus } from '../hooks';

const ProfileScreen = () => {
  const dispatch = useDispatch()
  const selectProfileInfo = useSelector((state) => state.profile.profileInfoList);
  const [nav, setNav] = React.useState("ProfileScreen");
  const [profileInfo, setProfileInfo] = React.useState(selectProfileInfo);
  const [statusList, setStatusList] = React.useState([]);
  const isNetworkConnected = useNetworkStatus();

  const handleDelete = (value) => {
    setStatusList(statusList.filter(item => item !== value));
    SDK.deleteProfileStatus(value);
  };

  const hasProfileInfoChanged = () => {
    return profileInfo?.nickName !== selectProfileInfo?.nickName;
  };

  React.useEffect(() => {
    dispatch(profileData())
  }, [isNetworkConnected])

  React.useEffect(() => {
    const fetchData = async () => {
      setProfileInfo(selectProfileInfo);
      let fetchedStatusList = await SDK.getStatusList();
      if (fetchedStatusList.length === 0) {
        statusListConstant.forEach(item => SDK.addProfileStatus(item));
        setStatusList(statusListConstant);
      } else {
        setStatusList(fetchedStatusList);
      }
    };
    fetchData();
  }, [selectProfileInfo]);

  React.useEffect(() => {
    if (profileInfo?.status && !statusList.includes(profileInfo.status)) {
      setStatusList(prevStatusList => [...prevStatusList, profileInfo.status]);
    }
  }, [profileInfo, statusList]);


  const renderedComponent = React.useMemo(() => {
    switch (nav) {
      case 'EditStatusPage':
        return (
          <EditStatusPage
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
            setNav={setNav}
            profileInfo={profileInfo}
            setProfileInfo={setProfileInfo}
            onChangeEvent={hasProfileInfoChanged}
          />
        );
    }
  }, [nav, profileInfo, statusList, setNav, handleDelete, hasProfileInfoChanged]);

  return renderedComponent;
};

export default ProfileScreen;
