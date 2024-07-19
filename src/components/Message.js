import React from 'react';
import AudioCard from './AudioCard';
import ContactCard from './ContactCard';
import DocumentCard from './DocumentCard';
import ImageCard from './ImageCard';
import LocationCard from './LocationCard';
import TextCard from './TextCard';
import VideoCard from './VideoCard';

function Message({ chatUser, item, isSender }) {
   const { msgBody: { message_type } = {} } = item;

   if (message_type === 'text' || message_type === 'auto_text') {
      return <TextCard item={item} isSender={isSender} />;
   }
   if (message_type === 'image') {
      return <ImageCard item={item} isSender={isSender} chatUser={chatUser} />;
   }
   if (message_type === 'video') {
      return <VideoCard item={item} isSender={isSender} chatUser={chatUser} />;
   }
   if (message_type === 'file') {
      return <DocumentCard item={item} isSender={isSender} chatUser={chatUser} />;
   }
   if (message_type === 'audio') {
      return <AudioCard item={item} isSender={isSender} chatUser={chatUser} />;
   }
   if (message_type === 'location') {
      return <LocationCard item={item} isSender={isSender} chatUser={chatUser} />;
   }
   if (message_type === 'contact') {
      return <ContactCard item={item} isSender={isSender} />;
   }
}

export default React.memo(Message);
