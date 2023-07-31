import React from 'react';
import { Dimensions, View } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';

const ImageInfo = (props) => {
    const { selectedMedia } = props
    const SingleSelectedImage = selectedMedia.media
    // let isSender = currentUserJID === props?.message?.fromUserJid
    /**
        const [arrayList, setArrayList] = React.useState("");
     *  const messageArray = Object.values(messages[userJid].messages);
        const filterMessagesByType = (messageType) => {
        return messageArray.filter((message) => message.msgBody?.message_type === messageType);
        };

     React.useEffect(() => {
        const filteredMsgInfo = filterMessagesByType();
        setArrayList(filteredMsgInfo);
    }, [])
    */

    const ImageBase64 = SingleSelectedImage.local_path || SingleSelectedImage?.file?.fileDetails?.image?.uri;
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