import { Avatar, Box, Divider, HStack, Pressable, Slide, Spinner, Text, VStack } from 'native-base';
import React from 'react'
import Avathar from '../common/Avathar';
import { SwipeListView } from 'react-native-swipe-list-view';

export default function FlatListView(props) {
    const onRowDidOpen = rowKey => {
        console.log('This row opened', rowKey);
    };
    const renderItem = ({ item, index }) => {
        return <Box key={index}>
            <Pressable android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }} onPress={() => props?.onhandlePress(item)}
                _dark={{ bg: 'coolGray.800' }} _light={{ bg: 'white' }}>
                <Box pl="4" pr="5" py="2">
                    <HStack alignItems="center" space={3}>
                        {item?.avatarUrl
                            ? <Avatar size="48px" source={{ uri: item.avatarUrl }} />
                            : <Avathar data={item?.userId} />
                        }
                        <VStack>
                            <Text color="coolGray.800" _dark={{ color: 'warmGray.50' }} bold>{item.name || item.nickName}</Text>
                            <HStack alignItems={'center'}>
                                <Text color="coolGray.600" _dark={{ color: 'warmGray.200' }}>{item.userId}</Text>
                            </HStack>
                        </VStack>
                    </HStack>
                </Box>
            </Pressable>
            <Divider w={"83%"} alignSelf="flex-end" my="2" _light={{ bg: "#f2f2f2" }} _dark={{ bg: "muted.50" }} />
        </Box>
    };

    if (!props.data.length) {
        
    }

    return <Box bg="white" safeArea flex="1">
        <Slide mt="20" in={props.isLoading} placement="top">
            <HStack space={8} justifyContent="center" alignItems="center">
                <Spinner size="lg" />
            </HStack>
        </Slide>
        <SwipeListView
            onEndReached={props?.onhandlePagination}
            showsVerticalScrollIndicator={false}
            data={props.data}
            renderItem={renderItem}
            rightOpenValue={-130}
            previewRowKey={'0'}
            previewOpenValue={-40}
            previewOpenDelay={3000}
            onRowDidOpen={onRowDidOpen} />
    </Box>;
}
