import React from 'react';
import { View } from 'react-native';
import commonStyles from '../common/commonStyles';
import { useChatMessage } from '../hooks/useChatMessage';
import ImageInfo from './ImageInfo';
import VideoInfo from './VideoInfo';

function PostView({ item }) {
   const { msgId } = item;

   const message = useChatMessage(msgId);
   const { msgBody: { message_type } = {} } = message;

   return (
      <View style={[commonStyles.flex1]} key={msgId}>
         {
            {
               image: <ImageInfo selectedMedia={message.msgBody} />,
               audio: <VideoInfo audioOnly={true} selectedMedia={message.msgBody} />,
               video: <VideoInfo selectedMedia={message.msgBody} />,
            }[message_type]
         }
      </View>
   );
}

export default PostView;
