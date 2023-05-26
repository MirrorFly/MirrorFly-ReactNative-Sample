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


const ProfileScreen = () => {
  const [nav, setNav] = React.useState("ProfileScreen");
  const [statusList, setStatusList] = React.useState([
    { value: "Available" },
    { value: "Sleeping..." },
    { value: "Urgent calls only" },
    { value: "At the movies" },
    { value: "I am in Mirror Fly" },
    { value: "Avail" },

  ]);

  const [profileInfo, setProfileInfo] = React.useState({
    email: "",
    image: "",
    mobileNumber: "",
    nickName: "",
    status: "",
    thumbImage: "",

  });

   React.useEffect(() => {

    if(profileInfo.status ){
     
     
     let fliter = statusList.filter((info) => profileInfo.status || !info);

   console.log(fliter);

     setStatusList([
     ... statusList,
     {
        value:profileInfo.status
     }
    
    ])
  }

    }, [profileInfo])

    

  return (
    <>
      {{

        'ProfileScreen': <ProfilePage setNav={setNav} profileInfo={profileInfo} setProfileInfo={setProfileInfo}   />,
        'EditStatusPage': <EditStatusPage setNav={setNav} profileInfo={profileInfo} setProfileInfo={setProfileInfo}  />,
        'statusPage': <StatusPage statusList={statusList} setNav={setNav} profileInfo={profileInfo} setProfileInfo={setProfileInfo} />,
        'ProfileImage': <ProfilePhoto setNav={setNav} profileInfo={profileInfo} setProfileInfo={setProfileInfo} />
      }[nav]}
    </>
  )
}
export default ProfileScreen

