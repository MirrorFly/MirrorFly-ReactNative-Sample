import React from 'react';
import { StyleSheet, ImageBackground, Text, View } from 'react-native';

const ImageCard = () => {
    const image = { uri: 'https://via.placeholder.com/500' }; 
    return (
    <View style={styles.container}>
      <ImageBackground source={image} resizeMode="cover" style={styles.image}>
        
      </ImageBackground>
    </View>
  );
};

export default ImageCard;

const styles = StyleSheet.create({
  container: {
//   paddingHorizontal:80,
//   paddingVertical:90
  
  },
  image: {
     alignItems: 'center',
    paddingHorizontal:110,
    paddingVertical:90
  },
 
});
