import React, { createRef } from 'react';
import { Box, Text, Toast } from 'native-base';
import { Alert, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { Image as ImageCompressor } from 'react-native-compressor';
import { createThumbnail } from 'react-native-create-thumbnail';

const toastLocalRef = createRef({});
toastLocalRef.current = {};

const toastConfig = {
  duration: 2500,
  avoidKeyboard: true,
};

/**
 * showToast
 * @param {String} message
 * @param {Object} options
 * @example ('Toast Message', {id:'toast-id'})
 */
export const showToast = (message, options, ignoreDuplicateToast = true) => {
  const id = options?.id || Date.now();
  if (options.id && ignoreDuplicateToast && toastLocalRef.current[options.id]) {
    return;
  }

  toastLocalRef.current[id] = true;

  options.onCloseComplete = () => {
    delete toastLocalRef.current[id];
  };

  Toast.show({
    ...toastConfig,
    ...options,
    render: () => {
      return (
        <Box bg="black" px="2" py="1" rounded="sm">
          <Text color={'#fff'} padding={2}>
            {message}
          </Text>
        </Box>
      );
    },
  });
};

export const showAlert = (message, title) => {
  Alert.alert(title, message);
};

export const convertBytesToKB = bytes => {
  if (bytes < 1024) {
    // If the size is less than 1KB, return bytes only
    return bytes + ' bytes';
  } else if (bytes < 1024 * 1024) {
    // If the size is less than 1MB, return in KB
    const KB = bytes / 1024;
    return KB.toFixed(2) + ' KB';
  } else {
    // If the size is 1MB or more, return in MB
    const MB = bytes / (1024 * 1024);
    return MB.toFixed(2) + ' MB';
  }
};

/**
 * Helper function to generate thumbnail for image
 * @param {string} uri - local path if the image
 * @returns {Promise<string>} returns the base64 data of the Thumbnail Image
 */
export const getThumbImage = async uri => {
  const result = await ImageCompressor.compress(uri, {
    maxWidth: 200,
    maxHeight: 200,
    quality: 0.8,
  });
  const response = await RNFS.readFile(result, 'base64');
  return response;
};

/**
 * Helpler function to generate thumbnail for video
 * @param {string} uri local file path of the video
 * @returns {Promise<string>} returns the base64 data of the Thumbnail Image
 */
export const getVideoThumbImage = async uri => {
  let response;
  if (Platform.OS === 'ios') {
    if (uri.includes('ph://')) {
      let result = await ImageCompressor.compress(uri, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.8,
      });
      response = await RNFS.readFile(result, 'base64');
    } else {
      const frame = await createThumbnail({
        url: uri,
        timeStamp: 10000,
      });
      response = await RNFS.readFile(frame.path, 'base64');
    }
  } else {
    const frame = await createThumbnail({
      url: uri,
      timeStamp: 10000,
    });
    console.log(frame, 'frame');
    response = await RNFS.readFile(frame.path, 'base64');
  }
  return response;
};

export const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};
