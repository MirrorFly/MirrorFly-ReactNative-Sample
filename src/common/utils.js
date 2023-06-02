import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import { Box, Text } from "native-base";
import RNFetchBlob from 'rn-fetch-blob';
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
  if (Platform.OS == 'ios') {
    request(PERMISSIONS.IOS.CAMERA).then((result) => {
      console.log(result)
    });
  } else {
    request(PERMISSIONS.ANDROID.CAMERA).then((result) => {
      console.log(result)
    });
  }
};

export const requestStoragePermission = async () => {
  if (Platform.OS == 'ios') {
    return await request(PERMISSIONS.IOS.PHOTO_LIBRARY)
  } else {
    return await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES)
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

export const downloadImageAsBase64 = async (fileUrl, token) => {
  // Main function to download the image

  // To add the time suffix in filename
  let date = new Date();
  // Image URL which we want to download 
  let image_URL = fileUrl;
  // Getting the extention of the file
  let ext = getExtention(image_URL);
  ext = ext[0];
  const { config, fs } = RNFetchBlob;
  const { DownloadDir } = fs.dirs;
  let options = {
    fileCache: true,
    appendExt: ext,
    // addAndroidDownloads: {
    //     useDownloadManager: true, // true will use native manager and be shown on notification bar.
    //     notification: true,
    //     path: `${DownloadDir}/san_${Math.floor(date.getTime() + date.getSeconds() / 2)}.${ext}`,
    //     title : 'Great ! Download Success ! :O ',
    //     description: 'Downloading.',
    // }
  };

  return await RNFetchBlob.config(options)
    .fetch('GET', image_URL, {
      Authorization: token
    }).progress((received, total) => {
    }).then(resp => {
      const base64 = resp.readFile('base64');
      resp.flush();
      return base64;
    }).then(base64 => {
      const imageBase64 = `data:image/png;base64,${base64}`
      return imageBase64
    }).catch((err) => {
      console.log('catch --- ', err);
    })
};

const downloadImageToPath = async (fileUrl, token) => {
  // Main function to download the image

  // To add the time suffix in filename
  let date = new Date();
  // Image URL which we want to download
  // let image_URL = 'https://sample-videos.com/img/Sample-jpg-image-50kb.jpg';    
  let image_URL = fileUrl;
  // Getting the extention of the file
  let ext = getExtention(image_URL);
  ext = ext[0];
  const { config, fs } = RNFetchBlob;
  const { DownloadDir, SDCardApplicationDir } = fs.dirs;
  let options = {
    fileCache: true,
    appendExt: ext,
    path: `${SDCardApplicationDir}/image_${Math.floor(date.getTime() + date.getSeconds() / 2)}.${ext}`
  };
  try {
    const response = await RNFetchBlob.config(options).fetch('GET', image_URL, {
      Authorization: token
    }).progress((received, total) => {
    });
    const base64 = await response.readFile('base64');
    response.flush();

    const imageBase64 = `data:image/png;base64,${base64}`;
    return imageBase64;
  } catch (err) {
    console.log('catch --- ', err);
    throw err;
  }
};

export const getMediaURL = async (fileToken, saveToPath = false) => {
  try {
    let imageUrl = await SDK.getMediaURL(fileToken)
    let imageBase64 = await downloadImageAsBase64(imageUrl.data.fileUrl, imageUrl.data.token);
    return imageBase64
  } catch (error) {
    console.log(error)
  }
};