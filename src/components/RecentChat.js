import { Center, Avatar, Box, Divider, HStack, Pressable, Spacer, Text, VStack, View } from 'native-base';
import React from 'react'
import { SwipeListView } from 'react-native-swipe-list-view';
import { useDispatch, useSelector } from 'react-redux';
import { getConversationHistoryTime } from '../common/TimeStamp';
import Avathar from '../common/Avathar';
import { CHATSCREEN } from '../constant';
import { SDK } from '../SDK';
import { navigate } from '../redux/navigationSlice';
import { Image, StyleSheet } from 'react-native';

export default function RecentChat(props) {
    const dispatch = useDispatch();
    const onRowDidOpen = rowKey => {
        console.log('This row opened', rowKey);
    };
    const currentUserJID = useSelector(state => state?.auth?.currentUserJID.split('@')[0])
    const renderItem = ({ item, index }) => {
        const isSame = currentUserJID === item?.publisherId
        switch (item?.msgStatus) {
            case 0:
                statusVisible = styles.notDelivered
                break;
            case 1:
                statusVisible = styles.delivered
                break;
            case 2:
                statusVisible = styles.seen
                break;
        }
        return <Box key={index}>
            <Pressable android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }} onPress={async () => {
                let jid = await SDK.getJid(item?.fromUserId)
                if (jid.statusCode == 200) {
                    let x = { screen: CHATSCREEN, fromUserJID: jid.userJid }
                    dispatch(navigate(x));
                }
            }} _dark={{ bg: 'coolGray.800' }} _light={{ bg: 'white' }}>
                <Box pl="4" pr="5" py="2">
                    <HStack alignItems="center" space={3}>
                        {item.avatarUrl
                            ? <Avatar size="48px" source={{ uri: item.avatarUrl }} />
                            : <Avathar data={item?.fromUserId} />
                        }
                        <VStack>
                            <Text color="coolGray.800" _dark={{ color: 'warmGray.50' }} bold>{item?.fromUserId}</Text>
                            <HStack w='65%' alignItems={'center'}>
                                {isSame && <View style={[styles.msgStatus, isSame ? statusVisible : ""]}></View>}
                                <Text numberOfLines={1} ellipsizeMode="tail"  px={isSame ? 1 : 0} color="coolGray.600" _dark={{ color: 'warmGray.200' }}>{item?.msgBody?.message}</Text>
                            </HStack>
                        </VStack>
                        <Spacer />
                        <Text fontSize="xs" color="coolGray.800" _dark={{ color: 'warmGray.50' }} alignSelf="flex-start">
                            {getConversationHistoryTime(item?.createdAt)}
                        </Text>
                    </HStack>
                </Box>
            </Pressable>
            <Divider w={"83%"} alignSelf="flex-end" my="2" _light={{ bg: "#f2f2f2" }} _dark={{ bg: "muted.50" }} />
        </Box>
    };
    if (!props.data.length) {
        return <Center h='full'>
            <Image style={styles.image} resizeMode="cover" source={require('../assets/no_messages.png')} />
            {props.isSearching
                ? <Text style={styles.noMsg}>No Chats Found</Text>
                : <>
                    <Text style={styles.noMsg}>No New Messages</Text>
                    <Text>Any new messages will appear here</Text>
                </>
            }
        </Center>
    }

    return <Box bg="white" safeArea flex="1">
        <SwipeListView showsVerticalScrollIndicator={false} data={props.data} renderItem={renderItem} rightOpenValue={-130} previewRowKey={'0'} previewOpenValue={-40} previewOpenDelay={3000} onRowDidOpen={onRowDidOpen} />
    </Box>;
}

const styles = StyleSheet.create({
    msgStatus: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    bgClr: {
        backgroundColor: 'red'
    },
    notDelivered: {
        backgroundColor: '#818181'
    },
    delivered: {
        backgroundColor: '#FFA500'
    },
    seen: {
        backgroundColor: '#66E824'
    },
    imageView: {
        flex: 0.72,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: 200,
        height: 200,
    },
    noMsg: {
        color: '#181818',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 8
    }
});