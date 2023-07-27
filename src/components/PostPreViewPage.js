import React from 'react';
import { BackHandler, View } from 'react-native';
import {  useSelector } from 'react-redux';
import ImageInfo from './ImageInfo';
import VideoInfo from './VideoInfo';

const PostPreViewPage = (props) => {
    const { setLocalNav } = props
    const chatSelectedMediaImage = useSelector((state) => state.chatSelectedMedia.data);

    const handleBackBtn = () => {
        console.log('handleBack')
        setLocalNav("CHATCONVERSATION")
        return true;
    }

    const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackBtn
    );

    React.useEffect(() => {
        return () => {
            backHandler.remove();
        }
    }, [])

    return (
        <View style={{ flex: 1 }}>
            {{
                'image': <ImageInfo handleBackBtn={handleBackBtn} />,
                'video': <VideoInfo handleBackBtn={handleBackBtn} />,
            }[[chatSelectedMediaImage.message_type]]}
        </View>
    );
};

export default PostPreViewPage;
