import React from 'react'
import { Box, HStack, Icon, IconButton, Image, Menu, StatusBar, Text } from 'native-base';
import { LeftArrowIcon, MenuIcon, SearchIcon } from '../common/Icons';
import { TextInput, View } from 'react-native';
import { CloseIcon } from '../common/Icons';

function ScreenHeader(props) {
    const [position, setPosition] = React.useState("auto");
    const [isSearching, setIsSearching] = React.useState(false)

    return (
        <>
            <StatusBar bg="#F2F2F2" barStyle="light-content" />
            <Box safeAreaTop bg="#F2F2F2" />
            <HStack h={60} bg="#F2F2F2" px="4" py="3" justifyContent="space-between" alignItems="center" w="full">
                <HStack alignItems="center">
                    {props.onhandleBack && <IconButton onPress={props.onhandleBack} icon={<Icon as={LeftArrowIcon} name="emoji-happy" />} borderRadius="full" />}
                    {isSearching
                        && <TextInput
                            style={{ flex: 0.7, color: 'black' }}
                            onChangeText={props.onhandleSearch}
                            placeholder='Search...'
                            selectionColor={'blue'}
                            autoFocus={true}
                        />}
                    {props.logo && !isSearching && <Image key='sm' size='xs' width={145} height={20.8} source={props.logo} alt="ic_logo.png" />}
                    {props.title && !isSearching && <Text fontSize={24} fontWeight={'bold'}>{props.title}</Text>}
                </HStack>
                <HStack alignItems="center">
                    {isSearching
                        ? <IconButton onPress={() => { setIsSearching(false) }} icon={<Icon as={CloseIcon} name="emoji-happy" />} borderRadius="full" />
                        : <IconButton onPress={() => { setIsSearching(true) }} icon={<Icon as={SearchIcon} name="emoji-happy" />} borderRadius="full" />
                    }
                    {props.menuItems && <Menu w="160" shouldOverlapWithTrigger={true}
                        placement={position == "auto" ? undefined : position} trigger={triggerProps => {
                            return <IconButton {...triggerProps} icon={<Icon as={MenuIcon} name="emoji-happy" />} borderRadius="full" />;
                        }}>
                        {props.menuItems.map((item, index) => (
                            <Menu.Item key={index} onPress={item?.formatter}>{item.label}</Menu.Item>
                        ))}
                    </Menu>}
                </HStack>
            </HStack >
        </>
    )
}

export default ScreenHeader