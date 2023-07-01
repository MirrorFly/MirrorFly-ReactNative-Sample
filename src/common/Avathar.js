import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const Avathar = (props) => {
  const words = props?.data?.trim().split(" ");
  let userName
  if (words?.length > 1) {
    userName = words[0].charAt(0) + words[1].charAt(0);
  } else if (words?.length === 1) {
    userName = props?.data?.charAt(0) + props?.data?.charAt(1);
  } else {
    userName = "";
  }
  const styles = StyleSheet.create({
    imageDiv: {
      width: props.width || 48,
      height: props.height || 48,
      borderRadius: 100,
      backgroundColor: props.backgroundColor || "#9D9D9D",
      justifyContent: 'center',
      alignItems: 'center'
    },
    imgName: {
      color: 'white',
      fontWeight: '600',
      fontSize: props.fontSize || 18,
      textTransform: "uppercase"
    },
  });
  return (
    <View style={styles.imageDiv}>
      <Text style={styles.imgName}>{userName}</Text>
    </View>
  )
}



export default Avathar