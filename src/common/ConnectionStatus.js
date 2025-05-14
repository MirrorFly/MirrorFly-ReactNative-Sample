import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useXmppConnectionStatus } from '../redux/reduxHook';
import { CONNECTED, DISCONNECTED } from '../SDK/constants';

function ConnectionStatus() {
    const connectionStatus = useXmppConnectionStatus();
    const backgroundColor = connectionStatus === CONNECTED ? 'green' : connectionStatus === DISCONNECTED ? 'red' : 'orange';
    return <View style={[styles.container, { backgroundColor }]} />;
}

export default ConnectionStatus;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 5,
        top: 5,
        width: 6,
        height: 6,
        borderRadius: 3,
        zIndex: 999,
    },
});
