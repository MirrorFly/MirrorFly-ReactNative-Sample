import React from 'react'
import { Menu } from 'react-native-paper';
import { ShapeIcon } from './Icons';

function MenuContainer(props) {
    const menuItems = React.useMemo(() => [
        { id: '1', label: 'Menu Item 1' },
        { id: '2', label: 'Menu Item 2' },
        { id: '3', label: 'Menu Item 3' },
        { id: '4', label: 'Menu Item 4' },
        { id: '5', label: 'Menu Item 5' },
    ], []);

    const renderMenuItems = () => {
        return menuItems.map((item) => (
            <Menu.Item key={item.id} onPress={props.toggleMenu} title={item.label} />
        ));
    };

    return (
        <Menu duration={0} visible={props.visible} onDismiss={props.toggleMenu} anchor={<ShapeIcon onPress={props.toggleMenu} />}>
            {renderMenuItems()}
        </Menu>
    )
}

export default MenuContainer