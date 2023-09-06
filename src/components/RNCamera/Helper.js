import { Platform } from 'react-native';

export const orientationCheck = orientation => {
  if (Platform.OS === 'ios') {
    return false;
  } else {
    return orientation === 1 || orientation === 2;
  }
};
