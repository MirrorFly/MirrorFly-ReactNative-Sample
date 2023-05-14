import { Avatar, Box, Divider, HStack, Pressable, Spacer, Text, VStack } from 'native-base';
import React from 'react'
import { SwipeListView } from 'react-native-swipe-list-view';
import { useDispatch } from 'react-redux';
import { getConversationHistoryTime } from '../common/TimeStamp';
import Avathar from '../common/Avathar';
import { CHATSCREEN } from '../constant';
import { SDK } from '../SDK';
import { navigate } from '../redux/navigationSlice';

export default function RecentChat(props) {
    const dispatch = useDispatch()
    const [listData, setListData] = React.useState(props.data);

    const closeRow = (rowMap, rowKey) => {
        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
        }
    };

    const deleteRow = (rowMap, rowKey) => {
        closeRow(rowMap, rowKey);
        const newData = [...listData];
        const prevIndex = listData.findIndex(item => item.key === rowKey);
        newData.splice(prevIndex, 1);
        setListData(newData);
    };

    const onRowDidOpen = rowKey => {
        console.log('This row opened', rowKey);
    };

    const renderItem = ({ item, index }) => <Box key={index}>
        <Pressable android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }} onPress={async () => {
            let jid = await SDK.getJid(item?.fromUserId)
            if (jid.statusCode == 200) {
                let x = { screen: CHATSCREEN, fromUserJID: jid.userJid }
                dispatch(navigate(x));
            }
            let x = { screen: CHATSCREEN, }
        }} _dark={{ bg: 'coolGray.800' }} _light={{ bg: 'white' }}>
            <Box pl="4" pr="5" py="2">
                <HStack alignItems="center" space={3}>
                    {item.avatarUrl
                        ? <Avatar size="48px" source={{ uri: item.avatarUrl }} />
                        : <Avathar data={item?.fromUserId} />
                    }
                    <VStack>
                        <Text color="coolGray.800" _dark={{ color: 'warmGray.50' }} bold>{item.fromUserId}</Text>
                        <Text color="coolGray.600" _dark={{ color: 'warmGray.200' }}>{item.msgBody.message}</Text>
                    </VStack>
                    <Spacer />
                    <Text fontSize="xs" color="coolGray.800" _dark={{ color: 'warmGray.50' }} alignSelf="flex-start">
                        {getConversationHistoryTime(item?.createdAt)}
                    </Text>
                </HStack>
            </Box>
        </Pressable>
        <Divider w={"83%"} alignSelf="flex-end" />
    </Box>;

    const renderHiddenItem = (data, rowMap) => <HStack flex="1" pl="2">
        <Pressable w="70" ml="auto" cursor="pointer" bg="coolGray.200" justifyContent="center" onPress={() => closeRow(rowMap, data.item.key)} _pressed={{
            opacity: 0.5
        }}>
            <VStack alignItems="center" space={2}>
                {/* <Icon as={<Entypo name="dots-three-horizontal" />} size="xs" color="coolGray.800" /> */}
                <Text fontSize="xs" fontWeight="medium" color="coolGray.800">
                    More
                </Text>
            </VStack>
        </Pressable>
        <Pressable w="70" cursor="pointer" bg="red.500" justifyContent="center" onPress={() => deleteRow(rowMap, data.item.key)} _pressed={{
            opacity: 0.5
        }}>
            <VStack alignItems="center" space={2}>
                {/* <Icon as={<MaterialIcons name="delete" />} color="white" size="xs" /> */}
                <Text color="white" fontSize="xs" fontWeight="medium">
                    Delete
                </Text>
            </VStack>
        </Pressable>
    </HStack>;

    return <Box bg="white" safeArea flex="1">
        <SwipeListView showsVerticalScrollIndicator={false} data={listData} renderItem={renderItem} rightOpenValue={-130} previewRowKey={'0'} previewOpenValue={-40} previewOpenDelay={3000} onRowDidOpen={onRowDidOpen} />
    </Box>;
}