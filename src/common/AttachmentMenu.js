import PropTypes from 'prop-types';
import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { Menu } from 'react-native-material-menu';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import IconButton from './IconButton';
import Text from './Text';

const propTypes = {
   visible: PropTypes.bool,
   onRequestClose: PropTypes.func,
   attachmentMenuIcons: PropTypes.array,
   handleAttachmentIconPressed: PropTypes.func,
};

function AttachmentMenu({ visible, onRequestClose, attachmentMenuIcons, handleAttachmentIconPressed }) {
   const { width } = Dimensions.get('window');
   const menuWidth = width * 0.96;
   const themeColorPalatte = useThemeColorPalatte();
   const splitArrayIntoChunks = (array, chunkSize) => {
      const chunks = [];
      for (let i = 0; i < array.length; i += chunkSize) {
         chunks.push(array.slice(i, i + chunkSize));
      }
      return chunks;
   };

   const iconChunks = splitArrayIntoChunks(attachmentMenuIcons, 3);

   return (
      <>
         {visible && <View style={[styles.modalOverlay, commonStyles.bg_color(themeColorPalatte.modalOverlayBg)]} />}
         <Menu
            animationDuration={visible ? 200 : 0}
            style={[styles.bottomMenu, { width: menuWidth }]}
            onRequestClose={onRequestClose}
            visible={visible}>
            {iconChunks.map((chunk, index) => (
               <View key={`chunk${index + 1}`} style={styles.row}>
                  {chunk.map((item, idx) => {
                     const { name, icon: MenuIcon } = item;
                     return (
                        <View key={name} style={styles.attachmentMenuIcon}>
                           <IconButton onPress={handleAttachmentIconPressed(item)}>
                              <MenuIcon />
                           </IconButton>
                           <Text style={styles.attachmentNameText}>{name}</Text>
                        </View>
                     );
                  })}
               </View>
            ))}
         </Menu>
      </>
   );
}

const styles = StyleSheet.create({
   modalOverlay: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
   },
   bottomMenu: {
      flexDirection: 'column',
      backgroundColor: '#181818',
      alignItems: 'flex-end',
      paddingVertical: 10,
      ...Platform.select({
         ios: {
            top: Math.round(Dimensions.get('screen').height * 0.878),
         },
         android: {
            top: Math.round(Dimensions.get('screen').height * 0.835),
         },
      }),
   },
   row: {
      flexDirection: 'row',
      justifyContent: 'space-around',
   },
   attachmentMenuIcon: {
      alignItems: 'center',
      padding: 10,
   },
   attachmentNameText: {
      paddingTop: 5,
      color: '#fff',
   },
});

AttachmentMenu.propTypes = propTypes;

export default AttachmentMenu;
