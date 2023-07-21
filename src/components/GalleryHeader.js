import React from 'react'
import { HStack, Icon, IconButton, Image, Menu, Text } from 'native-base';
import { LeftArrowIcon, SearchIcon, CloseIcon, CheckBox } from '../common/Icons';
import { Pressable, TextInput } from 'react-native';
import { MenuIconBtn } from '../common/Button';
import ApplicationColors from '../config/appColors';

function GalleryHeader(props) {
    const [position] = React.useState("auto");
    const { selectedImages = [], checkBox = false, setCheckbox } = props
    
    const handlingBackBtn = () => {
        props?.onhandleBack && props?.onhandleBack();
    }

    return (
        <>
            <HStack h={65} bg="#F2F2F2" pr="4" py="3" justifyContent="space-between" alignItems="center" w="full">
                <HStack alignItems="center">
                    {props?.onhandleBack && <IconButton _pressed={{ bg: "rgba(50,118,226, 0.1)" }} onPress={handlingBackBtn} icon={<Icon as={() => LeftArrowIcon()} name="emoji-happy" />} borderRadius="full" />}
                    <Text fontSize='xl' px="3" fontWeight={'600'}>{props?.title}</Text>
                </HStack>
                <HStack alignItems="center">
                    <Pressable onPress={() => {
                        setCheckbox(true)
                    }} >
                        {selectedImages.length > 0 ? 
                        <Text color={ApplicationColors.appThemeColor} fontWeight={"600"} >DONE</Text> : !checkBox && <CheckBox />
                        }
                    </Pressable>

                </HStack>
            </HStack>
        </>
    )
}

export default GalleryHeader