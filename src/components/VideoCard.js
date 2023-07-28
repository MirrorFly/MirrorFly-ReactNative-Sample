import { HStack, Image, Text, View } from 'native-base';
import React from 'react';
import { PlayIcon, VideoIcon } from '../common/Icons';
import noPreview from '../assets/noPreview.png'
import { ImageBackground } from 'react-native';
import { millisToMinutesAndSeconds } from '../Helper/Chat/Utility';
import ProgressLoader from './chat/common/ProgressLoader';
import { useSelector } from 'react-redux';

const VideoCard = (props) => {
    const {
        imgSrc,
        uploadStatus = 0,
        setUploadStatus,
        isSender,
        fileSize,
        messageObject = {}
    } = props;

    const {
        msgId = "",
        msgBody: { media },
        msgBody: {
            message_type = "",
            media: { file: { fileDetails = {} } = {}, duration = 0, caption = "", file_url = "",is_uploading, androidHeight, androidWidth,
                local_path = "", fileName, thumb_image = "", file_key } = {}
        } = {}
    } = messageObject;
    const { data: mediaDownloadData = {} } = useSelector((state) => state.mediaDownloadData);

    console.log(mediaDownloadData,media,"is_uploading");
    const durationInSeconds = duration;
    const durationInMinutes = millisToMinutesAndSeconds(durationInSeconds);
    const base64ImageData = 'data:image/jpg;base64,' + thumb_image;

    return (
        <View borderColor={'#E5E5E5'} borderWidth={2} borderRadius={2} position='relative'>
            {thumb_image
                ? <Image alt={fileName} source={{ uri: base64ImageData }} resizeMode="cover" style={{ width: androidWidth, height: androidHeight, borderRadius: 5 }} />
                : <Image alt={fileName} source={noPreview} width={androidWidth} height={androidHeight} />
            }
            <View position={'absolute'} top={1} left={1}>
                <HStack alignItems={'center'}>
                    <VideoIcon color={thumb_image ? '#fff' : '#000'} width='13' height='13' />
                    <Text px='2' fontSize={11} color={thumb_image ? '#fff' : '#000'}>
                        {durationInMinutes}
                    </Text>
                </HStack>
            </View>

            <View position={'absolute'} style={{ top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                <ProgressLoader
                    isSender={isSender}
                    // imageUrl={imageUrl}
                    media={media}
                    fileSize={fileSize}
                    setUploadStatus={setUploadStatus}
                    msgId={msgId}
                    mediaData={media}
                    uploadStatus={uploadStatus}
                />
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
            {is_uploading === 2 &&  <View bg='#fff' position={'absolute'} bottom={'45%'} right={'43%'} shadow={5} borderRadius={50}>
                <View p='3' >
                    <PlayIcon />
                </View>
            </View>}
        </View>
    )
}
export default VideoCard;