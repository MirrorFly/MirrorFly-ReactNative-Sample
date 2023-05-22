import { Box, HStack, Icon, IconButton, Pressable, Text, VStack } from 'native-base'
import React from 'react'
import Avathar from '../common/Avathar'
import MenuContainer from '../common/MenuContainer'
import { LeftArrowIcon } from '../common/Icons'

function ChatHeader(props) {
    const menuItems = [
        {
            label: 'Message Info',
            formatter: () => {
                dispatch(navigate({ screen: SETTINGSCREEN }))
            }
        }
    ]
    return (
        <>
            <Box safeAreaTop bg="#f2f2f2" />
            <HStack h={'60px'} bg="#F2F2F2" justifyContent="space-between" alignItems="center" w="full">
                <HStack alignItems="center">
                    <IconButton _pressed={{ bg: 'rgba(50,118,226, 0.1)' }} onPress={props.handleBackBtn} icon={<Icon as={LeftArrowIcon} name="emoji-happy" />} borderRadius="full" />
                    <Avathar width={36} height={36} data={'91'} />
                    <Pressable maxW="96">
                        {({ isPressed }) => {
                            return <VStack pr='4' py="3" bg={isPressed ? 'rgba(0,0,0, 0.1)' : "coolGray.100"} pl='2'>
                                <Text color='#181818' fontWeight='700' fontSize='14'>{props.fromUser}</Text>
                                {props.seenStatus && <Text color='#959595' fontWeight='700' fontSize='10'>{props.seenStatus}</Text>}
                            </VStack>
                        }}
                    </Pressable>
                </HStack>
                <HStack alignItems="center">
                    <MenuContainer menuItems={menuItems} />
                </HStack>
            </HStack>
        </>
    )
}

export default ChatHeader