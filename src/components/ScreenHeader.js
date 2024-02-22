import React from 'react';
import { LeftArrowIcon, SearchIcon, CloseIcon } from '../common/Icons';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { getImageSource } from '../common/utils';
import ApplicationColors from '../config/appColors';
import commonStyles from '../common/commonStyles';
import IconButton from '../common/IconButton';
import MenuContainer from '../common/MenuContainer';

const LeftArrowComponent = () => LeftArrowIcon();

function ScreenHeader(props) {
   const { onCreateBtn, isGroupInfoSrn } = props;
   const [position] = React.useState('auto');
   const [isSearching, setIsSearching] = React.useState(false);
   const [text, setText] = React.useState('');

   React.useEffect(() => {
      setIsSearching(props.isSearching);
      if (!props.isSearching) {
         setText('');
      }
   }, [props.isSearching]);

   const handlingBackBtn = () => {
      setText('');
      setIsSearching(false);
      props?.onhandleSearch?.('');
      if (!props?.onCloseSearch && isSearching) {
         return setIsSearching(false);
      }
      props?.onCloseSearch && props?.onCloseSearch();
      props?.onhandleBack && props?.onhandleBack();
   };

   const handleClearBtn = () => {
      setText('');
      props.handleClear && props.handleClear();
   };

   const handleSearchPress = () => {
      setIsSearching(true);
      props?.setIsSearching && props?.setIsSearching(true);
   };

   return (
      <>
         <View style={styles.container}>
            <View style={[commonStyles.hstack, commonStyles.alignItemsCenter, commonStyles.flex1]}>
               {props?.onhandleBack && (
                  <IconButton onPress={handlingBackBtn}>
                     <LeftArrowComponent />
                  </IconButton>
               )}
               {props?.isSearching && (
                  <IconButton style={commonStyles.marginRight_12} onPress={handlingBackBtn}>
                     <LeftArrowComponent />
                  </IconButton>
               )}
               {isSearching && (
                  <TextInput
                     placeholderTextColor="#d3d3d3"
                     value={text}
                     style={styles.textInput}
                     onChangeText={e => {
                        setText(e);
                        props?.onhandleSearch(e);
                     }}
                     placeholder=" Search..."
                     cursorColor={ApplicationColors.mainColor}
                     autoFocus={true}
                  />
               )}
               {props?.logo && !isSearching && (
                  <Image style={styles.logoImage} source={getImageSource(props?.logo)} alt="ic_logo.png" />
               )}
               {props?.title && !isSearching && <Text style={styles.titleText}>{props?.title}</Text>}
            </View>
            <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
               {text && (
                  <IconButton onPress={handleClearBtn}>
                     <CloseIcon />
                  </IconButton>
               )}
               {props?.onhandleSearch && !isSearching && (
                  <IconButton onPress={handleSearchPress}>
                     <SearchIcon />
                  </IconButton>
               )}
               {props.title === 'Add Participants' && (
                  <IconButton onPress={onCreateBtn}>
                     <Text style={styles.subText}>{isGroupInfoSrn ? 'NEXT' : 'CREATE'}</Text>
                  </IconButton>
               )}
               {!isSearching && props?.menuItems && <MenuContainer menuItems={props?.menuItems} />}
            </View>
         </View>
      </>
   );
}

export default ScreenHeader;

const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      height: 65,
      backgroundColor: ApplicationColors.headerBg,
      paddingRight: 16,
      paddingVertical: 12,
   },
   logoImage: {
      marginLeft: 12,
      width: 145,
      height: 20.8,
   },
   titleText: {
      fontSize: 18,
      paddingHorizontal: 12,
      fontWeight: '600',
      color: ApplicationColors.black,
   },
   textInput: {
      flex: 1,
      color: 'black',
      fontSize: 16,
   },
   subText: {
      fontSize: 14,
      paddingHorizontal: 12,
      color: ApplicationColors.black,
      fontWeight: '600',
   },
});
