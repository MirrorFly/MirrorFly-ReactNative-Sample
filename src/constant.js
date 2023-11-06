// Screen Name
export const REGISTERSCREEN = 'REGISTERSCREEN';
export const OTPSCREEN = 'OTPSCREEN';
export const RECENTCHATSCREEN = 'RECENTCHATSCREEN';
export const COUNTRYSCREEN = 'COUNTRYSCREEN';
export const USERLISTSCREEN = 'USERLISTSCREEN';
export const CHATSCREEN = 'CHATSCREEN';
export const CONVERSATION_SCREEN = 'CONVERSATION_SCREEN';
export const FORWARD_MESSSAGE_SCREEN = 'FORWARD_MESSSAGE_SCREEN';
export const PROFILESCREEN = 'PROFILESCREEN';
export const CONTACTLIST = 'CONTACTLIST';
export const SETTINGSCREEN = 'SETTINGSCREEN';
export const STATUSSCREEN = 'STATUSSCREEN';
export const EDITSTATUSSCREEN = 'EDITSTATUSSCREEN';
export const CHATCONVERSATION = 'CHATCONVERSATION';
export const CAMERA = 'CAMERA';
// Redux Loading
export const RECENTCHATLOADING = 'RECENTCHATLOADING';

//----------------------Call related constants starts here ----------------------
// Display DISCONNECTED text duration in milli seconds
export const DISCONNECTED_SCREEN_DURATION = 3000;
export const MISSEDCALL_SCREEN_DURATION = 3000;
// Call Ringing duration in milli seconds
export const CALL_RINGING_DURATION = 30000;
// CALL SESSION STATUS
export const CALL_SESSION_STATUS_CLOSED = 'closed';
export const CALL_SESSION_STATUS_EXIT = 'exit';
// CALL SWITCH PROCESS
export const CALL_CONVERSION_STATUS_ACCEPT = 'accept';
export const CALL_CONVERSION_STATUS_DECLINE = 'decline';
export const CALL_CONVERSION_STATUS_CANCEL = 'cancel';
export const CALL_CONVERSION_STATUS_REQ_WAITING = 'request_waiting';
export const CALL_CONVERSION_STATUS_REQUEST_INIT = 'request_init';
export const CALL_CONVERSION_STATUS_REQUEST = 'request';
// CALL STATUS
export const CALL_STATUS_RECONNECT = 'reconnecting';
export const CALL_STATUS_CONNECTED = 'connected';
export const CALL_STATUS_DISCONNECTED = 'disconnected';
export const CALL_STATUS_ENDED = 'ended';
export const CALL_STATUS_CONNECTING = 'connecting';
export const CALL_STATUS_CALLING = 'calling';
export const CALL_STATUS_BUSY = 'busy';
export const CALL_STATUS_ENGAGED = 'engaged';
export const CALL_STATUS_RINGING = 'ringing';
export const CALL_STATUS_HOLD = 'hold';
export const CALL_STATUS_ATTENDED = 'attended';

// ----------------------Call related constants ends here ----------------------

// Connection
export const NOTCONNECTED = 'notConnected';
export const CONNECTED = 'connected';
export const DISCONNECTED = 'disconnected';

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
export const MAP_THHUMBNAIL_URL =
  'https://maps.googleapis.com/maps/api/staticmap';
export const INVITE_SMS_CONTENT =
  'Hey, MirrorFly is a real time chat, Audio and Video call solution for B2B and B2C.\n Download the app from this URL: https://app.mirrorfly.com';
export const INVITE_APP_URL = 'https://app.mirrorfly.com';
export const CALL_BACK = 'CALL_BACK';
export const NOTIFICATION = 'NOTIFICATION';
