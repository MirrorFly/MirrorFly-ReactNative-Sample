import React from 'react'
import { HStack, View, Text, Slider, VStack } from 'native-base';
import { AudioMusicIcon, DownloadIcon } from '../common/Icons';
//import {Slider }from '@react-native-community/slider';

const AudioCard = (props) => {
    // const [value, setValue] = React.useState(70);
    const durationInSeconds = props.data.msgBody.media.duration;
    const durationInMinutes = Math.floor(durationInSeconds / 1000);
    const handleUnfilledTrackColor = '#D0D8EB'; // Set your desired unfilled track color here
    const sliderStyle = {
        track: { backgroundColor: handleUnfilledTrackColor },
    };
    return (
        <View width={'90%'} borderColor='#E2E8F7' borderWidth={2} borderRadius={5}>
            <HStack style={{ backgroundColor: "#EFEFEF", justifyContent: "flex-start", alignItems: "center", paddingLeft: 6, }} >
                <View borderRadius={10} padding={"1.5"} backgroundColor={"#7285B5"} width='26' height='26' >
                    <AudioMusicIcon width='14' height='14' />
                </View>
                <View style={{ borderRadius: 5, borderWidth: 2, borderColor: "#AFB8D0", paddingHorizontal: 6, paddingVertical: 3, marginLeft: 10 }}>
                    <DownloadIcon width='18' height='15' />
                </View>
                <View mx={"3"} mt={4} w="75%" maxW="140" style={sliderStyle}>
                    <Slider defaultValue={60} colorScheme="#7285B5" size="sm">
                        <Slider.Track>
                            <Slider.FilledTrack bg="#7285B5" />
                        </Slider.Track>
                        <Slider.Thumb bg="#7285B5" />
                    </Slider>
                    <View bottom={2}>
                        <Text color='#000' fontWeight={"300"} fontSize='9'>
                            {`${String(Math.floor(durationInMinutes / 60)).padStart(2, '0')}:${String(durationInMinutes % 60).padStart(2, '0')}`}
                        </Text>
                    </View>
                </View>
            </HStack>
            <View style={{ justifyContent: "flex-end",}}>
                {props.status}
                <Text paddingRight={2} textAlign={"right"} color='#455E93' fontWeight={300} fontSize='10'>{props.timeStamp}</Text>
            </View>
        </View>
    )
}

export default AudioCard;


