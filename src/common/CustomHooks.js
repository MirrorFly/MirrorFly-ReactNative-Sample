import React from 'react'
import { Box, Text, useToast } from 'native-base';
import NetInfo from '@react-native-community/netinfo';

const useInternetConnectionToast = () => {
    const [isInternetToastShowing, setisInternetToastShowing] = React.useState(false);
    const toast = useToast();

    const checkInternetConnection = async () => {
        setisInternetToastShowing(true);
        const state = await NetInfo.fetch();
        if (!isInternetToastShowing)
            if (!state.isConnected) {
                toast.show({
                    duration: 2500,
                    avoidKeyboard: true,
                    onCloseComplete: () => {
                        setisInternetToastShowing(false);
                    },
                    render: () => (
                        <Box bg="black" px="2" py="1" rounded="sm">
                            <Text style={{ color: "#fff", padding: 5 }}>Please check your internet connectivity</Text>
                        </Box>
                    )
                });
                return state
            }else return state
    };

    return { isInternetToastShowing, checkInternetConnection };
};

export default useInternetConnectionToast;
