import { CameraIcon, ContactIcon, DocumentIcon, GalleryIcon, HeadSetIcon, LocationIcon } from './common/Icons';
import {
   handleAudioSelect,
   handleContactSelect,
   handleLocationSelect,
   openCamera,
   openDocumentPicker,
   openGallery,
} from './Helper/Chat/ChatHelper';

const config = {
   fileSize: 50,
   imageFileSize: 10,
   videoFileSize: 30,
   audioFileSize: 30,
   documentFileSize: 20,
   internetErrorMessage: 'Please check your Internet connection',
   GOOGLE_LOCATION_API_KEY: '', // Paste GOOGLE_LOCATION_API_KEY HERE
   typingStatusGoneWaitTime: 500,
   minAllowdGroupMembers: 2,
   maxAllowdGroupMembers: 238,
   chatMessagesSizePerPage: 20,
   conversationListBottomYaxisLimit: 60,
   // =====================================
   API_URL: '', // Paste API BASE URL HERE
   licenseKey: '', // Paste LICENSEKEY BASE URL HERE
   // =====================================
};

export default config;

export const attachmentMenuIcons = [
   {
      name: 'Document',
      icon: DocumentIcon,
      formatter: openDocumentPicker,
   },
   {
      name: 'Camera',
      icon: CameraIcon,
      formatter: openCamera,
   },
   {
      name: 'Gallery',
      icon: GalleryIcon,
      formatter: openGallery,
   },
   {
      name: 'Audio',
      icon: HeadSetIcon,
      formatter: handleAudioSelect,
   },
   {
      name: 'Contact',
      icon: ContactIcon,
      formatter: handleContactSelect,
   },
   {
      name: 'Location',
      icon: LocationIcon,
      formatter: handleLocationSelect,
   },
];

// Define offset mappings based on device heights
export const offsetMappings = [
   { height: 667, offset: 20 }, // iPhone 6s
   { height: 812, offset: 30 }, // iPhone X, iPhone 11 Pro, or iPhone 12 Pro
   { height: 844, offset: 45 }, // iPhone 12
   { height: 896, offset: 35 }, // iPhone XS Max, iPhone 11 Pro Max
   { height: 926, offset: 35 }, // iPhone 12 Pro, iPhone 12 Pro Max
   // Add more mappings for other iPhone models as needed
];
