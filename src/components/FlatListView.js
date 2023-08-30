import {
  Avatar,
  Box,
  Divider,
  HStack,
  Pressable,
  Slide,
  Spinner,
  Text,
  VStack,
} from 'native-base';
import React from 'react';
import Avathar from '../common/Avathar';
import { SwipeListView } from 'react-native-swipe-list-view';
import useRosterData from '../hooks/useRosterData';

const RenderItem = ({ item, index, onhandlePress }) => {
  const {
    nickName = item.nickName,
    image: imageToken = '',
    colorCode,
  } = useRosterData(item?.userId);

  const handlePress = () => onhandlePress(item);

  return (
    <Box key={index}>
      <Pressable
        android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
        onPress={handlePress}
        _dark={{ bg: 'coolGray.800' }}
        _light={{ bg: 'white' }}>
        <Box pl="4" pr="5" py="2">
          <HStack alignItems="center" space={3}>
            <Avathar
              data={item?.userId}
              profileImage={imageToken}
              backgroundColor={colorCode}
            />
            <VStack>
              <Text color="coolGray.800" _dark={{ color: 'warmGray.50' }} bold>
                {nickName}
              </Text>
              <HStack alignItems={'center'}>
                <Text color="coolGray.600" _dark={{ color: 'warmGray.200' }}>
                  {item.userId}
                </Text>
              </HStack>
            </VStack>
          </HStack>
        </Box>
      </Pressable>
      <Divider
        w={'83%'}
        alignSelf="flex-end"
        my="2"
        _light={{ bg: '#f2f2f2' }}
        _dark={{ bg: 'muted.50' }}
      />
    </Box>
  );
};

export default function FlatListView(props) {
  const onRowDidOpen = rowKey => {
    console.log('This row opened', rowKey);
  };

  const renderItem = ({ item, index }) => (
    <RenderItem item={item} index={index} onhandlePress={props.onhandlePress} />
  );

  const renderLoaderIfFetching = () => {
    if (props.isLoading) {
      return (
        <Slide mt="20" in={props.isLoading} placement="top">
          <HStack space={8} justifyContent="center" alignItems="center">
            <Spinner size="lg" color={'#3276E2'} />
          </HStack>
        </Slide>
      );
    }
  };

  return (
    <>
      {renderLoaderIfFetching()}
      <Box bg="white" flex="1">
        <SwipeListView
          onEndReached={props?.onhandlePagination}
          showsVerticalScrollIndicator={false}
          data={props.data || []}
          renderItem={renderItem}
          rightOpenValue={-130}
          previewRowKey={'0'}
          previewOpenValue={-40}
          previewOpenDelay={3000}
          onRowDidOpen={onRowDidOpen}
        />
      </Box>
    </>
  );
}
