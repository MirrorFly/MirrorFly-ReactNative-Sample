import { BackHandler, Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useDispatch } from 'react-redux'
import { navigate } from '../redux/navigationSlice';
import { RECENTCHATSCREEN } from '../constant';

const ProfileScreen = () => {
  const dispatch = useDispatch();

  const handleNavigate = () => {
    let x = { screen: RECENTCHATSCREEN }
    dispatch(navigate(x))
  }
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 18 }}>ProfileScreen</Text>
      <Button title='Navigate' onPress={handleNavigate} />
    </View>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({})