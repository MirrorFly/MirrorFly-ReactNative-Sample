import React, { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import Register from './screen/Register';
import OTP from './screen/OTP';
import { handleSDKInitialize } from './SDKActions/utils';

export const ChatApp = () => {
    const [nav, setNav] = useState('Register')
    const [navCliked, setNavCliked] = useState(false)

    useEffect(() => {
        (async () => {
            let initialize = await handleSDKInitialize();
            console.log(initialize, 'initialize')
        })();
        console.log('useEffect')
    }, [])

    const handleClick = () => {
        if (navCliked) {
            setNav('Register')
            setNavCliked(false)
        } else {
            setNav('OTP')
            setNavCliked(true)
        }
    }

    return (
        <View>
            <Text>Hi</Text>
            <Button title='Press' onPress={handleClick} />
            {{
                'Register': <Register />,
                'OTP': <OTP />
            }[nav]}
        </View>
    );
}
