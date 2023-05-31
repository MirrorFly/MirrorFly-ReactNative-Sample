import { BackHandler, StyleSheet, Text, TouchableOpacity, View, Image, TextInput, ScrollView } from 'react-native'
import React from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { RECENTCHATSCREEN } from '../constant';
// import { navigate } from '../redux/navigationSlice';
// import { CallIcon, MailIcon, StatusIcon } from '../common/Icons';
// const logo = require('../assets/profile.png');
// import { Modal, Center, Box, VStack, useToast, Spinner } from "native-base";
// import { SDK } from '../SDK';
import ProfilePage from '../components/ProfilePage';
import EditStatusPage from '../components/EditStatusPage';
import StatusPage from '../components/StatusPage';
import ProfilePhoto from '../components/ProfilePhoto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const [nav, setNav] = React.useState("ProfileScreen");
  const [statusList, setStatusList] = React.useState([
    { id:1, value: "Available",},
    { id:2,value: "Sleeping...", },
    { id:3,value: "Urgent calls only", },
    {id:4, value: "At the movies",},
    {id:5, value: "I am in Mirror Fly", },
    { id:6, value: "Avail" },

  ]);

  const [profileInfo, setProfileInfo] = React.useState({
    email: "",
    image: "",
    mobileNumber: "",
    nickName: "",
    status: "",
    thumbImage: "",

  });

  const handleDelete = (value) => {
    setStatusList(statusList.filter(item => item.value !== value));
  }

  

  React.useEffect(() => {

    if (profileInfo.status) {
      console.log(profileInfo.status);
      // storeData(jsonData);
     
      let fliter = statusList.filter((info) => profileInfo.status == info.value);
      console.log(fliter);
      if (!fliter.length) {
        const newObj = { value: profileInfo.status };
        setStatusList(prevArray => [...prevArray, newObj]);
        // console.log(statusList);
      }
    }

  }, [profileInfo])



  return (
    <>
      {{

        'ProfileScreen': <ProfilePage setNav={setNav} profileInfo={profileInfo} setProfileInfo={setProfileInfo} />,
        'EditStatusPage': <EditStatusPage setNav={setNav} profileInfo={profileInfo} setProfileInfo={setProfileInfo} />,
        'statusPage': <StatusPage statusList={statusList} setNav={setNav} profileInfo={profileInfo} setProfileInfo={setProfileInfo} removeItem={handleDelete} />,
        'ProfileImage': <ProfilePhoto setNav={setNav} profileInfo={profileInfo} setProfileInfo={setProfileInfo} />
      }[nav]}
    </>
  )
}
export default ProfileScreen

