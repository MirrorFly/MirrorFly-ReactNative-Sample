import { IconButton, Text, View } from 'native-base';
import React from 'react';
import { CloseIcon, DeleteIcon } from '../common/Icons';

const RecentHeader = ({ recentItem, handleRemove, handleDeleteChat }) => {
  const handleDelete = () => {
    handleDeleteChat();
  };

  const handleRemoveClose = () => {
    handleRemove();
  };

  return (
    <>
      <View
        flexDirection={'row'}
        backgroundColor={'#F2F2F4'}
        alignItems={'center'}
        p="13"
        justifyContent={'space-between'}>
        <View
          flexDirection={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}>
          <IconButton
            _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
            onPress={handleRemoveClose}>
            <CloseIcon />
          </IconButton>
          <Text
            px="3"
            color={'#000000'}
            textAlign={'center'}
            fontSize={'18'}
            fontWeight={'400'}>
            {recentItem?.length}
          </Text>
        </View>
        <View
          flexDirection={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}>
          <IconButton
            _pressed={{ bg: 'rgba(50,118,226, 0.1)' }}
            px="4"
            onPress={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </View>
      </View>
    </>
  );
};

export default RecentHeader;
