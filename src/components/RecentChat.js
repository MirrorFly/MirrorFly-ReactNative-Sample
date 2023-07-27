import { Center, Box, Divider, HStack, Pressable, Spacer, Text, VStack, View, Slide, Spinner, Icon } from 'native-base';
import React from 'react'
import * as RootNav from '../Navigation/rootNavigation'
import { SwipeListView } from 'react-native-swipe-list-view';
import { useDispatch, useSelector } from 'react-redux';
import { convertUTCTOLocalTimeStamp, formatChatDateTime } from '../common/TimeStamp';
import Avathar from '../common/Avathar';
import { CHATSCREEN, RECENTCHATLOADING } from '../constant';
import { navigate } from '../redux/navigationSlice';
import { Image, StyleSheet } from 'react-native';
import { formatUserIdToJid } from '../Helper/Chat/ChatHelper';
import SDK from '../SDK/SDK';
import { SandTimer, VideoSmallIcon, imageIcon } from '../common/Icons';

export default function RecentChat(props) {
    const dispatch = useDispatch();
    const recentLoading = useSelector(state => state.chat.recentChatStatus)

    const onRowDidOpen = rowKey => {
        console.log('This row opened', rowKey);
    };
    const currentUserJID = useSelector(state => state.auth.currentUserJID)

    const renderItem = ({ item, index }) => {
        const isSame = currentUserJID.split('@')[0] === item?.publisherId;
        let statusVisible
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
            <Pressable py='2' android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }} onPress={async () => {
                let jid = formatUserIdToJid(item?.fromUserId, item?.chatType)
                SDK.activeChatUser(jid)
                let x = { screen: CHATSCREEN, fromUserJID: item?.userJid || jid, profileDetails: item?.profileDetails }
                dispatch(navigate(x));
                RootNav.navigate(CHATSCREEN)
            }} _dark={{ bg: 'coolGray.800' }} _light={{ bg: 'white' }}>
                <Box pl="4" pr="5" py="2">
                    <HStack alignItems="center" space={3}>
                        {/* {item?.profileDetails?.image ?
                            <RecentChatProfile data={{
                                image: item?.profileDetails?.image,
                                nickName: item?.profileDetails?.nickName,
                                backgroundColor: item?.profileDetails?.colorCode
                            }} />
                        } */}
                        <Avathar data={item?.profileDetails?.nickName || item?.fromUserId} backgroundColor={item?.profileDetails?.colorCode} />
                        <VStack w='60%'>
                            <Text numberOfLines={1} color="coolGray.800" _dark={{ color: 'warmGray.50' }} ellipsizeMode="tail" bold>{item?.profileDetails?.nickName || item?.fromUserId}</Text>
                            <HStack alignItems={'center'}>
                                {isSame &&
                                    item?.msgStatus !== 3
                                    ? <View style={[styles.msgStatus, isSame ? statusVisible : ""]}></View>
                                    : (isSame && item?.msgStatus == 3 && <Icon px='3' as={SandTimer} name="emoji-happy" />)}
                                {{
                                    'text': <Text numberOfLines={1} ellipsizeMode="tail" px={isSame ? 1 : 0} color="#767676" _dark={{ color: '#767676' }}>{item?.msgBody?.message}</Text>,
                                    'image':
                                        <HStack pl='1' alignItems={'center'}>
                                            <Icon as={imageIcon} />
                                            <Text numberOfLines={1} ellipsizeMode="tail" px={isSame ? 1 : 0} color="#767676" _dark={{ color: '#767676' }}>Image</Text>
                                        </HStack>,
                                    'video':
                                        <HStack pl='1' alignItems={'center'}>
                                            <Icon as={() => VideoSmallIcon('#767676')} />
                                            <Text numberOfLines={1} ellipsizeMode="tail" px={isSame ? 1 : 0} color="#767676" _dark={{ color: '#767676' }}>Video</Text>
                                        </HStack>
                                }[item.msgBody.message_type]}
                            </HStack>
                        </VStack>
                        <Spacer />
                        <Text fontSize="xs" color="coolGray.800" _dark={{ color: 'warmGray.50' }} alignSelf="flex-start">
                            {item?.createdAt && formatChatDateTime(convertUTCTOLocalTimeStamp(item?.createdAt), "recent-chat")}
                        </Text>
                    </HStack>
                </Box>
            </Pressable >
            <Divider w="80%" alignSelf="flex-end" _light={{ bg: "#f2f2f2" }} _dark={{ bg: "muted.50" }} />
        </Box >
    };
    if (!props?.data?.length) {
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

    if (recentLoading === RECENTCHATLOADING) {
        return <Slide mt="20" in={recentLoading === RECENTCHATLOADING} placement="top">
            <HStack space={8} justifyContent="center" alignItems="center">
                <Spinner size="lg" color={'#3276E2'} />
            </HStack>
        </Slide>
    }

    return <SwipeListView showsVerticalScrollIndicator={false} data={props.data} renderItem={renderItem} rightOpenValue={-130} previewRowKey={'0'} previewOpenValue={-40} previewOpenDelay={3000} onRowDidOpen={onRowDidOpen} />
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