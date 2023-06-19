import { StyleSheet } from 'react-native';
import React from 'react'
import ScreenHeader from './ScreenHeader'
import { VStack } from 'native-base';
import AuthenticatedImage from '../common/AuthendicatedImage';

const ProfilePhoto = (props) => {
  const handleBackBtn = () => {
    props.setNav("ProfileScreen");
  }

  return (
    <>
      <ScreenHeader
        onhandleBack={handleBackBtn}
        title=' Profile Photo'
      />
      <VStack justifyContent={"center"} h="88%">
        <AuthenticatedImage resizeMode="contain" style={{ height: 400, width: 410 }} imageUrl={props.profileInfo?.image.fileUrl} authToken={props.profileInfo?.image.token} />
      </VStack>
    </>
  )
}

export default ProfilePhoto

const styles = StyleSheet.create({})