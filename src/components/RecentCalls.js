import React from 'react'
import { Image } from 'react-native'
import { Center, Text } from 'native-base'


function RecentCalls() {
    return (
        <Center h='full'>
            <Image
                source={require('../assets/ic_no_call_history.webp')}
                style={{ width: 200, height: 200 }}
            />
            <Text fontWeight='900' fontSize="md">No call log history found</Text>
            <Text fontSize="md">Any new calls will appear here</Text>
        </Center>
    )
}

export default RecentCalls