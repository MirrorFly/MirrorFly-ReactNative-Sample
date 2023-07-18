import React from 'react'
import { HStack, View, Text, Slider } from 'native-base';
import { AudioMusicIcon, DownloadIcon } from '../common/Icons';

const AudioCard = (props) => {
    const durationInSeconds = props.data.msgBody.media.duration;
    const durationInMinutes = Math.floor(durationInSeconds / 1000);
    const handleUnfilledTrackColor = '#D0D8EB';
    const sliderStyle = {
        track: { backgroundColor: handleUnfilledTrackColor },
    };
    return (
        <View borderColor={'#E5E5E5'} borderWidth={1} flex={1} width={250} borderRadius={10} mb={1}>
            <HStack px='2' style={{ backgroundColor: "#EFEFEF", justifyContent: "flex-start", alignItems: "center" }} >
                <View borderRadius={25} padding={"2"} backgroundColor={"#7285B5"} width='30' height='30' >
                    <AudioMusicIcon width='14' height='14' />
                </View>
                <View style={{ borderRadius: 5, borderWidth: 2, borderColor: "#AFB8D0", paddingHorizontal: 6, paddingVertical: 3, marginLeft: 10 }}>
                    <DownloadIcon width='15' height='22' />
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
            <View style={{ justifyContent: "flex-end",backgroundColor:"#fff",borderBottomRightRadius:17,borderBottomLeftRadius:9, }}>
                {props.status}
                <Text paddingRight={2} textAlign={"right"} color='#455E93' fontWeight={300} fontSize='10'>{props.timeStamp}</Text>
            </View>
        </View>
    )
}

export default AudioCard;


