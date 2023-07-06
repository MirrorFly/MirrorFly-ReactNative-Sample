import { StyleSheet, Text, View, Slider } from 'react-native'
import React from 'react'
import { AudioMusicIcon, PlayAudioIcon } from '../common/Icons'

const AudioCard = () => {
    const [volume, setVolume] = React.useState(0.00);

    const handleSliderChange = (value) => {
        setVolume(value);
        // Use the 'value' variable to control the audio volume
    };

    return (
        <View style={{}}>

      
        <View style={{ flexDirection: "row", justifyContent: "flex-start",alignItems:"center",paddingHorizontal:0,paddingVertical:4 }} >
          <View style={{}}>
          <AudioMusicIcon />  
          </View> 
          <View style={{paddingLeft:9}}>

          
            <PlayAudioIcon />
            </View>
            

            <Slider
                style={{ width: '70%', height: 40 }}
                minimumValue={0}
                maximumValue={100}
                value={volume}
                onValueChange={handleSliderChange}
            />
            
        </View>
        <Text style={{textAlign:"center"}}>Volume: {volume}</Text>
        </View>
    )
}

export default AudioCard

const styles = StyleSheet.create({})