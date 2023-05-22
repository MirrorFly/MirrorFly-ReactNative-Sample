import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const Avathar = (props) => {
  const styles = StyleSheet.create({
    imageDiv: {
      width: props.width || 48,
      height: props.height || 48,
      borderRadius: 100,
      backgroundColor: "#9D9D9D",
      justifyContent:'center',
      alignItems:'center'
    },
    imgName: {
      color: 'white',
      fontWeight:'600',
      fontSize: 18,
      textTransform: "uppercase"
    },
  });
  return (
    <View style={styles.imageDiv}>
      <Text style={styles.imgName}>{props?.data?.charAt(0) + "" + props?.data?.charAt(1)}</Text>
    </View>
  )
}



export default Avathar