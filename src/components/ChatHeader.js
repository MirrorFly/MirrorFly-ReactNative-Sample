import { AlertDialog, HStack, Icon, IconButton, Pressable, Text, VStack, View } from 'native-base'
import React from 'react'
import Avathar from '../common/Avathar'
import MenuContainer from '../common/MenuContainer'
import { LeftArrowIcon } from '../common/Icons'
import MarqueeText from '../common/MarqueeText'
import { CloseIcon, DeleteIcon, FavouriteIcon, ForwardIcon, ReplyIcon } from '../common/Icons';
import { StyleSheet } from 'react-native'

function ChatHeader(props) {
    const marqueeRef = React.useRef(null);
    const [remove, setRemove] = React.useState(false);
    const [config] = React.useState({
        marqueeOnStart: true,
        speed: 0.3,
        loop: true,
        delay: 0,
        consecutive: false,
    })

    const onClose = () => {
        setRemove(false)
    }
    const handleDelete = () => {
        setRemove(!remove);
    }

    const handleDeleteForMe = () => {
        setRemove(false)
    };

    const handleRemove = () => {
        props.setSelectedMsgs([]);
    };

    const handleFavourite = () => {
        console.log("Fav item");
    }

    const handleReply = () => {
        props.handleReply(props?.selectedMsgs[0].msgId);
    }

    return (
        <>
            {props?.selectedMsgs.length <= 0
                ? <HStack h={'60px'} bg="#F2F2F2" justifyContent="space-between" alignItems="center" w="full">
                    <HStack alignItems="center">
                        <IconButton _pressed={{ bg: 'rgba(50,118,226, 0.1)' }} onPress={props.handleBackBtn} icon={<Icon as={() => LeftArrowIcon()} name="emoji-happy" />} borderRadius="full" />
                        <Avathar width={36} height={36} data={props.fromUser || '91'} />
                        <Pressable w="65%" >
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
                : <>
                    <View flexDirection={"row"} backgroundColor={"#F2F2F4"} alignItems={"center"} p="13" justifyContent={"space-between"}>
                        <View flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"} >
                            <IconButton _pressed={{ bg: "rgba(50,118,226, 0.1)" }} onPress={handleRemove}>
                                <CloseIcon />
                            </IconButton>
                            <Text px="8" textAlign={"center"} fontSize={"18"} fontWeight={"500"} >{props?.selectedMsgs?.length}</Text>
                        </View>
                        <View flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}  >
                            <IconButton _pressed={{ bg: "rgba(50,118,226, 0.1)" }} onPress={handleReply}>
                                {props?.selectedMsgs?.length == 1 && <ReplyIcon />}
                            </IconButton>
                            <IconButton _pressed={{ bg: "rgba(50,118,226, 0.1)" }} px="5" onPress={() => console.log("Forward icon pressed")}>
                                <ForwardIcon />
                            </IconButton>
                            <IconButton _pressed={{ bg: "rgba(50,118,226, 0.1)" }} px="3" onPress={handleFavourite}>
                                <FavouriteIcon />
                            </IconButton>
                            <IconButton _pressed={{ bg: "rgba(50,118,226, 0.1)" }} px="4" onPress={handleDelete} >
                                <DeleteIcon />
                            </IconButton>
                            {props?.selectedMsgs?.length == 1 && <MenuContainer menuItems={props.menuItems} />}
                        </View>
                    </View>
                </>

            }
            <AlertDialog isOpen={remove} onClose={onClose}>
                <AlertDialog.Content  width={'85%'} borderRadius={0}>
                    <AlertDialog.Body >
                        <Text fontSize={"15"} fontWeight={"400"}>Are you sure you want to delete selected Message ?</Text>
                        <HStack justifyContent={"flex-end"} py="3">
                            <Pressable mr='6' onPress={() => setRemove(false)} >
                                <Text color={"#3276E2"} fontWeight={"600"} >CANCEL</Text>
                            </Pressable>
                            <Pressable onPress={handleDeleteForMe}>
                                <Text color={"#3276E2"} fontWeight={"600"}  >DELETE FOR ME </Text>
                            </Pressable>
                        </HStack>
                    </AlertDialog.Body>
                </AlertDialog.Content>
            </AlertDialog>

        </>
    )
}

export default ChatHeader