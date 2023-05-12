import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Avathar from '../common/Avathar'
import { useDispatch } from 'react-redux'
import SDK from '../SDK/SDK'
import { getConversationHistoryTime } from '../common/TimeStamp'
import { navigate } from '../redux/navigationSlice'
import { CHATSCREEN } from '../constant'

function RecentChatItem(props) {
    const dispatch = useDispatch()
    const handleRecentChatItem = async () => {
        let jid = await SDK.getJid(props?.RecentItem?.fromUserId)
        if (jid.statusCode == 200) {
            let x = { screen: CHATSCREEN, fromUserJId: jid.userJid }
            dispatch(navigate(x));
        }
    }
    return (
        <TouchableOpacity onPress={handleRecentChatItem}>
            <View style={styles.mainDiv}>
                <View style={styles.userDiv}>
                    <Avathar data={props?.RecentItem?.fromUserId} />
                    <View>
                        <Text style={styles.userName}>
                            {props?.RecentItem?.fromUserId}{"\n"}
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' style={styles.message}>
                            {props?.RecentItem?.msgBody.message}
                        </Text>
                    </View>
                </View>
                <View>
                    <Text>{getConversationHistoryTime(props?.RecentItem?.createdAt)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    mainDiv: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        margin: 18,
    },
    userDiv: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    userName: {
        marginLeft: 10,
        fontSize: 14,
        color: "black",
        fontWeight: "600"
    },
    message: {
        marginTop: -12,
        marginLeft: 10,
        fontSize: 12,
        color: "black",
    }
});

export default RecentChatItem