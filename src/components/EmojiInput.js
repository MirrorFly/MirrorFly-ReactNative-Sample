import { useNavigation } from '@react-navigation/native';
import Graphemer from 'graphemer';
import PropTypes from 'prop-types';
import React from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import IconButton from '../common/IconButton';
import { KeyboardIcon, SmileIcon } from '../common/Icons';
import Text from '../common/Text';
import TextInput from '../common/TextInput';
import { getStringSet } from '../localization/stringSet';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import EmojiOverlay from './EmojiPicker';

const propTypes = {
   children: PropTypes.node,
   allowedMaxLimit: PropTypes.number,
   defaultContent: PropTypes.string,
   onEmojiWindowToggle: PropTypes.func,
   setValue: PropTypes.func,
};

function EmojiInput({
   children,
   allowedMaxLimit = 0,
   defaultContent = '',
   onEmojiWindowToggle = () => {},
   setValue = () => {},
}) {
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   const navigation = useNavigation();
   const inputRef = React.useRef();
   const [content, setContent] = React.useState(defaultContent);
   const [maxTextLength, setMaxTextLength] = React.useState();
   const [isEmojiPickerShowing, setIsEmojiPickerShowing] = React.useState(false);
   const [pressedKey, setPressedKey] = React.useState('');

   const splitter = new Graphemer();

   const count = () => allowedMaxLimit - splitter.countGraphemes(content);

   const handleEmojiSelect = (...emojis) => {
      if (!allowedMaxLimit) {
         setContent(prev => prev + emojis);
      }
      if (count() > 0) {
         setContent(prev => prev + emojis);
      }
   };

   const handleInput = text => {
      setMaxTextLength();
      if (!allowedMaxLimit) {
         setContent(text);
      }
      if (count() > 0 || pressedKey === 'Backspace') {
         setContent(text);
      }
   };

   const handleOnKeyPress = ({ nativeEvent }) => {
      const { key } = nativeEvent;
      setPressedKey(key);
   };

   const hideEmojiWindow = () => {
      setIsEmojiPickerShowing(false);
      onEmojiWindowToggle?.(false);
   };

   const toggleEmojiWindow = () => {
      setIsEmojiPickerShowing(!isEmojiPickerShowing);
      onEmojiWindowToggle?.(!isEmojiPickerShowing);
   };

   const handleBackBtn = () => {
      if (isEmojiPickerShowing) {
         toggleEmojiWindow();
      } else {
         navigation.goBack();
      }
      return true;
   };

   React.useEffect(() => {
      setValue(content.trim());
   }, [content]);

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
      };
   }, [isEmojiPickerShowing]);

   return (
      <>
         <View
            style={[
               commonStyles.hstack,
               commonStyles.alignItemsCenter,
               styles.nameTextView,
               commonStyles.mt_20,
               { borderBottomColor: themeColorPalatte.dividerBg },
            ]}>
            <TextInput
               cursorColor={themeColorPalatte.primaryColor}
               selectionColor={themeColorPalatte.primaryColor}
               inputRef={inputRef}
               placeholder={stringSet.CREATE_GROUP_SCREEN.GROUP_NAME_INPUT_PLACEHOLDER}
               style={[styles.nameTextInput, { color: themeColorPalatte.primaryTextColor }]}
               multiline={false}
               value={content}
               onChangeText={handleInput}
               placeholderTextColor={themeColorPalatte.placeholderTextColor}
               keyboardType="default"
               onKeyPress={handleOnKeyPress}
               maxLength={maxTextLength}
               onFocus={hideEmojiWindow}
            />
            {Boolean(allowedMaxLimit) && (
               <Text style={[styles.subText, { color: themeColorPalatte.primaryTextColor }]}>{count()}</Text>
            )}
            <View style={[commonStyles.marginRight_12, commonStyles.alignItemsCenter, styles.iconWidth]}>
               <IconButton
                  onPress={() => {
                     if (isEmojiPickerShowing) {
                        inputRef.current.focus();
                     }
                     toggleEmojiWindow();
                  }}>
                  {!isEmojiPickerShowing ? (
                     <SmileIcon color={themeColorPalatte.iconColor} />
                  ) : (
                     <KeyboardIcon color={themeColorPalatte.iconColor} />
                  )}
               </IconButton>
            </View>
         </View>
         {children}
         <EmojiOverlay
            state={content}
            setState={setContent}
            visible={isEmojiPickerShowing}
            onClose={() => setIsEmojiPickerShowing(false)}
            onSelect={handleEmojiSelect}
         />
      </>
   );
}

EmojiInput.propTypes = propTypes;

export default EmojiInput;

const styles = StyleSheet.create({
   subText: {
      fontSize: 14,
      paddingHorizontal: 12,
   },
   nameTextView: {
      borderBottomWidth: 1,
   },
   iconWidth: {
      width: 40,
   },
   nameTextInput: {
      flex: 1,
      fontSize: 15,
      fontWeight: '400',
      marginTop: 5,
      paddingLeft: 40,
   },
});
