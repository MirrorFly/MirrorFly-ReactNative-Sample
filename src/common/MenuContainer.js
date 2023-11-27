import { Menu } from 'native-base';
import React from 'react';
import { MenuIconBtn } from './Button';

function MenuContainer(props) {
  const [position] = React.useState('auto');
  return (
    <>
      <Menu
        w="160"
        shouldOverlapWithTrigger={true}
        placement={position == 'auto' ? undefined : position}
        trigger={triggerProps => MenuIconBtn(triggerProps)}>
        {props?.menuItems?.map(item =>
          item.label ? (
            <Menu.Item key={item.label} onPress={item?.formatter}>
              {item.label}
            </Menu.Item>
          ) : null,
        )}
      </Menu>
    </>
  );
}

export default MenuContainer;
