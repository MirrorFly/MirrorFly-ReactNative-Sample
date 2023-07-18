import { Divider, HStack, Text, View } from 'native-base'
import React from 'react'
import ScreenHeader from './ScreenHeader'
import { BackHandler, StyleSheet } from 'react-native'
import { change16TimeWithDateFormat, getConversationHistoryTime } from '../common/TimeStamp'
import { useSelector } from 'react-redux'

function MessageInfo(props) {
    const messages = useSelector(state => state.chatConversationData.data)
    const [deliveredReport, setDeliveredReport] = React.useState()
    const [seenReport, setSeenReport] = React.useState()
    const handleBackBtn = () => {
        props.setLocalNav('CHATCONVERSATION')
        return true;
    }

    const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackBtn
    );

    React.useEffect(() => {
        return () => {
            backHandler.remove();
        }
    }, [])

    React.useEffect(() => {
        (async () => {
            const dbValue = await SDK.getMessageInfo(props.isMessageInfo.msgId)
            setDeliveredReport(dbValue[0].receivedTime)
            setSeenReport(dbValue[0].seenTime)
            /**
            let deliveryStatus = await AsyncStorage.getItem('deliveryStatus')
             let seenStatus = await AsyncStorage.getItem('seenStatus')
             let parsedSeenData = JSON.parse(seenStatus)
             if (deliveryStatus) {
                 let parsedDeliveredData = JSON.parse(deliveryStatus)
                 let foundDeliveredReport = parsedDeliveredData?.filter(item => item.msgId == props.isMessageInfo.msgId && item.msgStatus == 1)
                 if (foundDeliveredReport) {
                     props.setIsMessageInfo({
                         ...props.isMessageInfo,
                         msgStatus:foundDeliveredReport[0]?.msgStatus
                     })
                     setDeliveredReport(foundDeliveredReport[0])
                 }
             }
             if (seenStatus) {
                 let foundSeenReport = parsedSeenData?.filter(item => (item.msgId == props.isMessageInfo.msgId && item.msgStatus == 2))
                 if (foundSeenReport.length) {
                     props.setIsMessageInfo({
                         ...props.isMessageInfo,
                         msgStatus:foundSeenReport[0]?.msgStatus
                     })
                     setSeenReport(foundSeenReport[0]);
                 }
             }
             */
        })();
    }, [messages])

    let statusVisible
    switch (props?.isMessageInfo?.msgStatus) {
        case 3:
            statusVisible = styles.notSent
            break;
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

    return (
        <View>
            <ScreenHeader onhandleBack={handleBackBtn} title="Message Info" />
            <HStack mt='5' alignSelf={'flex-end'} my='1' px='3'>
                <View px='2' py='1.5' minWidth='30%' maxWidth='90%' bgColor={'#E2E8F7'}
                    borderWidth={0}
                    borderRadius={10}
                    borderBottomRightRadius={0}
                    borderColor='#959595'>
                    {{
                        "text": <Text fontSize={14} color='#313131'>{props?.isMessageInfo?.msgBody?.message}</Text>,
                        "image": <Text fontWeight={'600'} fontStyle={'italic'} fontSize={14} color='#313131'>image</Text>,
                        "video": <Text fontWeight={'600'} fontStyle={'italic'} fontSize={14} color='#313131'>video</Text>,
                        "audio": <Text fontWeight={'600'} fontStyle={'italic'} fontSize={14} color='#313131'>audio</Text>,
                    }[props?.isMessageInfo?.msgBody?.message_type]}
                    <HStack alignItems='center' alignSelf='flex-end'>
                        <View style={[styles?.msgStatus, statusVisible]}></View>
                        <Text pl='1' color='#959595' fontSize='11'>{getConversationHistoryTime(props?.isMessageInfo?.createdAt)}</Text>
                    </HStack>
                </View>
            </HStack>
            <Divider my='5' />
            <View px='5'>
                <Text fontWeight={'600'} fontSize={'lg'}>Delivered</Text>
                <Text color={'#959595'}>{deliveredReport ? change16TimeWithDateFormat(deliveredReport) : 'Message sent, not delivered yet'}</Text>
                <Divider my='5' />
                <Text fontWeight={'600'} fontSize={'lg'}>Read</Text>
                <Text color={'#959595'}>{seenReport ? change16TimeWithDateFormat(seenReport) : 'Your message is not read'}</Text>
                <Divider my='5' />
            </View>
        </View>
    )
}

export default MessageInfo

const styles = StyleSheet.create({
    msgStatus: {
        marginStart: 15,
        width: 6,
        height: 6,
        borderRadius: 3,
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
});