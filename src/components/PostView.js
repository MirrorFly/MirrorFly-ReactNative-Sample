import React from 'react';
import { View } from 'react-native';
import VideoInfo from '../common/VideoInfo';
import ZoomableImage from '../common/ZoomableImage';
import commonStyles from '../styles/commonStyles';

function PostView({ item }) {
   const { msgId } = item;

   const {
      msgBody: {
         message_type,
         media: {
            androidWidth,
            androidHeight,
            local_path,
            thumb_image,
            file: { fileDetails: { uri, thumb_image: fileDetailsthumb_image } = {} } = {},
         } = {},
      } = {},
   } = item;

   return (
      <View style={[commonStyles.flex1]} key={msgId}>
         {
            {
               image: (
                  <ZoomableImage
                     image={local_path || uri}
                     androidHeight={androidHeight * 2}
                     androidWidth={androidWidth * 2}
                     thumbImage={thumb_image || fileDetailsthumb_image}
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
