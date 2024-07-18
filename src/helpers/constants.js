export const MIRRORFLY_RN = 'mirrorfly_rn://';

export const numRegx = /^\d+$/;
export const MIX_BARE_JID = /^([^( "'&\/:<>@\\)])+\@(mix\.[^( "'&\/:<>@\\)]{1,})$/; //NOSONAR
export const BLOCK_CONTACT_TYPE = 'block_user';
export const UNBLOCK_CONTACT_TYPE = 'unblock_user';
export const CHAT_TYPE_SINGLE = 'chat';
export const CHAT_TYPE_GROUP = 'groupchat';
export const CHAT_TYPE_BROADCAST = 'broadcast';
export const MSG_PROCESSING_STATUS_ID = 3;
export const MSG_SENT_ACKNOWLEDGE_STATUS_ID = 0;
export const MSG_DELIVERED_STATUS_ID = 1;
export const MSG_SEEN_STATUS_ID = 2;
export const MSG_PROCESSING_STATUS = 'processing';
export const MSG_SENT_ACKNOWLEDGE_STATUS = 'acknowledge';
export const MSG_DELIVERED_STATUS = 'delivered';
export const MSG_DELIVERED_STATUS_CARBON = 'carbonDelivered';
export const MSG_SEEN_STATUS = 'seen';
export const MSG_SEEN_STATUS_CARBON = 'carbonSeen';
export const MSG_SENT_SEEN_STATUS_CARBON = 'carbonSentSeen';
export const MSG_SEEN_ACKNOWLEDGE_STATUS = 'acknowledge';
export const MSG_SENT_STATUS_CARBON = 'carbonSentMessage';
export const MSG_SENT_STATUS = 'sentMessage';
export const MSG_RECEIVE_STATUS_CARBON = 'carbonReceiveMessage';
export const MSG_RECEIVE_STATUS = 'receiveMessage';
export const MSG_DELETE_STATUS_CARBON = 'carbonDeleteMessage';
export const MSG_DELETE_STATUS = 'deleteMessage';
export const USER_PRESENCE_STATUS_ONLINE = 'online';
export const USER_PRESENCE_STATUS_OFFLINE = 'unavailable';
export const GROUP_USER_ADDED = 'userAdded';
export const GROUP_USER_REMOVED = 'userRemoved';
export const GROUP_USER_MADE_ADMIN = 'madeAdmin';
export const GROUP_USER_LEFT = 'userLeft';
export const GROUP_PROFILE_INFO_UPDATED = 'profileUpdated';
export const GROUP_CHAT_PROFILE_UPDATED_NOTIFY = 'groupProfileUpdated';
export const GROUP_CREATED = 'groupCreated';
export const LOGOUT = 'logout';
export const MULTI_DEVICE_LOGOUT_MSG = 'New device logged in with this username. Logging out here.';
export const CARBON_LOGOUT = 'carbonLogout';
export const DEFAULT_USER_STATUS = 'I am in MirrorFly';
export const CONNECTION_STATE_CONNECTED = 'CONNECTED';
export const CONNECTION_STATE_DISCONNECTED = 'DISCONNECTED';
export const CONNECTION_STATE_CONN_FAILED = 'CONNECTIONFAILED';
export const CONNECTION_STATE_AUTH_FAILED = 'AUTHENTICATIONFAILED';
export const CONNECTION_STATE_ERROR_OCCURED = 'ERROROCCURED';
export const CONNECTION_STATE_CONNECTING = 'CONNECTING';
export const MSG_CLEAR_CHAT = 'clearChat';
export const MSG_CLEAR_CHAT_CARBON = 'carbonClearChat';
export const MSG_DELETE_CHAT = 'deleteChat';
export const MSG_DELETE_CHAT_CARBON = 'carbonDeleteChat';
export const DELETE_CALL_LOG = 'deleteCallLog';
export const DEFAULT_TITLE_NAME = 'MirrorFly';
export const AUDIO_ACC_WINDOWS = 'audio/vnd.dlna.adts';
export const THIS_MESSAGE_WAS_DELETED = 'This message was deleted';
export const YOU_DELETED_THIS_MESSAGE = 'You deleted this message';
export const ORIGINAL_MESSAGE_DELETED = 'Original message not available';
export const BRAND_NAME = 'MirrorFly';
export const MAP_URL = 'https://maps.googleapis.com/maps/api/staticmap';
export const GROUP_UPDATE_ACTIONS = [
   GROUP_USER_ADDED,
   GROUP_USER_REMOVED,
   GROUP_USER_MADE_ADMIN,
   GROUP_PROFILE_INFO_UPDATED,
   GROUP_USER_LEFT,
];
export const NEW_CHAT_CONTACT_PERMISSION_DENIED =
   'You have denied contact permission on mobile. Allow permission for MirrorFly to access contacts and start a new chat.';
export const NEW_GROUP_CONTACT_PERMISSION_DENIED =
   'You have denied contact permission on mobile. Allow permission for MirrorFly to access contacts and start a new group.';
export const ADD_PARTICIPANT_GROUP_CONTACT_PERMISSION_DENIED =
   'You have denied contact permission on mobile. Allow permission for MirrorFly to access contacts and add a new participant.';
export const NEW_CALL_CONTACT_PERMISSION_DENIED =
   'You have denied contact permission on mobile. Allow permission for MirrorFly to access contacts and start a new call.';
export const ADD_PARTICIPANT_CALL_CONTACT_PERMISSION_DENIED =
   'You have denied contact permission on mobile. Allow permission for MirrorFly to access contacts and add a new participant.';
export const REPORT_FROM_CONTACT_INFO = 'REPORT_FROM_CONTACT_INFO';
export const LOGIN_EXCEEDED_ERROR_MESSAGE = 'You have reached maximum sessions allowed.';
export const COMMON_ERROR_MESSAGE = 'Something went wrong. Please try again.';
export const SESSION_LOGOUT = 'The session has been logged out';
export const SERVER_LOGOUT = 'serverLogout';

export const ALLOWED_IMAGE_VIDEO_FORMATS = ['png', 'jpeg', 'jpg', 'mp4'];
export const ALLOWED_AUDIO_FORMATS = ['.aac', '.mp3', '.wav'];
export const AUDIO_VIDEO_FORMATS = ['mp3', 'aac', 'wav', 'mp4'];
export const ALLOWED_DOCUMENT_EXTENSION = [
   'doc',
   'docx',
   'pdf',
   'xls',
   'xlsx',
   'txt',
   'csv',
   'ppt',
   'pptx',
   'zip',
   'rar',
];

export const IMAGE_FORMATS = ['image/png', 'image/jpeg', 'image/jpg'];
export const AUDIO_FORMATS = [
   'audio/mp3',
   'audio/wav',
   // 'audio/vnd.wave',
   'audio/x-wav',
   'audio/mpeg',
   'audio/aac',
   'audio/vnd.dlna.adts',
   'audio/aac-adts',
];
export const VIDEO_FORMATS = ['video/mp4'];
export const DOCUMENT_FORMATS = [
   'application/pdf',
   'application/msword',
   'application/vnd.ms-excel',
   'application/vnd.ms-powerpoint',
   'text/plain',
   'text/csv',
   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
   'application/zip',
   'application/x-zip-compressed',
   'application/rar',
   'application/x-rar',
   'application/vnd.rar',
   'application/excel',
   'application/x-excel',
   'application/x-msexcel',
   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
   'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];
export const ALLOWED_ALL_FILE_FORMATS = [
   'jpg',
   'jpeg',
   'png',
   'mp3',
   'wav',
   'aac',
   'mpeg',
   'mp4',
   'doc',
   'docx',
   'pdf',
   'xls',
   'xlsx',
   'txt',
   'csv',
   'ppt',
   'zip',
   'rar',
   'pptx',
   'acc',
];
export const CHAT_IMAGES = 'chatimages';
export const CHAT_AUDIOS = 'chataudios';

export const MAX_WIDTH_WEB = 330;
export const MIN_WIDTH_WEB = 240;
export const MAX_HEIGHT_WEB = 338;
export const MIN_HEIGHT_WEB = 83;

export const MAX_WIDTH_AND = 250;
export const MIN_WIDTH_AND = 210;
export const MAX_HEIGHT_AND = 320;
export const MIN_HEIGHT_AND = 80;

export const MIN_OFFSET_WIDTH = 280;
export const MIN_OFFSET_HEIGHT = 280;

export const MIN_THUMB_WIDTH = 322;

export const PREVIEW_MEDIA_TYPES = ['image', 'video', 'audio', 'file'];
export const MEDIA_MESSAGE_TYPES = ['image', 'video', 'audio', 'file'];
export const INITIAL_LOAD_MEDIA_LIMIT = 20;
export const LOAD_MORE_MEDIA_LIMIT = 10;
export const CAPTION_CHARACTER_LIMIT = 1024;
export const ALLOWED_KEY_CODES = [8, 35, 36, 37, 38, 39, 40, 46, 65, 67, 86];
export const TYPE_DELAY_TIME = 5000;
export const CHAT_HISTORY_LIMIT = 20;
export const NO_CONVERSATION = 'There is no conversation.';
export const NO_INTERNET = 'Please check your internet connectivity';
export const CHAT_INPUT = 'CHAT_INPUT';
export const NOTIFICATION = 'NOTIFICATION';

// media upload download status constants
export const mediaStatusConstants = {
   NOT_DOWNLOADED: 'NOT_DOWNLOADED',
   NOT_UPLOADED: 'NOT_UPLOADED',
   DOWNLOADING: 'DOWNLOADING',
   UPLOADING: 'UPLOADING',
   DOWNLOADED: 'DOWNLOADED',
   UPLOADED: 'UPLOADED',
   LOADED: 'LOADED',
};

export const MAP_THHUMBNAIL_URL = 'https://maps.googleapis.com/maps/api/staticmap';

export const imageEmoji = '📷';
export const videoEmoji = '📽️';
export const contactEmoji = '👤';
export const audioEmoji = '🎵';
export const fileEmoji = '📄';
export const locationEmoji = '📌';

// ------------ CALL CONSTANTS --------------------
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
export const CALL_STATUS_INCOMING = 'Incoming audio call';
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
export const CALL_STATUS_TRYING = 'Trying to connect';

// MESSAGE BASED ON CALL STATUS
export const CALL_BUSY_STATUS_MESSAGE = 'User is busy';
export const CALL_ENGAGED_STATUS_MESSAGE = 'Busy on another call';
export const CALL_HOLD_STATUS_MESSAGE = 'Call on hold';
// CALL TYPE
export const CALL_TYPE_AUDIO = 'audio';
export const CALL_TYPE_VIDEO = 'video';

export const PERMISSION_DENIED = 'Permission denied.';
export const LARGE_VIDEO_USER = 'LARGE_VIDEO_USER';

// CALL SCREEN NAMES
export const INCOMING_CALL_SCREEN = 'INCOMING_CALL_SCREEN';
export const OUTGOING_CALL_SCREEN = 'OUTGOING_CALL_SCREEN';
export const ONGOING_CALL_SCREEN = 'ONGOING_CALL_SCREEN';
export const CALL_AGAIN_SCREEN = 'CALL_AGAIN_SCREEN';
export const CONNECTING_SCREEN = 'CONNECTING_SCREEN';
export const ALREADY_ON_CALL = 'You are already on another call';

//NOTIFICATIONS NAMES
export const INCOMING_CALL = 'INCOMING_CALL';
export const OUTGOING_CALL = 'OUTGOING_CALL';
export const ONGOING_CALL = 'ONGOING_CALL';
export const MISSED_CALL = 'MISSED_CALL';

// CALL AUDIO ROUTING TYPES
export const AUDIO_ROUTE_SPEAKER = 'Speaker';
export const AUDIO_ROUTE_PHONE = 'Phone';
export const AUDIO_ROUTE_HEADSET = 'Headset';
export const AUDIO_ROUTE_BLUETOOTH = 'Bluetooth';

// Device Types and Package Names
export const BRAND_XIAOMI = 'xiaomi';
export const BRAND_REDMI = 'redmi';
export const PACKAGE_XIAOMI = 'com.miui.securitycenter';
export const PACKAGE_XIAOMI_WINDOW_COMPONENT = 'com.miui.permcenter.permissions.PermissionsEditorActivity';
export const alertPermissionMessage =
   'Allow MirrorFly to send you notifications while the app in background.\n\n Please continue to app Settings > select OthersPermission > enable the all permissions.';
