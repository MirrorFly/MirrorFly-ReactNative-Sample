import { Pressable, TextInput } from 'react-native'
import React from 'react'
import { Text, HStack, Stack, KeyboardAvoidingView, useToast } from 'native-base';
import ScreenHeader from '../components/ScreenHeader';
import { KeyboardIcon, SmileIcon } from '../common/Icons';
import { useNetworkStatus } from '../hooks';
import EmojiOverlay from './EmojiPicker';
import Graphemer from 'graphemer';

const EditStatusPage = (props) => {
    const splitter = new Graphemer();
    const isNetworkConnected = useNetworkStatus()
    const toast = useToast();
    const [isToastShowing, setIsToastShowing] = React.useState(false);
    const [statusContent, setStatusContent] = React.useState(props.profileInfo.status)
    const [content, setContent] = React.useState(props.profileInfo.status);
    const [total, setTotal] = React.useState(139 - props?.profileInfo?.status?.length || 139);
    const [isEmojiPickerShowing, setIsEmojiPickerShowing] = React.useState(false)

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

    React.useEffect(() => {
        count(statusContent)
    }, [statusContent])

    const count = (text) => {
        setTotal(139 - splitter.countGraphemes(text));
    }

    const handleInput = (text) => {
        setStatusContent(text)
        setContent(text)
        let count = Array.from(text).length
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

    const handleEmojiSelect = (...emojis) => {
        setStatusContent(prev => prev + emojis)
    };

    return (
        <>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScreenHeader title=' Add New Status' onhandleBack={handleBackBtn} />
                <HStack pb="2" pt="3" px="4" borderBottomColor={"#f2f2f2"} borderBottomWidth="1" alignItems={"center"}>
                    <TextInput
                        style={{
                            flex: 1,
                            fontSize: 15,
                            fontWeight: '400',
                            marginTop: 5,
                        }}
                        multiline={true}
                        value={statusContent}
                        onChangeText={(text) => { handleInput(text) }}
                        placeholderTextColor='#959595'
                        keyboardType='default'
                    />
                    <Text color={"black"} fontSize="15" fontWeight={"400"} px="4" >{total}</Text>
                    <Pressable style={{ width: 25 }} onPress={() => setIsEmojiPickerShowing(!isEmojiPickerShowing)} >
                        {!isEmojiPickerShowing ? <SmileIcon /> : <KeyboardIcon />}
                    </Pressable>
                </HStack>
                <Stack flex="1" >
                    <HStack position={"absolute"} pb="4" left={"0"} right={"0"} bottom="0" alignItems={"center"} justifyContent={"space-evenly"} borderTopColor={"#BFBFBF"} borderTopWidth="1"  >
                        <Pressable onPress={handleBackBtn}>
                            <Text color={"black"} fontSize="15" fontWeight={"400"} px="4">
                                Cancel
                            </Text>
                        </Pressable>
                        <Stack h="12" borderLeftWidth="1" borderColor='#BFBFBF' />
                        <Pressable onPress={handleStatus}>
                            <Text color={"black"} fontSize="15" fontWeight={"400"} px="8">
                                Ok
                            </Text>
                        </Pressable>
                    </HStack>
                </Stack>
                <EmojiOverlay
                    message={statusContent}
                    setMessage={setStatusContent}
                    onClose={() => setIsEmojiPickerShowing(false)}
                    visible={isEmojiPickerShowing}
                    handleEmojiSelect={handleEmojiSelect}
                />
            </KeyboardAvoidingView>
        </>
    )
}

export default EditStatusPage