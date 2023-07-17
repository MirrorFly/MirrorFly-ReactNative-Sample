import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Graphemer from 'graphemer';

const Avathar = (props) => {
  const splitter = new Graphemer();
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
  const extractFirstGraphemes = (input) => {
    const graphemes = splitter.splitGraphemes(input);
    let result = '';
    if (graphemes.includes(" ")) {
      let preVele
      graphemes.forEach(element => {
        if (preVele == " ") {
          preVele = element
          return result = graphemes[0] + element
        }
        preVele = element
      });
    } else {
      return result = graphemes[0] + graphemes[1]
    }
    return result;
  };


  return (
    <View style={styles.imageDiv}>
      <Text style={styles.imgName}>{extractFirstGraphemes(props.data)}</Text>
    </View>
  )
}



export default Avathar