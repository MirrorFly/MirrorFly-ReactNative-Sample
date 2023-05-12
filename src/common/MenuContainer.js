import React from 'react'
import { Menu } from 'react-native-paper';
import { ShapeIcon } from './Icons';

function MenuContainer(props) {
    const menuItems = React.useMemo(() => props.menuItems, []);

    const renderMenuItems = () => {
        return menuItems.map((item) => (
            <Menu.Item key={item.id} onPress={async () => {
                if (item.formatter)
                    await item?.formatter();
                props.toggleMenu()
            }} title={item.label} />
        ));
    };

    return (
        <Menu duration={0} visible={props.visible} onDismiss={props.toggleMenu} anchor={<ShapeIcon onPress={props.toggleMenu} />}>
            {renderMenuItems()}
        </Menu>
    )
}

export default MenuContainer