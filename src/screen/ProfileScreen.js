import React from 'react';
import ProfilePage from '../components/ProfilePage';
import EditStatusPage from '../components/EditStatusPage';
import StatusPage from '../components/StatusPage';
import ProfilePhoto from '../components/ProfilePhoto';
import { useSelector } from 'react-redux';
import SDK from '../SDK/SDK';
import { statusListConstant } from '../constant';

const ProfileScreen = () => {
  const selectProfileInfo = useSelector((state) => state.profile.profileInfoList);
  const [nav, setNav] = React.useState("ProfileScreen");
  const [profileInfo, setProfileInfo] = React.useState(selectProfileInfo);
  const [statusList, setStatusList] = React.useState([]);

  const handleDelete = (value) => {
    setStatusList(statusList.filter(item => item !== value));
    SDK.deleteProfileStatus(value)
  }

  const onChangeEvent = () => {
    return (profileInfo?.nickName !== selectProfileInfo?.nickName)
  }

  React.useEffect(() => {
    (async () => {
      setProfileInfo(selectProfileInfo)
      let statusList = await SDK.getStatusList()
      if (statusList.length == 0) {
        statusListConstant.forEach(item => SDK.addProfileStatus(item))
        setStatusList(statusListConstant)
      } else {
        setStatusList(statusList)
      }
    })()
  }, [selectProfileInfo])

  React.useEffect(() => {
    if (profileInfo?.status) {
      let fliter = statusList?.filter((item) => profileInfo?.status == item);
      if (!fliter.length) {
        const newObj = profileInfo?.status;
        setStatusList(prevArray => [...prevArray, newObj]);
      }
    }
  }, [profileInfo])

  return (
    <>
      {{
        'ProfileScreen': <ProfilePage setNav={setNav} profileInfo={profileInfo} setProfileInfo={setProfileInfo} onChangeEvent={onChangeEvent} />,
        'EditStatusPage': <EditStatusPage setNav={setNav} profileInfo={profileInfo} setProfileInfo={setProfileInfo} onChangeEvent={onChangeEvent} />,
        'statusPage': <StatusPage statusList={statusList} setNav={setNav} profileInfo={profileInfo} setProfileInfo={setProfileInfo} removeItem={handleDelete} onChangeEvent={onChangeEvent} />,
        'ProfileImage': <ProfilePhoto setNav={setNav} profileInfo={profileInfo} setProfileInfo={setProfileInfo} />
      }[nav]}
    </>
  )
}
export default ProfileScreen

