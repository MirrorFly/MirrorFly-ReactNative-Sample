import React from 'react';
import ProfilePage from '../components/ProfilePage';
import EditStatusPage from '../components/EditStatusPage';
import StatusPage from '../components/StatusPage';
import ProfilePhoto from '../components/ProfilePhoto';
import { useDispatch, useSelector } from 'react-redux';
import { profileData } from '../redux/profileSlice';

const ProfileScreen = () => {
  const dispatch = useDispatch()
  const selectProfileInfo = useSelector((state) => state.profile.profileInfoList);
  const [nav, setNav] = React.useState("ProfileScreen");
  const [profileInfo, setProfileInfo] = React.useState(selectProfileInfo);
  const [statusList, setStatusList] = React.useState([
    { id: 1, value: "Available", },
    { id: 2, value: "Sleeping...", },
    { id: 3, value: "Urgent calls only", },
    { id: 4, value: "At the movies", },
    { id: 5, value: "I am in Mirror Fly", },
    { id: 6, value: "Avail" },
  ]);

  const handleDelete = (value) => {
    setStatusList(statusList.filter(item => item.value !== value));
  }

  const onChangeEvent = () => {
    if (!(profileInfo.nickName == selectProfileInfo.nickName)|| !(profileInfo.status == selectProfileInfo.status)) {
      return true
    }
    return false;
  }

  React.useEffect(()=>{
    setProfileInfo(selectProfileInfo)
  },[selectProfileInfo])

  React.useEffect(() => {
    if (profileInfo.status) {
      let fliter = statusList.filter((info) => profileInfo.status == info.value);
      if (!fliter.length) {
        const newObj = { value: profileInfo.status };
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

