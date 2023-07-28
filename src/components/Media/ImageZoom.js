import React from 'react';
import { Dimensions, Image, Pressable, Text, View, Share, LogBox } from 'react-native';
import { useSelector } from 'react-redux';
import { BackArrowIcon, ShareIcon } from '../common/Icons';
import ImageViewer from 'react-native-image-zoom-viewer';
import { background } from 'native-base/lib/typescript/theme/styled-system';

const ImageZoom = (props) => {
    const { item: { fileDetails = {} } = {} } = props
    const { image: { uri, height, width } } = fileDetails    
    const [initialImageSize, setInitialImageSize] = React.useState({ width: 100, height: 100 });

    const calculateInitialImageSize = () => {
        const windowWidth = Dimensions.get('window').width;
        const windowHeight = Dimensions.get('window').height;

        const imageAspectRatio = width / height;
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
    LogBox.ignoreLogs(['Animated: `useNativeDriver`']);
    }, []);

    const images = [{
        url: uri,
    }];

    const initialIndex = 0;
    return (
            <View style={{ flex: 1}}>
                <ImageViewer
                    imageUrls={images}
                    style={initialImageSize}
                    renderIndicator={() => null}
                    // backgroundColor="#fff"
                    index={initialIndex}
                    enableImageZoom={true}
                    useNativeDriver={true}
                    maxOverflow={3}
                // enableSwipeDown={true}
                />
            </View>
    );
};

export default ImageZoom;