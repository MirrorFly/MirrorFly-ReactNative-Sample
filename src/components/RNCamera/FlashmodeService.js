import { RNCamera } from 'react-native-camera';

class FlashModeService {
  getNewFlashMode = flashMode => {
    if (flashMode === RNCamera.Constants.FlashMode.off) {
      return RNCamera.Constants.FlashMode.torch;
    } else {
      return RNCamera.Constants.FlashMode.off;
    }
  };
}

export default FlashModeService;
