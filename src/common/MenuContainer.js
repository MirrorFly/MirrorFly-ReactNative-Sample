import { Icon, IconButton, Menu } from 'native-base';
import React from 'react'
import { MenuIcon } from './Icons';

function MenuContainer(props) {
    const [position] = React.useState("auto");

    return (
        <>
            <Menu w="160" shouldOverlapWithTrigger={true}
                placement={position == "auto" ? undefined : position} trigger={triggerProps => {
                    return <IconButton _pressed={{ bg: "rgba(50,118,226, 0.1)" }} mr='3' {...triggerProps} icon={<Icon px='3' as={<MenuIcon />} name="emoji-happy" />} borderRadius="full" />;
                }}>
                {props?.menuItems?.map((item) => (
                    <Menu.Item key={item.label} onPress={item?.formatter}>{item.label}</Menu.Item>
                ))}
            </Menu>
        </>
    )
}

export default MenuContainer