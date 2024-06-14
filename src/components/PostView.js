import React from 'react';
import { View } from 'react-native';
import commonStyles from '../styles/commonStyles';
import ImageInfo from './ImageInfo';
import VideoInfo from './VideoInfo';

function PostView({ item }) {
   const { msgId } = item;

   const { msgBody: { message_type } = {} } = item;

   return (
      <View style={[commonStyles.flex1]} key={msgId}>
         {
            {
               image: <ImageInfo selectedMedia={item.msgBody} />,
               audio: <VideoInfo audioOnly={true} selectedMedia={item.msgBody} />,
               video: <VideoInfo selectedMedia={item.msgBody} />,
            }[message_type]
         }
      </View>
   );
}

export default PostView;
