import React from 'react';
import ProfilePage from '../components/ProfilePage';
import EditStatusPage from '../components/EditStatusPage';
import StatusPage from '../components/StatusPage';
import ProfilePhoto from '../components/ProfilePhoto';
import { useSelector } from 'react-redux';

const ProfileScreen = () => {

  const selectProfileInfo = useSelector((state) => state.profile.profileInfoList);
  
  const [nav, setNav] = React.useState("ProfileScreen");
  const [statusList, setStatusList] = React.useState([
    { id:1, value: "Available",},
    { id:2,value: "Sleeping...", },
    { id:3,value: "Urgent calls only", },
    {id:4, value: "At the movies",},
    {id:5, value: "I am in Mirror Fly", },
    { id:6, value: "Avail" },

  ]);

  const [profileInfo, setProfileInfo] = React.useState(selectProfileInfo);

  const handleDelete = (value) => {
    setStatusList(statusList.filter(item => item.value !== value));
  }

  const onChangeEvent =()=>{

    console.log(profileInfo);
    console.log(selectProfileInfo);
    
    return true;
    
  }

  React.useEffect(() => {

    if (profileInfo.status) {
      console.log(profileInfo.status);
      let fliter = statusList.filter((info) => profileInfo.status == info.value);
      console.log(fliter);
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

