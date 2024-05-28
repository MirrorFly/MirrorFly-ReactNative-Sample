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
   attachement: true,
   videoDuaration: 40,
   audioDuaration: 60,
   fileSize: 50,
   imageFileSize: 10,
   videoFileSize: 30,
   audioFileSize: 30,
   documentFileSize: 20,
   maxAllowedMediaCount: 5,
   maximumAllowedUsersToForward: 5,
   maximumCharForwardPopUp: 60,
   internetErrorMessage: 'Please check your Internet connection',
   reportMembers: 5,
   GOOGLE_LOCATION_API_KEY: 'AIzaSyBaKkrQnLT4nacpKblIE5d4QK6GpaX5luQ', // NOSONAR
   typingStatusGoneWaitTime: 500,
   minAllowdGroupMembers: 2,
   maxAllowdGroupMembers: 238,
   chatMessagesSizePerPage: 20,
   recentChatsPerPage: 20,
   conversationListBottomYaxisLimit: 60,
   // ================ Dev environment variables =====================
   // API_URL: 'https://api-uikit-dev.contus.us/api/v1',
   // licenseKey: '2sdgNtr3sFBSM3bYRa7RKDPEiB38Xo',
   // =====================================
   // // ================ QA Environment variables =====================
   // API_URL: 'https://api-uikit-qa.contus.us/api/v1',
   // licenseKey: 'ckIjaccWBoMNvxdbql8LJ2dmKqT5bp',
   // ================ UAT/Staging Environment variables =====================
   // API_URL: 'https://api-uikit-uat.contus.us/api/v1',
   // licenseKey: 'lu3Om85JYSghcsB6vgVoSgTlSQArL5',
   // ================test kooratech Environment variables =====================
   // API_URL: 'https://testkooratech-api.mirrorfly.com/api/v1',
   // licenseKey: 'Gk0mPI8sq8FY0FEuYQHExG9PkZ1ZXa',
   // API_URL: 'https://kooratech-api.mirrorfly.com/api/v1'
   // licenseKey: 'e7x7JGFk9aR60JGUY9kYXZf1d9vRYN'
   // ================sekron Environment variables =====================
   // API_URL: 'https://sekerontechnolo-api.mirrorfly.com/api/v1',
   // licenseKey: 'Q7njxET7AGU9oCfYbM4CD3UFbdMI9B',
   // ================ beta Environment variables =====================
   // API_URL: 'https://api-beta.mirrorfly.com/api/v1',
   // licenseKey: 'lu3Om85JYSghcsB6vgVoSgTlSQArL5',
   // ================ ace Environment variables =====================
   // API_URL: 'https://dev-api.ace.online/api/v1',
   // licenseKey: 'fq7zLEnyR48iq8O6zu0TEkWiQ701zI',
   // ================ chatterr Environment variables =====================
   API_URL: 'https://wayfarerkk-api.mirrorfly.com/api/v1',
   licenseKey: 'dc6FCTZufWPDdfrGP0p9zUd47p04Rm',
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
