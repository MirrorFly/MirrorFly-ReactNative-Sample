import DocumentPicker from 'react-native-document-picker';
import { Box, Text } from 'native-base';
import {
  request,
  PERMISSIONS,
  requestMultiple
} from 'react-native-permissions';
import { Platform } from 'react-native';

const toastConfig = {
  duration: 2500,
  avoidKeyboard: true,
};

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
      copyTo:
        Platform.OS === 'android' ? 'documentDirectory' : 'cachesDirectory',
    });
    if (res) {
      return res;
    }
  } catch (error) {
    console.log(error);
  }
};

export const handleAudioPickerSingle = async () => {
  try {
    const res = await DocumentPicker.pickSingle({
      type: [DocumentPicker.types.audio],
      presentationStyle: 'fullScreen',
      copyTo:
        Platform.OS === 'android' ? 'documentDirectory' : 'cachesDirectory',
    });
    if (res) {
      return res;
    }
  } catch (error) {
    console.log(error);
  }
};

export const requestCameraPermission = async () => {
  switch (true) {
    case Platform.OS === 'ios':
      const ios_permit = await requestMultiple([
        PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.MICROPHONE,
      ]);
      return (
        ios_permit['ios.permission.CAMERA'] ||
        ios_permit['ios.permission.MICROPHONE']
      );
    case Platform.OS === 'android':
      const permited = await requestMultiple([
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
      ]);
      return (
        permited['android.permission.CAMERA'] ||
        permited['android.permission.RECORD_AUDIO']
      );
  }
};

export const requestStoragePermission = async () => {
  console.log(Platform.Version, 'Platform.Version UI');
  switch (true) {
    case Platform.OS === 'ios':
      return await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    case Platform.OS === 'android' && Platform.Version <= 32: // Android Vresion 32 and below
      return await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    default:
      const permited = await requestMultiple([
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
      ]); // Android Vresion 33 and above
      return (
        permited['android.permission.READ_MEDIA_IMAGES'] ||
        permited['android.permission.READ_MEDIA_VIDEO']
      );
  }
};

export const requestAudioStoragePermission = async () => {
  switch (true) {
    case Platform.OS === 'ios':
      return await request(PERMISSIONS.IOS.MEDIA_LIBRARY);
    case Platform.OS === 'android' && Platform.Version <= 32: // Android Vresion 32 and below
      return await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    default:
      const permited = await requestMultiple([
        PERMISSIONS.ANDROID.READ_MEDIA_AUDIO,
      ]); // Android Vresion 33 and above
      return permited['android.permission.READ_MEDIA_AUDIO'];
  }
};

export const handleGalleryPickerMulti = async toast => {
  try {
    const res = await DocumentPicker.pick({
      type: [DocumentPicker.types.images, DocumentPicker.types.video],
      maxFiles: 5,
      presentationStyle: 'fullScreen',
      allowMultiSelection: true,
      copyTo:
        Platform.OS === 'android' ? 'documentDirectory' : 'cachesDirectory',
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
      console.log('Image picker canceled.');
    } else {
      console.log('Error picking images:', err);
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
      mediaObj.duration = image.playableDuration;
      mediaObj.filename = image.filename;
      return mediaObj;
    case 'DOCUMENT_PICKER':
      mediaObj.extension = getExtention(file.name);
      mediaObj.uri = `${file.fileCopyUri}`;
      mediaObj.fileSize = file.size;
      mediaObj.type = file.type;
      mediaObj.filename = file.name;
      mediaObj.duration = file.duration || 0;
      return mediaObj;
    case 'IMAGE_PICKER':
      return mediaObj;
    case 'RN_CAMERA':
      mediaObj.extension = getExtention(file.uri);
      mediaObj.uri = file.uri;
      mediaObj.fileSize = file.size;
      mediaObj.width = file.width;
      mediaObj.height = file.height;
      mediaObj.filename = file.uri.split('/').pop();
      mediaObj.duration = file.duration || 0;
      mediaObj.type = file.type + '/' + mediaObj.extension;
      return mediaObj;
    default:
      break;
  }
};
