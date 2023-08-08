import React from 'react';
import { Box, Text, Toast } from 'native-base';
import { Alert } from 'react-native';

const toastConfig = { duration: 2500, avoidKeyboard: true };

/**
 * showToast
 * @param {String} message
 * @param {Object} options
 * @example ('Toast Message', {id:'toast-id'})
 */
export const showToast = (
  message,
  options,
  clearPreviousToastWithId = true
) => {
  if (options.id && clearPreviousToastWithId) {
    Toast.close(options.id);
  }
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
