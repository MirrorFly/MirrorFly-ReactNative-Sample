import React from 'react';
import { Box, Text, Toast } from 'native-base';
import { Alert } from 'react-native';

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
export const showToast = (
  message,
  options,
  clearPreviousToastWithId = true,
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
          <Text color={'#fff'} p={'2'}>
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
