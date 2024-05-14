import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { Box, Text } from 'native-base';
import React from 'react';
import { Alert, Linking, NativeModules, Platform } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { PERMISSIONS, RESULTS, check, checkMultiple, request, requestMultiple } from 'react-native-permissions';
import { batch } from 'react-redux';
import { showToast } from '../Helper';
import {
   BRAND_REDMI,
   BRAND_XIAOMI,
   PACKAGE_XIAOMI,
   PACKAGE_XIAOMI_WINDOW_COMPONENT,
   alertPermissionMessage,
} from '../Helper/Calls/Constant';
import { endOngoingCallLogout } from '../Helper/Calls/Utility';
import * as RootNav from '../Navigation/rootNavigation';
import SDK from '../SDK/SDK';
import { REGISTERSCREEN } from '../constant';
import { navigate } from '../redux/Actions/NavigationAction';
import { profileDetail } from '../redux/Actions/ProfileAction';
import { ResetStore } from '../redux/Actions/ResetAction';
import Store from '../redux/store';
import { mflog } from '../uikitHelpers/uikitMethods';
const { ActivityModule } = NativeModules;

const toastConfig = {
   duration: 2500,
   avoidKeyboard: true,
};

const documentAttachmentTypes = [
   DocumentPicker.types.allFiles,
   // DocumentPicker.types.pdf
   // DocumentPicker.types.ppt
   // DocumentPicker.types.pptx
   // DocumentPicker.types.doc
   // DocumentPicker.types.docx
   // DocumentPicker.types.xls
   // DocumentPicker.types.xlsx
   // DocumentPicker.types.plainText
   // DocumentPicker.types.zip
   // DocumentPicker.types.csv
   // /** need to add rar file type and verify that */
   // '.rar'
];

export const getExtention = filename => {
   // To get the file extension
   const dotIndex = filename.lastIndexOf('.');
   return dotIndex !== -1 ? filename.substring(dotIndex + 1) : undefined;
};

export const handleGalleryPickerSingle = async () => {
   try {
      const res = await DocumentPicker.pickSingle({
         type: [DocumentPicker.types.images],
         presentationStyle: 'fullScreen',
         copyTo: Platform.OS === 'android' ? 'documentDirectory' : 'cachesDirectory',
      });
      if (res) {
         return res;
      }
   } catch (error) {
      mflog('Failed to pick single image using document picker', error);
   }
};

export const handleAudioPickerSingle = async () => {
   try {
      const res = await DocumentPicker.pickSingle({
         type: [DocumentPicker.types.audio],
         presentationStyle: 'fullScreen',
         copyTo: Platform.OS === 'android' ? 'documentDirectory' : 'cachesDirectory',
      });
      SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
      if (res) {
         return res;
      }
   } catch (error) {
      SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
      mflog('Failed to pick single audio using document picker', error);
   }
};

export const handleDocumentPickSingle = async () => {
   try {
      const result = await DocumentPicker.pickSingle({
         type: documentAttachmentTypes,
         presentationStyle: 'fullScreen',
         copyTo: Platform.OS === 'android' ? 'documentDirectory' : 'cachesDirectory',
      });
      return result;
   } catch (error) {
      // updating the SDK flag back to false to behave as usual
      SDK.setShouldKeepConnectionWhenAppGoesBackground(false);
      mflog('Error in document picker pick single ', error);
   }
};

export const requestCameraPermission = async () => {
   switch (true) {
      case Platform.OS === 'ios':
         const ios_permit = await requestMultiple([PERMISSIONS.IOS.CAMERA]);
         return ios_permit['ios.permission.CAMERA'];
      case Platform.OS === 'android':
         const permited = await requestMultiple([PERMISSIONS.ANDROID.CAMERA]);
         return permited['android.permission.CAMERA'];
   }
};

