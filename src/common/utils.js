import { PermissionsAndroid, Platform } from "react-native";
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import GallerPermissionModal from "./GallerPermissionModal";
import { Box, Text } from "native-base";

const toastConfig = {
  duration: 2500,
  avoidKeyboard: true
}

export const dataURLtoFile = (dataurl, filename) => {
  var dataarr = dataurl.split(','), mime = dataarr[0].match(/:(.*?);/)[1],
    bstr = atob(dataarr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  //NOSONAR
  while (n--) {
    const charbuffer = bstr.charCodeAt(n);
    u8arr[n] = charbuffer;
  }
  let blob = new Blob([u8arr], { type: mime });
  blob['lastModifiedDate'] = new Date();
  blob['name'] = filename;
  return blob;
}

export function base64ToBlob(base64String) {
  const byteCharacters = atob(base64String);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: 'image/jpeg', lastModified: new Date() }); // Adjust the MIME type accordingly
  return blob;
}

export const convertToFileType = async (filePath) => {
  try {
    const normalizedPath = Platform.OS === 'android' ? filePath.replace('file://', '') : filePath;
    const fileData = await RNFS.readFile(normalizedPath, 'base64');
    const file = new File([fileData], 'image.jpg', { type: 'image/jpeg' });
    return file; // The converted File object
  } catch (error) {
    console.log(error);
  }
};

export const handleGalleryPickerSingle = () => {
  DocumentPicker.pickSingle({}).then(async res => {
    console.log('Files Picked', res);
    if (res) {
      return res
    }
  })
}


export const requestCameraPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'App needs camera access to capture photos.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Camera permission granted');
    } else {
      console.log('Camera permission denied');
    }
  } catch (error) {
    console.warn('Failed to request camera permission:', error);
  }
};

export const requestStoragePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'App needs access to your device storage to pick images.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Storage permission granted');
    } else {
      return <GallerPermissionModal />
      console.log('Storage permission denied');
    }
  } catch (error) {
    console.warn('Failed to request storage permission:', error);
  }
};

export const handleGalleryPickerMulti = async (toast) => {
  try {
    const res = await DocumentPicker.pick({
      type: [DocumentPicker.types.images,DocumentPicker.types.video],
      maxFiles: 5,
      presentationStyle: 'fullScreen',
      allowMultiSelection: true,
      copyTo: Platform.OS === 'android' ? 'documentDirectory' : 'cachesDirectory',
    });

    console.log('Files Picked', res);
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
      return res.slice(0,5);
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
