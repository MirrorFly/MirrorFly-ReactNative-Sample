// App Prefix
export const APP_SCHEMA = 'mirrorfly_rn://';

// Screen Name
export const REGISTERSCREEN = 'REGISTERSCREEN';
export const OTPSCREEN = 'OTPSCREEN';
export const RECENTCHATSCREEN = 'RECENTCHATSCREEN';
export const COUNTRYSCREEN = 'COUNTRYSCREEN';
export const USERLISTSCREEN = 'USERLISTSCREEN';
export const CHATSCREEN = 'CHATSCREEN';
export const CONVERSATION_SCREEN = 'CONVERSATION_SCREEN';
export const FORWARD_MESSSAGE_SCREEN = 'FORWARD_MESSSAGE_SCREEN';
export const MEDIA_POST_PRE_VIEW_SCREEN = 'MEDIA_POST_PRE_VIEW_SCREEN';
export const PROFILESCREEN = 'PROFILESCREEN';
export const CONTACTLIST = 'CONTACTLIST';
export const SETTINGSCREEN = 'SETTINGSCREEN';
export const STATUSSCREEN = 'STATUSSCREEN';
export const EDITSTATUSSCREEN = 'EDITSTATUSSCREEN';
export const CHATCONVERSATION = 'CHATCONVERSATION';
export const CAMERA = 'CAMERA';
export const GROUPSCREEN = 'GROUPSCREEN';
export const NEW_GROUP = 'NEW_GROUP';
export const GROUP_INFO = 'GROUP_INFO';
export const USER_INFO = 'USER_INFO';
export const IMAGEVIEW = 'IMAGEVIEW';
export const EDITNAME = 'EDITNAME';
export const VIEWALLMEDIA = 'VIEWALLMEDIA';
export const MESSAGE_INFO_SCREEN = 'MESSAGE_INFO_SCREEN';
export const MOBILE_CONTACT_LIST_SCREEN = 'MOBILE_CONTACT_LIST_SCREEN';
export const PREVIEW_MOBILE_CONTACT_LIST_SCREEN = 'PREVIEW_MOBILE_CONTACT_LIST_SCREEN';
export const LOCATION_SCREEN = 'LOCATION_SCREEN';
export const VIDEO_PLAYER_SCREEN = 'VIDEO_PLAYER_SCREEN';
export const GALLERY_SCREEN = 'GALLERY_SCREEN';
export const CAMERA_SCREEN = 'CAMERA_SCREEN';
export const MEDIA_PRE_VIEW_SCREEN = 'MEDIA_PRE_VIEW_SCREEN';
export const GALLERY_FOLDER_SCREEN = 'GALLERY_FOLDER_SCREEN';
export const GALLERY_PHOTOS_SCREEN = 'GALLERY_PHOTOS_SCREEN';
// Redux Loading
export const RECENTCHATLOADING = 'RECENTCHATLOADING';

// Connection
export const NOTCONNECTED = 'NOTCONNECTED';
export const CONNECTED = 'CONNECTED';
export const DISCONNECTED = 'DISCONNECTED';

// Regex format
export const urlRegex = /(https?:\/\/[^\s]+)/g;
export const numRegx = /^\d+$/;
export const textRegex = /^[a-zA-Z\s\p{P}]*$/u;

// Constant Data
export const statusListConstant = [
   'Available',
   'Sleeping...',
   'Urgent calls only',
   'At the movies',
   'I am in Mirror Fly',
];

// media upload download status constants
export const mediaStatusConstants = {
   NOT_DOWNLOADED: 'NOT_DOWNLOADED',
   NOT_UPLOADED: 'NOT_UPLOADED',
   DOWNLOADING: 'DOWNLOADING',
   UPLOADING: 'UPLOADING',
   DOWNLOADED: 'DOWNLOADED',
   UPLOADED: 'UPLOADED',
};
// Notification constants
export const deletedMessage = 'This message was deleted';
export const imageEmoji = '📷';
export const videoEmoji = '📽️';
export const contactEmoji = '👤';
export const audioEmoji = '🎵';
export const fileEmoji = '📄';
export const locationEmoji = '📌';

// Others
export const MAP_THHUMBNAIL_URL = 'https://maps.googleapis.com/maps/api/staticmap';
export const INVITE_SMS_CONTENT =
   'Hey, MirrorFly is a real time chat, Audio and Video call solution for B2B and B2C.\n Download the app from this URL: https://app.mirrorfly.com';
export const INVITE_APP_URL = 'https://app.mirrorfly.com';
export const CALL_BACK = 'CALL_BACK';
export const NOTIFICATION = 'notification';

// api call error message
export const NETWORK_ERROR = 'Network Error';
