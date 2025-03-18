import React from 'react';
import { View } from 'react-native';
import VideoInfo from '../common/VideoInfo';
import ZoomableImage from '../common/ZoomableImage';
import commonStyles from '../styles/commonStyles';

function PostView({ item }) {
   const { msgId } = item;

   const { msgBody: { message_type } = {} } = item;

   return (
      <View style={[commonStyles.flex1]} key={msgId}>
         {
            {
               image: (
                  <ZoomableImage
                     image={item.msgBody?.media?.local_path || item.msgBody?.media?.file?.fileDetails?.uri}
                     thumbImage={
                        item.msgBody?.media?.thumb_image || item.msgBody?.media?.file?.fileDetails?.thumb_image
                     }
                  />
               ),
               audio: <VideoInfo audioOnly={true} selectedMedia={item.msgBody} />,
               video: <VideoInfo selectedMedia={item.msgBody} />,
            }[message_type]
         }
      </View>
   );
}

export default PostView;
