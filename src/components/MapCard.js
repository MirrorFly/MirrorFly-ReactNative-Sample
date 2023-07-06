import React from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';
import BG from '../assets/BG.png';
const MapCard = () => {
  //  const image = { uri: 'https://example.com/map.png' };
    return (
        <View >
            <Image source={BG} resizeMode="cover" style={styles.image}/>
            
        </View>
    )
}

export default MapCard;

const styles = StyleSheet.create({
    image: {
       // alignItems: 'center',
       paddingHorizontal:20,
       paddingVertical:30
     },
})