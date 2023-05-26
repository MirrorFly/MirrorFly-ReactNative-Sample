import { Platform } from "react-native";
import RNFS from 'react-native-fs';

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
  
    const blob = new Blob(byteArrays, { type: 'image/jpeg',lastModified:new Date() }); // Adjust the MIME type accordingly
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