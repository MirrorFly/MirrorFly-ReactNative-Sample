import { StyleSheet, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Text, useToast, HStack, Stack, Input, KeyboardAvoidingView } from 'native-base';
import ScreenHeader from '../components/ScreenHeader';
import { SmileIcon } from '../common/Icons';

const EditStatusPage = (props) => {
    const [content, setContent] = React.useState(props.profileInfo.status);
    const [total, setTotal] = React.useState(139 - props?.profileInfo?.status?.length || 139);
    const handleBackBtn = () => {
        props.setNav("statusPage");
    }

    const handleInput = (text) => {
        const trimmedValue = text?.replace(/^\s+/, '');
        setContent(trimmedValue)
        const count = trimmedValue.length;
        setTotal(139 - count);
        props.onChangeEvent();
    }

    const handleStatus = () => {
        props.onChangeEvent();
        props.setProfileInfo({
            ...props.profileInfo,
            status: content
        });
        props.setNav("statusPage");
    }

    const handleInputFocus = () => {
        setContent(!content && "");
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <ScreenHeader title=' Add New Status' onhandleBack={handleBackBtn} />
            <HStack pb="2" pt="3" px="4" borderBottomColor={"#f2f2f2"} borderBottomWidth="1" alignItems={"center"} >
                <Input
                    value={content}
                    multiline={true}
                    variant="unstyled"
                    fontSize="15"
                    fontWeight="400"
                    color="black"
                    flex="1"
                    defaultValue={props.profileInfo.status}
                    onChangeText={(text) => { handleInput(text) }}
                    onFocus={handleInputFocus}
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
            {content && <Stack flex="1" >
                <HStack position={"absolute"} pb="4" left={"0"} right={"0"} bottom="0" alignItems={"center"} justifyContent={"space-evenly"} borderTopColor={"#BFBFBF"} borderTopWidth="1"  >
                    <TouchableOpacity >
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
            </Stack>}
        </KeyboardAvoidingView>
    )
}

export default EditStatusPage

const styles = StyleSheet.create({})


