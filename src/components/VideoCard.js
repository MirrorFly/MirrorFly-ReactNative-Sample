import { StyleSheet, ImageBackground, Text, View, Pressable } from 'react-native';
import React from 'react';
import { PlayIcon, VideoIcon } from '../common/Icons';

const VideoCard = () => {
  
    const image = {uri: 'https://legacy.reactjs.org/logo-og.png'};
    return (
    <View style={styles.container}>
      <ImageBackground source={image} resizeMode="cover" style={styles.image}>
        <View style={{ position:"absolute",flexDirection:"row",top:9,left:0}}>
        <VideoIcon/>
            <Text style={{top:0,color:"#fff",fontSize:8}}>
                0.15
            </Text>
        </View>
        <View style={{backgroundColor:"#fff",padding:8,borderRadius:12,alignItems:"center"}}>
          
            <Pressable onPress={console.log("Hiii")}>
            <PlayIcon/>
            </Pressable>
           
        </View>
      </ImageBackground>
    </View>
  )
}

export default VideoCard

const styles = StyleSheet.create({
    container:{
   
    },
    image: {
        alignItems: 'center',
       paddingHorizontal:90,
       paddingVertical:60,
       
     },
})