import React from 'react';
import { Dimensions, I18nManager, Keyboard, Platform, StyleSheet } from 'react-native';
import { Menu, MenuItem } from 'react-native-material-menu';
import { useThemeColorPalatte } from '../redux/reduxHook';
import { MenuIconBtn } from './Button';
import Text from './Text';
import PropTypes from 'prop-types';

function MenuContainer({ menuItems, color, menuStyle }) {
   const [visible, setVisible] = React.useState(false);
   const themeColorPalatte = useThemeColorPalatte();
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
         anchor={<MenuIconBtn onPress={showMenu} color={themeColorPalatte.iconColor} />}
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
                  <Text style={{ color: themeColorPalatte.black }}>{item.label}</Text>
               </MenuItem>
            ) : null;
         })}
      </Menu>
   );
}

MenuContainer.propTypes = {
   menuItems: PropTypes.arrayOf(
      PropTypes.shape({
         label: PropTypes.string,
         formatter: PropTypes.func,
      }),
   ),
   color: PropTypes.string,
   menuStyle: PropTypes.object,
};

const styles = StyleSheet.create({
   topRightMenu: {
      position: 'absolute',
      top: 10,
      [I18nManager.isRTL ? 'right' : 'left']: I18nManager.isRTL ? 5 : Dimensions.get('screen').width - 5,
   },
});

export default MenuContainer;
