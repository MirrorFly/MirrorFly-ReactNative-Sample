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

export const COMMON_ERROR_MESSAGE = 'Something went wrong. Please try again.';
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
