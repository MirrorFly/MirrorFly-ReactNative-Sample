import { StyleSheet, Image, View, Text } from 'react-native';
import React from 'react'
import ScreenHeader from './ScreenHeader'
import { PROFILESCREEN } from '../constant';
import { Center, Stack, VStack } from 'native-base';

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
        
       <VStack justifyContent={"center"} h="88%"  > 
        <Image resizeMode="contain" source={{ uri: props.profileInfo.image.path }} style={{ height: 400, width: 410 }} />

        </VStack>


     




    </>
  )
}

export default ProfilePhoto

const styles = StyleSheet.create({})