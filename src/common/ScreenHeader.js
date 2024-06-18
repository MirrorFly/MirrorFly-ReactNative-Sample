import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { BackHandler, StyleSheet, Text, TextInput, View } from 'react-native';
import ApplicationColors from '../config/appColors';
import commonStyles from '../styles/commonStyles';
import IconButton from './IconButton';
import { CloseIcon, LeftArrowIcon, SearchIcon } from './Icons';
import MenuContainer from './MenuContainer';

function ScreenHeader({
   title = '',
   menuItems = [],
   onChangeText = () => {},
   isSearchable = true,
   onCreateBtn = () => {},
   isGroupInfoSrn = false,
}) {
   const navigation = useNavigation();
   const [text, setText] = React.useState('');
   const [isSearching, setIsSearching] = React.useState(false);

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', closeSearch);
      return () => backHandler.remove();
   }, [isSearching]);

   const closeSearch = () => {
      switch (true) {
         case isSearching:
            setText('');
            setIsSearching(false);
            break;
         case navigation.canGoBack():
            navigation.goBack();
            break;
         default:
            BackHandler.exitApp();
            break;
      }
      return true;
   };

   const handleChangeText = text => {
      setText(text);
      onChangeText(text);
   };

   const clearText = () => {
      setText('');
      onChangeText(''); // Clear the text in the parent component as well
   };

   const toggleSearch = () => {
      setText('');
      setIsSearching(!isSearching);
   };

   if (isSearching) {
      return (
         <View style={[styles.container]}>
            <IconButton onPress={closeSearch}>
               <LeftArrowIcon />
            </IconButton>
            <TextInput
               placeholderTextColor="#d3d3d3"
               value={text}
               style={styles.textInput}
               onChangeText={handleChangeText}
               placeholder=" Search..."
               cursorColor={ApplicationColors.mainColor}
               returnKeyType="done"
               autoFocus={true}
            />
            {text.trim() && (
               <IconButton onPress={clearText}>
                  <CloseIcon />
               </IconButton>
            )}
         </View>
      );
   }

   if (title) {
      return (
         <View style={styles.titleContainer}>
            <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
               <IconButton onPress={closeSearch}>
                  <LeftArrowIcon />
               </IconButton>
               <Text numberOfLines={1} ellipsizeMode="tail" style={styles.titleText}>
                  {title}
               </Text>
            </View>
            <View style={[commonStyles.hstack]}>
               {!isSearching && isSearchable && (
                  <IconButton onPress={toggleSearch}>
                     <SearchIcon />
                  </IconButton>
               )}
               {Boolean(title === 'Add Participants') && (
                  <IconButton onPress={onCreateBtn}>
                     <Text style={styles.subText}>{isGroupInfoSrn ? 'NEXT' : 'CREATE'}</Text>
                  </IconButton>
               )}
               {Boolean(menuItems.length) && <MenuContainer menuItems={menuItems} />}
            </View>
         </View>
      );
   }

   return (
      <View style={styles.container}>
         <View style={[commonStyles.hstack]}>
            {!isSearching && (
               <IconButton onPress={toggleSearch}>
                  <SearchIcon />
               </IconButton>
            )}
            {Boolean(menuItems.length) && <MenuContainer menuItems={menuItems} />}
         </View>
      </View>
   );
}

export default ScreenHeader;

const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      width: '100%',
      height: 65,
      backgroundColor: ApplicationColors.headerBg,
      paddingRight: 16,
      paddingVertical: 12,
   },
   titleContainer: {
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
   textInput: {
      flex: 1,
      color: 'black',
      fontSize: 16,
   },
   titleText: {
      fontSize: 18,
      paddingHorizontal: 12,
      fontWeight: '600',
      color: ApplicationColors.black,
   },
   subText: {
      fontSize: 14,
      color: ApplicationColors.black,
      fontWeight: '600',
   },
});
