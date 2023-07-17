import { HStack, Image, Text, View } from 'native-base';
import React from 'react';
import { PlayIcon, VideoIcon } from '../common/Icons';
import noPreview from '../assets/noPreview.png'
import { ImageBackground } from 'react-native';

const VideoCard = (props) => {
    const mediaData = props.data.msgBody.media
    const durationInSeconds = props.data.msgBody.media.duration; 
    const durationInMinutes = '0.'+ Math.floor(durationInSeconds / 1000);
    const base64ImageData = 'data:image/jpg;base64,' + mediaData.thumb_image;

    return (
        <View borderColor={'#E5E5E5'} borderWidth={2} borderRadius={2} position='relative'>
            {mediaData.thumb_image
                ? <Image alt={mediaData.fileName} source={{ uri: base64ImageData }} resizeMode="cover" style={{ width: mediaData.androidWidth, height: mediaData.androidHeight, borderRadius: 5 }} />
                : <Image alt={mediaData.fileName} source={noPreview} width={mediaData.androidWidth} height={mediaData.androidHeight} />
            }
            <View position={'absolute'} top={1} left={1}>
                <HStack alignItems={'center'}>
                    <VideoIcon color={mediaData.thumb_image ? '#fff' : '#000'} width='13' height='13' />
                    <Text px='2' fontSize={11} color={mediaData.thumb_image ? '#fff' : '#000'}>
                        {durationInMinutes}
                    </Text>
                </HStack>
            </View>
            <View position={'absolute'} bottom={1} right={1}>
                <ImageBackground
                    source={require('../assets/ic_baloon.png')}
                    style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", width: 100, resizeMode: 'cover' }}
                >
                    {props.status}
                    <Text pl='1' color='#fff' fontWeight={400} fontSize='9'>{props.timeStamp}</Text>
                </ImageBackground>
            </View>
            <View bg='#fff' position={'absolute'} bottom={'45%'} right={'43%'} shadow={5} borderRadius={50}>
                <View p='3' >
                    <PlayIcon />
                </View>
            </View>
        </View>
    )
}
export default VideoCard;