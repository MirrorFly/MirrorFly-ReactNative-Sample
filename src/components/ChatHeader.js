import { Box, HStack, Icon, IconButton, Pressable, Text, VStack, View } from 'native-base'
import React from 'react'
import Avathar from '../common/Avathar'
import MenuContainer from '../common/MenuContainer'
import { LeftArrowIcon } from '../common/Icons'
import MarqueeText from '../common/MarqueeText'

function ChatHeader(props) {
    const marqueeRef = React.useRef(null);
    const [config, setConfig] = React.useState({
        marqueeOnStart: true,
        speed: 0.3,
        loop: true,
        delay: 0,
        consecutive: false,
    })

    return (
        <>
            <HStack h={'60px'} bg="#F2F2F2" justifyContent="space-between" alignItems="center" w="full">
                <HStack alignItems="center">
                    <IconButton _pressed={{ bg: 'rgba(50,118,226, 0.1)' }} onPress={props.handleBackBtn} icon={<Icon as={LeftArrowIcon} name="emoji-happy" />} borderRadius="full" />
                    <Avathar width={36} height={36} data={props.fromUser || '91'} />
                    <Pressable w="65%">
                        {({ isPressed }) => {
                            return <VStack pr='4' py="3" bg={isPressed ? 'rgba(0,0,0, 0.1)' : "coolGray.100"} pl='2'>
                                <Text color='#181818' fontWeight='700' fontSize='14'>{props.fromUser}</Text>
                                {props.seenStatus &&
                                    <MarqueeText key={JSON.stringify(config)} ref={marqueeRef} {...config}>
                                        {props.seenStatus}
                                    </MarqueeText>
                                }
                            </VStack>
                        }}
                    </Pressable>
                </HStack>
                <HStack alignItems="center">
                    {props.selectedMsgs.length < 2 && <MenuContainer menuItems={props.menuItems} />}
                </HStack>
            </HStack>
        </>
    )
}

export default ChatHeader