import DocumentPicker from 'react-native-document-picker';
import { Box, Text } from "native-base";
import { request, PERMISSIONS } from 'react-native-permissions';
import { Platform } from 'react-native';

const toastConfig = {
  duration: 2500,
  avoidKeyboard: true
}

export const getExtention = filename => {
  // To get the file extension
  return /[.]/.exec(filename) ?
      /[^.]+$/.exec(filename) : undefined;
};

export const handleGalleryPickerSingle = async () => {
  try {
    const res = await DocumentPicker.pickSingle({
      type: [DocumentPicker.types.images],
      presentationStyle: 'fullScreen',
      copyTo: Platform.OS === 'android' ? 'documentDirectory' : 'cachesDirectory',
    });
    if (res) {
      return res
    }
  } catch (error) {
    console.log(error)
  }
}

export const requestCameraPermission = async () => {
  switch (true) {
    case Platform.OS == 'ios':
      return await request(PERMISSIONS.IOS.PHOTO_LIBRARY)
    case Platform.OS === 'android' && Platform.Version <= 32: // Android Vresion below 29
      return await request(PERMISSIONS.ANDROID.CAMERA)
    default:
      return await request(PERMISSIONS.ANDROID.CAMERA)// Android Vresion 30 and above
  }
};

export const requestStoragePermission = async () => {
  switch (true) {
    case Platform.OS == 'ios':
      return await request(PERMISSIONS.IOS.PHOTO_LIBRARY)
    case Platform.OS === 'android' && Platform.Version <= 32: // Android Vresion 32 and below
      return await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
    default:
      return await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES)// Android Vresion 33 and above
  }
};

export const handleGalleryPickerMulti = async (toast) => {
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
      console.log('Image picker canceled.');
    } else {
      console.log('Error picking images:', err);
    }
  }
};