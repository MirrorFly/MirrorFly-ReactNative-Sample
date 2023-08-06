import React from 'react';
import { Box, Text, Toast } from 'native-base';

export const showToast = (
  options,
  message,
  clearPreviousToastWithId = true,
) => {
  if (options.id && clearPreviousToastWithId) {
    Toast.close(options.id);
  }
  Toast.show({
    ...options,
    render: () => {
      return (
        <Box bg="black" px="2" py="1" rounded="sm">
          <Text color={'#fff'} padding={5}>
            {message}
          </Text>
        </Box>
      );
    },
  });
};
