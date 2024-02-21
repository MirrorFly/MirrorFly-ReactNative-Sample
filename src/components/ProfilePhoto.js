import { StyleSheet } from 'react-native';
import React from 'react'
import ScreenHeader from './ScreenHeader'
import { VStack } from 'native-base';
import AuthProfileImage from '../common/AuthProfileImage';

const ProfilePhoto = (props) => {
  const handleBackBtn = () => {
    props.setNav("ProfileScreen");
    return true;
  }

  return (
    <>
      <ScreenHeader
        onhandleBack={handleBackBtn}
        title={props?.profileInfo?.nickName}
      />
      <VStack justifyContent={"center"} h="88%">
        <AuthProfileImage
          style={{ height: 400, width: 410, padding: 0, margin: 0 }}
          component='profileImage'
          resizeMode="contain"
          image={props?.profileInfo?.image}
        />
      </VStack>
    </>
  )
}

export default ProfilePhoto

const styles = StyleSheet.create({})