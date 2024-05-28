import React from 'react';
import { Dimensions, StyleSheet, Text, View, Platform } from 'react-native';
import { Menu } from 'react-native-material-menu';
import PropTypes from 'prop-types';
import ApplicationColors from '../config/appColors';
import IconButton from './IconButton';

const propTypes = {
   visible: PropTypes.bool,
   onRequestClose: PropTypes.func,
   attachmentMenuIcons: PropTypes.array,
   handleAttachmentIconPressed: PropTypes.func,
};

const defaultProps = {
   visible: false,
   onRequestClose: () => {},
   attachmentMenuIcons: [],
};

function AttachmentMenu({ visible, onRequestClose, attachmentMenuIcons, handleAttachmentIconPressed }) {
   const { width } = Dimensions.get('window');
   const menuWidth = width * 0.96;

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
         {visible && <View style={styles.modalOverlay} />}
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
      backgroundColor: ApplicationColors.modalOverlayBg,
   },
   bottomMenu: {
      flexDirection: 'column',
      backgroundColor: '#181818',
      alignItems: 'flex-end',
      paddingVertical: 10,
      ...Platform.select({
         ios: {
            top: Dimensions.get('screen').height - 80,
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
AttachmentMenu.defaultProps = defaultProps;

export default AttachmentMenu;
