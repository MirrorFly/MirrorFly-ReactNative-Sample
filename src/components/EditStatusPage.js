import { TouchableOpacity } from 'react-native'
import React from 'react'
import { Text, HStack, Stack, Input, KeyboardAvoidingView, useToast, Box } from 'native-base';
import ScreenHeader from '../components/ScreenHeader';
import { SmileIcon } from '../common/Icons';
import { spaceReplaceRegex } from '../constant';
import SDK from '../SDK/SDK';
import { useNetworkStatus } from '../hooks';

const EditStatusPage = (props) => {
    const isNetworkConnected = useNetworkStatus()
    const toast = useToast();
    const [isToastShowing, setIsToastShowing] = React.useState(false);
    const [content, setContent] = React.useState(props.profileInfo.status);
    const [total, setTotal] = React.useState(139 - props?.profileInfo?.status?.length || 139);
    const toastConfig = {
        duration: 2500,
        avoidKeyboard: true,
        onCloseComplete: () => {
            setIsToastShowing(false)
        }
    }
    const handleBackBtn = () => {
        props.setNav("statusPage");
    }

    const handleInput = (text) => {
        const trimmedValue = text;
        setContent(trimmedValue)
        const count = trimmedValue.length;
        setTotal(139 - count);
        props.onChangeEvent();
    }

    const handleStatus = async () => {
        setIsToastShowing(true)
        if (!isNetworkConnected && !isToastShowing) {
            return toast.show({
                ...toastConfig,
                render: () => {
                    return <Box bg="black" px="2" py="1" rounded="sm" >
                        <Text style={{ color: "#fff", padding: 5 }}>Please check your internet connectivity</Text>
                    </Box>;
                }
            })
        }
        if (isNetworkConnected) {
            props.onChangeEvent();
            props.setProfileInfo({
                ...props.profileInfo,
                status: content.trim()
            });
            props.setNav("statusPage");
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScreenHeader title=' Add New Status' onhandleBack={handleBackBtn} />
            <HStack pb="2" pt="3" px="4" borderBottomColor={"#f2f2f2"} borderBottomWidth="1" alignItems={"center"} >
                <Input
                    autoFocus={true}
                    multiline={true}
                    variant="unstyled"
                    fontSize="15"
                    fontWeight="400"
                    color="black"
                    flex="1"
                    defaultValue={props.profileInfo.status}
                    onChangeText={(text) => { handleInput(text) }}
                    selectionColor={'#3276E2'}
                    maxLength={139}
                    keyboardType="default"
                    numberOfLines={1}
                />
                <Text color={"black"} fontSize="15" fontWeight={"400"} px="4" >{total}</Text>
                <TouchableOpacity>
                    <SmileIcon />
                </TouchableOpacity>
            </HStack>
            <Stack flex="1" >
                <HStack position={"absolute"} pb="4" left={"0"} right={"0"} bottom="0" alignItems={"center"} justifyContent={"space-evenly"} borderTopColor={"#BFBFBF"} borderTopWidth="1"  >
                    <TouchableOpacity onPress={handleBackBtn}>
                        <Text color={"black"} fontSize="15" fontWeight={"400"} px="4">
                            Cancel
                        </Text>
                    </TouchableOpacity>
                    <Stack h="12" borderLeftWidth="1" borderColor='#BFBFBF' />
                    <TouchableOpacity onPress={handleStatus}>
                        <Text color={"black"} fontSize="15" fontWeight={"400"} px="8">
                            Ok
                        </Text>
                    </TouchableOpacity>
                </HStack>
            </Stack>
        </KeyboardAvoidingView>
    )
}

export default EditStatusPage