import React from 'react'
import { HStack, Icon, IconButton, Image, Menu, Text } from 'native-base';
import { LeftArrowIcon, SearchIcon, CloseIcon } from '../common/Icons';
import { TextInput } from 'react-native';
import { MenuIconBtn } from '../common/Button';

function ScreenHeader(props) {
    const [position] = React.useState("auto");
    const [isSearching, setIsSearching] = React.useState(false)
    const [text, setText] = React.useState('');

    const handlingBackBtn = () => {
        setText('');
        setIsSearching(false);
        if (!props?.onCloseSearch && isSearching) {
            return setIsSearching(false)
        }
        props?.onCloseSearch && props?.onCloseSearch();
        props?.onhandleBack && props?.onhandleBack();
    }

    const handleClearBtn = () => {
        setText('')
        props.handleClear && props.handleClear()
    }

    return (
        <>
            <HStack h={65} bg="#F2F2F2" pr="4" py="3" justifyContent="space-between" alignItems="center" w="full">
                <HStack alignItems="center">
                    {props?.onhandleBack && <IconButton _pressed={{ bg: "rgba(50,118,226, 0.1)" }} onPress={handlingBackBtn} icon={<Icon as={()=>LeftArrowIcon()} name="emoji-happy" />} borderRadius="full" />}
                    {props?.isSearching && <IconButton _pressed={{ bg: 'rgba(50,118,226, 0.1)' }} onPress={handlingBackBtn} icon={<Icon as={()=>LeftArrowIcon()} name="emoji-happy" />} borderRadius="full" />}
                    {isSearching
                        && <TextInput
                            placeholderTextColor="#d3d3d3"
                            value={text}
                            style={{ flex: 0.7, color: 'black', fontSize: 16 }}
                            onChangeText={(e) => { setText(e); props?.onhandleSearch(e) }}
                            placeholder='Search...'
                            selectionColor={'#3276E2'}
                            autoFocus={true}
                        />}
                    {props?.logo && !isSearching && <Image ml='3' key='sm' size='xs' width={145} height={20.8} source={props?.logo} alt="ic_logo.png" />}
                    {props?.title && !isSearching && <Text fontSize='xl' px="3" fontWeight={'600'}>{props?.title}</Text>}
                    
                </HStack>
                <HStack alignItems="center">
                    {text && <IconButton onPress={handleClearBtn} icon={<Icon as={CloseIcon} name="emoji-happy" />} borderRadius="full" />}
                    {props?.onhandleSearch && !isSearching && <IconButton _pressed={{ bg: "rgba(50,118,226, 0.1)" }} onPress={() => { setIsSearching(true); props?.setIsSearching && props?.setIsSearching(true); }} icon={<Icon as={SearchIcon} name="emoji-happy" />} borderRadius="full" />}
                    {!isSearching && props?.menuItems && <Menu w="160" shouldOverlapWithTrigger={true}
                        placement={position == "auto" ? undefined : position}
                        trigger={triggerProps => MenuIconBtn(triggerProps)}
                    >
                        {props?.menuItems.map((item) => (
                            <Menu.Item key={item.label} onPress={item?.formatter}>{item.label}</Menu.Item>
                        ))}
                    </Menu>}
                </HStack>
            </HStack>
        </>
    )
}

export default ScreenHeader