import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { getStringSet } from '../localization/stringSet';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import IconButton from './IconButton';
import { CloseIcon, LeftArrowIcon, SearchIcon } from './Icons';
import MenuContainer from './MenuContainer';
import Text from './Text';
import TextInput from './TextInput';
import PropTypes from 'prop-types';

function ScreenHeader({
   title = '',
   menuItems = [],
   onChangeText = () => {},
   isSearchable = true,
   onCreateBtn = () => {},
   isGroupInfoSrn = false,
   onBackAction,
}) {
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   const navigation = useNavigation();
   const [text, setText] = React.useState('');
   const [isSearching, setIsSearching] = React.useState(false);

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', closeSearch);
      return () => backHandler.remove();
   }, [isSearching]);

   const closeSearch = () => {
      switch (true) {
         case Boolean(onBackAction):
            onBackAction?.();
            break;
         case isSearching:
            setText('');
            setIsSearching(false);
            onChangeText(''); // Clear the text in the parent component as well
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

   const handleChangeText = _text => {
      setText(_text);
      onChangeText(_text);
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
         <View style={[[styles.container, commonStyles.bg_color(themeColorPalatte.appBarColor)]]}>
            <IconButton onPress={closeSearch}>
               <LeftArrowIcon color={themeColorPalatte.iconColor} />
            </IconButton>
            <TextInput
               placeholderTextColor={themeColorPalatte.placeholderTextColor}
               value={text}
               style={[styles.textInput, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}
               onChangeText={handleChangeText}
               placeholder={stringSet.PLACEHOLDERS.SEARCH_PLACEHOLDER}
               cursorColor={themeColorPalatte.primaryColor}
               selectionColor={themeColorPalatte.primaryColor}
               returnKeyType="done"
               autoFocus={true}
            />
            {!!text.trim() && (
               <IconButton onPress={clearText}>
                  <CloseIcon color={themeColorPalatte.iconColor} />
               </IconButton>
            )}
            {Boolean(title === stringSet.CONTACT_SCREEN.ADD_PARTICIPANTS_LABEL) && (
               <IconButton onPress={onCreateBtn}>
                  <Text style={[styles.subText, commonStyles.textColor(themeColorPalatte.headerPrimaryTextColor)]}>
                     {isGroupInfoSrn
                        ? stringSet.CREATE_GROUP_SCREEN.NEXT_BUTTON
                        : stringSet.CREATE_GROUP_SCREEN.CREATE_BUTTON}
                  </Text>
               </IconButton>
            )}
         </View>
      );
   }

   if (title) {
      return (
         <View style={[styles.titleContainer, commonStyles.bg_color(themeColorPalatte.appBarColor)]}>
            <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
               <IconButton onPress={closeSearch}>
                  <LeftArrowIcon color={themeColorPalatte.iconColor} />
               </IconButton>
               <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[styles.titleText, commonStyles.textColor(themeColorPalatte.headerPrimaryTextColor)]}>
                  {title}
               </Text>
            </View>
            <View style={[commonStyles.hstack]}>
               {!isSearching && isSearchable && (
                  <IconButton onPress={toggleSearch}>
                     <SearchIcon color={themeColorPalatte.iconColor} />
                  </IconButton>
               )}
               {Boolean(title === stringSet.CONTACT_SCREEN.ADD_PARTICIPANTS_LABEL) && (
                  <IconButton onPress={onCreateBtn}>
                     <Text style={[styles.subText, commonStyles.textColor(themeColorPalatte.headerPrimaryTextColor)]}>
                        {isGroupInfoSrn
                           ? stringSet.CREATE_GROUP_SCREEN.NEXT_BUTTON
                           : stringSet.CREATE_GROUP_SCREEN.CREATE_BUTTON}
                     </Text>
                  </IconButton>
               )}
               {Boolean(menuItems.length) && <MenuContainer menuItems={menuItems} />}
            </View>
         </View>
      );
   }

   return (
      <View style={[styles.container, commonStyles.bg_color(themeColorPalatte.appBarColor)]}>
         <View style={[commonStyles.hstack]}>
            {!isSearching && (
               <IconButton onPress={toggleSearch}>
                  <SearchIcon color={themeColorPalatte.iconColor} />
               </IconButton>
            )}
            {Boolean(menuItems.length) && <MenuContainer menuItems={menuItems} />}
         </View>
      </View>
   );
}

ScreenHeader.propTypes = {
   title: PropTypes.string,
   menuItems: PropTypes.array,
   onChangeText: PropTypes.func,
   isSearchable: PropTypes.bool,
   onCreateBtn: PropTypes.func,
   isGroupInfoSrn: PropTypes.bool,
   onBackAction: PropTypes.func,
};

export default ScreenHeader;

const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      width: '100%',
      height: 65,
      paddingRight: 16,
      paddingVertical: 12,
   },
   titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      height: 65,
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
      fontSize: 16,
   },
   titleText: {
      fontSize: 18,
      paddingHorizontal: 12,
      fontWeight: '600',
      width: 220,
   },
   subText: {
      fontSize: 14,
      fontWeight: '600',
   },
});
