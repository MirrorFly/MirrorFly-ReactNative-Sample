import React, { useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { FloatingBtn } from '../common/Button';
import { navigate } from '../redux/navigationSlice';
import { CONTACTLIST } from '../constant';
import { getRecentChat } from '../redux/chatSlice';
import RecentChatItem from '../model/RecentChatItem';

const RecentChatScreen = () => {
    const dispatch = useDispatch();
    const recentChatList = useSelector(state => state.chat.recentChat)
    const messages = useSelector(state => state.chat.chatMessages)
    console.log(recentChatList)
    useEffect(() => {
        (async () => {
            dispatch(getRecentChat());
        })();
    }, [messages])

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={styles.chatHeader}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={require('../assets/mirrorfly-logo.png')}
                        style={{ width: 145, height: 45.8 }}
                    />
                </View>
            </View>
            <FlatList
                data={recentChatList}
                keyExtractor={item => item.msgId}
                renderItem={({ item }) => {
                    return <RecentChatItem RecentItem={item} />
                }}
            />
            <FloatingBtn onPress={() => dispatch(navigate({ screen: CONTACTLIST }))} />
        </View>
    );
};

const styles = StyleSheet.create({
    chatHeader: {
        backgroundColor: '#F2F2F2',
        height: 80,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15
    },
    avatarContainer: {
        marginStart: 16.97,
        display: 'flex',
        flexDirection: 'row',
    },
    avatar: {
        width: 36.37,
        height: 36.37,
        borderRadius: 50,
        backgroundColor: 'black',
    },
});

export default RecentChatScreen;