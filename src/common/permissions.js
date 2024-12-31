import { AndroidForegroundServiceType } from '@notifee/react-native';
import { Platform } from 'react-native';
import { PERMISSIONS, RESULTS, check, checkMultiple, request, requestMultiple } from 'react-native-permissions';

export const requestFileStoragePermission = async () => {
   // Android Version 32 and below
   if (Platform.OS === 'android' && Platform.Version <= 32) {
      return await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
   } else {
      // returning granted as we don't need permission to access files in ios and Android version 13 or higher
      return Promise.resolve('granted');
   }
};

export const requestCameraMicPermission = async () => {
   switch (true) {
      case Platform.OS === 'ios': {
         const { 'ios.permission.CAMERA': camera, 'ios.permission.MICROPHONE': mic } = await requestMultiple([
            PERMISSIONS.IOS.CAMERA,
            PERMISSIONS.IOS.MICROPHONE,
         ]);
         if (
            (camera === RESULTS.GRANTED || camera === RESULTS.LIMITED) &&
            (mic === RESULTS.GRANTED || mic === RESULTS.LIMITED)
         ) {
            return 'granted';
         } else if (camera === RESULTS.BLOCKED || mic === RESULTS.BLOCKED) {
            return 'blocked';
         } else {
            return 'denied';
         }
      }
      case Platform.OS === 'android': {
         const permissionStatus = await requestMultiple([PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.RECORD_AUDIO]);

         if (
            permissionStatus[PERMISSIONS.ANDROID.CAMERA] === RESULTS.GRANTED &&
            permissionStatus[PERMISSIONS.ANDROID.RECORD_AUDIO] === RESULTS.GRANTED
         ) {
            return RESULTS.GRANTED;
         } else if (
            permissionStatus[PERMISSIONS.ANDROID.CAMERA] === RESULTS.BLOCKED ||
            permissionStatus[PERMISSIONS.ANDROID.RECORD_AUDIO] === RESULTS.BLOCKED
         ) {
            return RESULTS.BLOCKED;
         } else {
            return RESULTS.DENIED;
         }
      }
   }
};

