import React from 'react';
import {  BackHandler, View } from 'react-native';
import {  useDispatch, useSelector } from 'react-redux';
import {  RECENTCHATSCREEN } from '../constant';
import { navigate } from '../redux/navigationSlice';
import ImageInfo from './ImageInfo';
import VideoInfo from './VideoInfo';

const PostPreViewPage = () => {

   const chatSelectedMediaImage = useSelector ((state) => state.chatSelectedMedia.data);
    const dispatch = useDispatch();
    
    const handleBackBtn = () => {
        let x = { screen: RECENTCHATSCREEN }
        dispatch(navigate(x))
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
        <View style={{ flex: 1}}>
        {{
           'image': <ImageInfo handleBackBtn ={handleBackBtn}  />,
           'video':<VideoInfo handleBackBtn ={handleBackBtn}/>,
        }[[chatSelectedMediaImage.message_type]]}
        </View>
    );
};

export default PostPreViewPage;
