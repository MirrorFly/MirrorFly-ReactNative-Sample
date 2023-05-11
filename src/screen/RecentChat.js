import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux';

function RecentChat() {
    const recentChats = useSelector(state => state.chat.recentChat)
    console.log(recentChats, 'recentChats')
    return (
        <View>
            <View style={styles.screenHeadContainer}>
                <View>
                    <Text style={styles.screenHeader}>Chat</Text>
                </View>
                <View style={styles.headIconContainer}>
                    <Text>O</Text>
                    <Text>M</Text>
                </View>
                {/* <AttachmentIcon /> */}
            </View>
            {recentChats.length == 0 ?
                <>

                </>
                :
                <>
                </>
            }
            <Text>RecentChat</Text>
        </View>
    )
}

export default RecentChat

const styles = StyleSheet.create({
    screenHeadContainer: {
        backgroundColor: '#F2F2F2',
        height: 79,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    screenHeader: {
        fontSize: 20,
        fontWeight: '900',
        color: '#181818'
    }
})