export const requestCameraMicPermission = async () => {
   switch (true) {
      case Platform.OS === 'ios':
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
      case Platform.OS === 'android':
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
};

export const checkVideoPermission = async () => {
   return check(Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA);
};

export const requestStoragePermission = async () => {
   switch (true) {
      case Platform.OS === 'ios':
         const iosPermission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
         if (iosPermission === RESULTS.GRANTED || iosPermission === RESULTS.LIMITED) {
            return RESULTS.GRANTED;
         }
         break;
      case Platform.OS === 'android' && Platform.Version <= 32: // Android Version 32 and below
         return await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      default:
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
};

export const requestAudioStoragePermission = async () => {
   switch (true) {
      case Platform.OS === 'ios':
         return await request(PERMISSIONS.IOS.MEDIA_LIBRARY);
      case Platform.OS === 'android' && Platform.Version <= 32: // Android Vresion 32 and below
         return await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      default:
         const permited = await requestMultiple([PERMISSIONS.ANDROID.READ_MEDIA_AUDIO]); // Android Vresion 33 and above
         return permited['android.permission.READ_MEDIA_AUDIO'];
   }
};

export const requestFileStoragePermission = async () => {
   // Android Version 32 and below
   if (Platform.OS === 'android' && Platform.Version <= 32) {
      return await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
   } else {
      // returning granted as we don't need permission to access files in ios and Android version 13 or higher
      return Promise.resolve('granted');
   }
};

export const requestLocationPermission = async () => {
   return request(
      Platform.OS === 'android' ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
   );
};

export const requestMicroPhonePermission = async () => {
   return request(Platform.OS === 'android' ? PERMISSIONS.ANDROID.RECORD_AUDIO : PERMISSIONS.IOS.MICROPHONE);
};

export const requestBluetoothConnectPermission = () => {
   if (Platform.OS === 'android') {
      return request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
   } else {
      return Promise.resolve(false);
   }
};

export const checkMicroPhonePermission = async () => {
   return check(Platform.OS === 'android' ? PERMISSIONS.ANDROID.RECORD_AUDIO : PERMISSIONS.IOS.MICROPHONE);
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

export const requestNotificationPermission = async () => {
   return request(Platform.OS === 'android' && PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
};

export const requestIOS_NotificationPermission = () => {
   return messaging().requestPermission();
};

export const requestContactPermission = async () => {
   return request(Platform.OS === 'android' ? PERMISSIONS.ANDROID.READ_CONTACTS : PERMISSIONS.IOS.CONTACTS);
};

export const handleGalleryPickerMulti = async toast => {
   try {
      const res = await DocumentPicker.pick({
         type: [DocumentPicker.types.images, DocumentPicker.types.video],
         maxFiles: 5,
         presentationStyle: 'fullScreen',
         allowMultiSelection: true,
         copyTo: Platform.OS === 'android' ? 'documentDirectory' : 'cachesDirectory',
      });
      if (res.length > 5) {
         toast.show({
            ...toastConfig,
            render: () => {
               return (
                  <Box bg="black" px="2" py="1" rounded="sm">
                     <Text style={{ color: '#fff', padding: 5 }}>5 Images Only</Text>
                  </Box>
               );
            },
         });
         return res.slice(0, 5);
      } else {
         return res;
      }
   } catch (err) {
      if (DocumentPicker.isCancel(err)) {
         mflog('Image picker canceled.');
      } else {
         mflog('Error picking images:', err);
      }
   }
};

export const mediaObjContructor = (_package, file) => {
   let mediaObj = {
      extension: '',
      type: '',
      modificationTimestamp: Date.now(),
      uri: '',
      fileSize: 0,
      width: 0,
      height: 0,
      filename: '',
      duration: 0,
   };

   switch (_package) {
      case 'CAMERA_ROLL':
         const { image, type } = file;
         mediaObj.extension = getExtention(image.filename);
         mediaObj.uri = image.uri;
         mediaObj.fileSize = image.fileSize;
         mediaObj.type = type;
         mediaObj.width = image.width;
         mediaObj.height = image.height;
         mediaObj.duration = image.playableDuration * 1000;
         mediaObj.filename = image.filename;
         return mediaObj;
      case 'DOCUMENT_PICKER':
         mediaObj.extension = getExtention(file.name);
         mediaObj.uri = `${file.fileCopyUri}`;
         mediaObj.fileSize = file.size;
         mediaObj.type = file.type;
         mediaObj.filename = file.name;
         mediaObj.duration = file.duration * 1000 || 0;
         return mediaObj;
      case 'IMAGE_PICKER':
         mediaObj.extension = getExtention(file.path);
         mediaObj.uri = file.path;
         mediaObj.type = file.mime;
         mediaObj.fileSize = file.size;
         mediaObj.filename = file.path.split('/').pop();
         mediaObj.width = file.width;
         mediaObj.height = file.height;
         mediaObj.modificationTimestamp = file.modificationDate;
         return mediaObj;
      case 'RN_CAMERA':
         mediaObj.extension = getExtention(file.uri);
         mediaObj.uri = file.uri;
         mediaObj.fileSize = file.size;
         mediaObj.width = file.width;
         mediaObj.height = file.height;
         mediaObj.filename = file.uri.split('/').pop();
         mediaObj.duration = file.duration * 1000 || 0;
         mediaObj.type = file.type + '/' + mediaObj.extension;
         return mediaObj;
      default:
         break;
   }
};

export const getImageSource = image => {
   const isBase64 = typeof image === 'string' && image?.includes('data:image/');
   const uriBase = {
      uri: image,
   };
   return isBase64 ? uriBase : image;
};

export const permissioncheckRedmi = async () => {
   let isPackageExist = await ActivityModule.getInstalledPackages(PACKAGE_XIAOMI);
   const packageName = await ActivityModule.getPackageName();
   if (isPackageExist) {
      AsyncStorage.setItem('additional_permission', 'true');
      Alert.alert('', alertPermissionMessage, [
         {
            text: 'NOT NOW',
            style: 'cancel',
         },
         {
            text: 'TURN ON',
            onPress: () => {
               if (Platform.Version >= 23 && 'xiaomi' === Platform.constants.Manufacturer.toLowerCase())
                  Linking.sendIntent('miui.intent.action.APP_PERM_EDITOR', [
                     { key: 'packageName', value: PACKAGE_XIAOMI },
                     { key: 'className', value: PACKAGE_XIAOMI_WINDOW_COMPONENT },
                     { key: 'extra_pkgname', value: packageName },
                  ]);
            },
         },
      ]);
   }
};

export const checkAndRequestPermission = async () => {
   const checkAdditionalPermission = await AsyncStorage.getItem('additional_permission');
   const buildInfo = (Platform.OS === 'android' && Platform.constants.Brand.toLowerCase()) || '';
   if (!checkAdditionalPermission) {
      switch (buildInfo) {
         case BRAND_XIAOMI:
            permissioncheckRedmi();
            break;
         case BRAND_REDMI:
            permissioncheckRedmi();
            break;
         default:
            break;
      }
   }
};

export const handleLogOut = async () => {
   let { statusCode = '', message = '' } = await SDK.logout();
   if (statusCode === 200) {
      const getPrevUserIdentifier = await AsyncStorage.getItem('userIdentifier');
      AsyncStorage.setItem('prevUserIdentifier', getPrevUserIdentifier || '');
      AsyncStorage.setItem('credential', '');
      AsyncStorage.setItem('userIdentifier', '');
      AsyncStorage.setItem('screenObj', '');
      AsyncStorage.setItem('vCardProfile', '');
      endOngoingCallLogout();
      batch(() => {
         Store.dispatch(profileDetail({}));
         Store.dispatch(navigate({ screen: REGISTERSCREEN }));
         Store.dispatch(ResetStore());
      });
      RootNav.reset(REGISTERSCREEN);
   } else {
      showToast(message, { id: message });
   }
};
