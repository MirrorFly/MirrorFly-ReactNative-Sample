import React from 'react';
import { View } from 'react-native';
import RegisterScreen from './screen/RegisterScreen';
import { handleSDKInitialize } from './SDKActions/utils';

export const ChatApp = () => {

    React.useEffect(() => {
        (async () => {
            let initialize = await handleSDKInitialize();
            console.log(initialize, 'initialize')
        })();
        console.log('useEffect')
    }, [])

    return (
        <View>
            <RegisterScreen />
        </View>
    );
}