export const requestStoragePermission = async () => {
   switch (true) {
      case Platform.OS === 'ios': {
         const iosPermission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
         if (iosPermission === RESULTS.GRANTED || iosPermission === RESULTS.LIMITED) {
            return RESULTS.GRANTED;
         }
         break;
      }
      case Platform.OS === 'android' && Platform.Version <= 32: // Android Version 32 and below
         return await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      default: {
         const androidPermissions = await requestMultiple([
            PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
            PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
         ]); // Android Version 33 and above
         if (
            androidPermissions[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === RESULTS.GRANTED ||
            androidPermissions[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO] === RESULTS.GRANTED
         ) {
            return RESULTS.GRANTED;
         } else if (
            androidPermissions[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === RESULTS.BLOCKED ||
            androidPermissions[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO] === RESULTS.BLOCKED
         ) {
            return RESULTS.BLOCKED;
         } else {
            return RESULTS.DENIED;
         }
      }
   }
};

export const requestAudioStoragePermission = async () => {
   switch (true) {
      case Platform.OS === 'ios':
         return await request(PERMISSIONS.IOS.MEDIA_LIBRARY);
      case Platform.OS === 'android' && Platform.Version <= 32: // Android Vresion 32 and below
         return await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      default: {
         const permited = await requestMultiple([PERMISSIONS.ANDROID.READ_MEDIA_AUDIO]); // Android Vresion 33 and above
         return permited['android.permission.READ_MEDIA_AUDIO'];
      }
   }
};

export const requestContactPermission = async () => {
   return request(Platform.OS === 'android' ? PERMISSIONS.ANDROID.READ_CONTACTS : PERMISSIONS.IOS.CONTACTS);
};

export const requestMicroPhonePermission = async () => {
   return request(Platform.OS === 'android' ? PERMISSIONS.ANDROID.RECORD_AUDIO : PERMISSIONS.IOS.MICROPHONE);
};

export const checkCameraPermission = async () => {
   const permissionsToCheck =
      Platform.OS === 'android'
         ? [PERMISSIONS.ANDROID.RECORD_AUDIO, PERMISSIONS.ANDROID.CAMERA]
         : [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE];

   const results = await checkMultiple(permissionsToCheck);
   if (Platform.OS === 'android') {
      return results[PERMISSIONS.ANDROID.CAMERA] === 'granted' &&
         results[PERMISSIONS.ANDROID.RECORD_AUDIO] === 'granted'
         ? 'granted'
         : 'denied';
   } else {
      return (results[PERMISSIONS.IOS.CAMERA] === 'granted' || results[PERMISSIONS.IOS.CAMERA] === 'limited') &&
         (results[PERMISSIONS.IOS.MICROPHONE] === 'granted' || results[PERMISSIONS.IOS.MICROPHONE] === 'limited')
         ? 'granted'
         : 'denied';
   }
};

export const checkMicroPhonePermission = async () => {
   return check(Platform.OS === 'android' ? PERMISSIONS.ANDROID.RECORD_AUDIO : PERMISSIONS.IOS.MICROPHONE);
};

export const requestBluetoothConnectPermission = () => {
   if (Platform.OS === 'android') {
      return Platform.Version < 31 ? Promise.resolve(RESULTS.GRANTED) : request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
   }
   return Promise.resolve(RESULTS.GRANTED);
};

export const checkBluetoothConnectPermission = () => {
   if (Platform.OS === 'android') {
      return Platform.Version < 31 ? Promise.resolve(RESULTS.GRANTED) : check(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
   } else {
      return Promise.resolve(RESULTS.GRANTED);
   }
};

export const checkVideoPermission = async () => {
   return check(Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA);
};

export const checkVideoCallPermission = async () => {
   if ((await checkVideoPermission()) !== 'granted' && (await checkMicroPhonePermission()) !== 'granted') {
      return 'Audio and Video Permissions';
   } else if ((await checkVideoPermission()) !== 'granted') {
      return 'Video Permission';
   } else if ((await checkMicroPhonePermission()) !== 'granted') {
      return 'Audio Permission';
   } else if (await checkBluetoothConnectPermission()) {
      return 'Bluetooth Permission';
   }
};

export const checkAudioCallpermission = async () => {
   if ((await checkMicroPhonePermission()) !== 'granted' && (await checkBluetoothConnectPermission()) !== 'granted') {
      return 'Audio and Bluetooth Permissions';
   } else if ((await checkMicroPhonePermission()) !== 'granted') {
      return 'Audio Permission';
   } else if ((await checkBluetoothConnectPermission()) !== 'granted') {
      return 'Bluetooth Permission';
   }
};

export const getForegroundPermission = async callType => {
   const [microphonePermission, videoPermission, bluetoothPermission] = await Promise.all([
      checkMicroPhonePermission(),
      checkVideoPermission(),
      checkBluetoothConnectPermission(),
   ]);

   if (microphonePermission === 'granted' && callType === 'audio') {
      return bluetoothPermission === 'granted'
         ? [
              AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MICROPHONE,
              AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE,
           ]
         : [AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MICROPHONE];
   }

   if (videoPermission === 'granted' && callType === 'video') {
      return bluetoothPermission === 'granted'
         ? [
              AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_CAMERA,
              AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MICROPHONE,
              AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE,
           ]
         : [
              AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MICROPHONE,
              AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_CAMERA,
           ];
   }

   return [];
};

export const requestCameraPermission = async () => {
   switch (true) {
      case Platform.OS === 'ios': {
         const ios_permit = await requestMultiple([PERMISSIONS.IOS.CAMERA]);
         return ios_permit['ios.permission.CAMERA'];
      }
      case Platform.OS === 'android': {
         const permited = await requestMultiple([PERMISSIONS.ANDROID.CAMERA]);
         return permited['android.permission.CAMERA'];
      }
   }
};

export const requestLocationPermission = async () => {
   return request(
      Platform.OS === 'android' ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
   );
};
