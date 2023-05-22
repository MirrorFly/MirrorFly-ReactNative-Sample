import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const Avathar = (props) => {

  return (
    <View style={styles.imageDiv}>
      <Text style={styles.imgName}>{props?.data?.charAt(0) + "" + props?.data?.charAt(1)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  imageDiv: {
    width: 48,
    height: 48,
    borderRadius: 100,
    backgroundColor: "#9D9D9D"
  },
  imgName: {
    width: '100%',
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    lineHeight: 48,
    textTransform: "uppercase"
  },
});

export default Avathar