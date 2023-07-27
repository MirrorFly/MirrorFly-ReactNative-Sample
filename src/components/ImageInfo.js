import React from 'react';
import { Dimensions, Image, Pressable, Text, View, Share } from 'react-native';
import { useSelector } from 'react-redux';
import { BackArrowIcon, ShareIcon } from '../common/Icons';
import ImageViewer from 'react-native-image-zoom-viewer';
import { getUserIdFromJid } from '../Helper/Chat/Utility';

const ImageInfo = (props) => {

    const [arrayList, setArrayList] = React.useState("");
    const messages = useSelector(state => state.chatConversationData.data);
    const fromUserJId = useSelector(state => state.navigation.fromUserJid);
    const userJid = getUserIdFromJid(fromUserJId);    
    const messageArray = Object.values(messages[userJid].messages);

    const filterMessagesByType = (messageType) => {
        return messageArray.filter((message) => message.msgBody?.message_type === messageType);
    };

    React.useEffect(() => {

        const filteredMsgInfo = filterMessagesByType();

        setArrayList(filteredMsgInfo);

    }, [])

    const openBottomSheet = async () => {
        try {
            const base64Image = SingleSelectedImage.thumb_image;
            const shareOptions = {
                type: 'image/png',
                url: `data:image/png;base64,${base64Image}`,
                message: 'Hey This is sample message..!!!',
            };
            await Share.share(shareOptions);
        } catch (error) {
            console.error('Error sharing image:', error);
        }
    };

    const SingleSelectedImage = useSelector((state) => state.chatSelectedMedia.data.media);
    const ImageBase64 = 'data:image/png;base64,' + SingleSelectedImage.thumb_image;
    const [initialImageSize, setInitialImageSize] = React.useState({ width: 100, height: 100 });

    const calculateInitialImageSize = () => {
        const windowWidth = Dimensions.get('window').width;
        const windowHeight = Dimensions.get('window').height;

        const imageAspectRatio = SingleSelectedImage.androidWidth / SingleSelectedImage.androidHeight;
        let initialWidth = windowWidth;
        let initialHeight = windowWidth / imageAspectRatio;

        if (initialHeight > windowHeight) {
            initialHeight = windowHeight;
            initialWidth = windowHeight * imageAspectRatio;
        }

        setInitialImageSize({ width: initialWidth, height: initialHeight });
    };
    React.useEffect(() => {
        calculateInitialImageSize();
    }, []);

    const images = [{
        url: ImageBase64,

    }];

    const handleBackBtn = () => {
        props.handleBackBtn();
    }

    const initialIndex = 0;
    return (


        <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", padding: 12, alignItems: "center", justifyContent: 'space-between', backgroundColor: "#F2F2F2", width: "100%", borderBottomColor: "#0000001A", borderBottomWidth: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                    <Pressable onPress={handleBackBtn} style={{ marginLeft: 8 }}>
                        <BackArrowIcon />
                    </Pressable>
                    <Text style={{ color: "#000", fontSize: 20, fontWeight: "500", marginLeft: 20 }}>Sent Media</Text>
                </View>
                <Pressable onPress={openBottomSheet}>

                    <ShareIcon width="24" height="24" color={"#000"} />
                </Pressable>
            </View>

            <View style={{ flex: 1, backgroundColor: "#fff", }}>
                <ImageViewer
                    imageUrls={images}
                    style={initialImageSize}
                    renderIndicator={() => null}
                    backgroundColor="#fff"
                    index={initialIndex}
                    enableImageZoom={true}
                    useNativeDriver={true}
                    maxOverflow={3}
                // enableSwipeDown={true}
                />
            </View>
        </View>
    );
};

export default ImageInfo;