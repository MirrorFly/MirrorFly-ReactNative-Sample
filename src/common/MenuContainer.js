import React from 'react';
import { Dimensions, Keyboard, Platform, StyleSheet, Text } from 'react-native';
import { Menu, MenuItem } from 'react-native-material-menu';
import ApplicationColors from '../config/appColors';
import { MenuIconBtn } from './Button';

function MenuContainer({ menuItems, color, menuStyle }) {
   const [visible, setVisible] = React.useState(false);

   const showMenu = () => {
      Keyboard.dismiss();
      setVisible(true);
   };

   const hideMenu = () => {
      setVisible(false);
   };

   const defaultMenuStyle = React.useMemo(() => {
      return Platform.OS === 'android' ? styles.topRightMenu : undefined;
   }, []);

   return (
      <Menu
         animationDuration={200}
         anchor={MenuIconBtn({}, color, showMenu)}
         style={menuStyle || defaultMenuStyle}
         onRequestClose={hideMenu}
         visible={visible}>
         {menuItems?.map(item => {
            const handleMenuItemPress = () => {
               hideMenu();
               setTimeout(() => {
                  item?.formatter?.();
               }, 300);
            };
            return item.label ? (
               <MenuItem key={item.label} onPress={handleMenuItemPress}>
                  <Text style={styles.menuItem}>{item.label}</Text>
               </MenuItem>
            ) : null;
         })}
      </Menu>
   );
}

const styles = StyleSheet.create({
   topRightMenu: {
      position: 'absolute',
      top: 10,
      left: Dimensions.get('screen').width - 5,
   },
   menuItem: {
      color: ApplicationColors.black,
   },
});

export default MenuContainer;
