import { useNavigation } from '@react-navigation/native';
import Graphemer from 'graphemer';
import React from 'react';
import { BackHandler, StyleSheet, Text, TextInput, View } from 'react-native';
import IconButton from '../common/IconButton';
import { KeyboardIcon, SmileIcon } from '../common/Icons';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';
import EmojiOverlay from './EmojiPicker';

function EmojiInput(props) {
   const { defaultContent = '', setEmojiWindow = () => {}, setValue = () => {} } = props;
   const navigation = useNavigation();
   const inputRef = React.useRef();
   const [content, setContent] = React.useState(defaultContent);
   const [isEmojiPickerShowing, setIsEmojiPickerShowing] = React.useState(false);
   const [pressedKey, setPressedKey] = React.useState('');
   const allowedMaxLimit = 25;
   const splitter = new Graphemer();

   const count = () => allowedMaxLimit - splitter.countGraphemes(content);

   const handleEmojiSelect = (...emojis) => {
      if (count() > 0) {
         setContent(prev => prev + emojis);
      }
   };

   const handleInput = text => {
      if (count() > 0 || pressedKey === 'Backspace') {
         setContent(text);
      }
   };

   const handleOnKeyPress = ({ nativeEvent }) => {
      const { key } = nativeEvent;
      setPressedKey(key);
   };

   const toggleEmojiWindow = () => {
      setIsEmojiPickerShowing(!isEmojiPickerShowing);
      setEmojiWindow?.(!isEmojiPickerShowing);
   };

   const handleBackBtn = () => {
      if (isEmojiPickerShowing) {
         toggleEmojiWindow();
         return true;
      } else {
         navigation.goBack();
         return true;
      }
   };

   const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);

   React.useEffect(() => {
      setValue(content);
   }, [content]);

   React.useEffect(() => {
      return () => {
         backHandler.remove();
      };
   }, []);

   return (
      <>
         <View style={[commonStyles.hstack, commonStyles.alignItemsCenter, styles.nameTextView, commonStyles.mt_20]}>
            <TextInput
               cursorColor={ApplicationColors.mainColor}
               ref={inputRef}
               placeholder="Type group name here"
               style={styles.nameTextInput}
               multiline={false}
               value={content}
               onChangeText={handleInput}
               placeholderTextColor={ApplicationColors.placeholderTextColor}
               keyboardType="default"
               onKeyPress={handleOnKeyPress}
            />
            <Text style={styles.subText}>{count()}</Text>
            <View style={[commonStyles.marginRight_12, commonStyles.alignItemsCenter, styles.iconWidth]}>
               <IconButton
                  onPress={() => {
                     if (isEmojiPickerShowing) {
                        inputRef.current.focus();
                     }
                     toggleEmojiWindow();
                  }}>
                  {!isEmojiPickerShowing ? <SmileIcon /> : <KeyboardIcon />}
               </IconButton>
            </View>
         </View>
         <View
            style={{
               position: 'absolute',
               bottom: 0,
               right: 0,
               left: 0,
               top: '50%',
            }}>
            <EmojiOverlay
               state={content}
               setState={setContent}
               visible={isEmojiPickerShowing}
               onClose={() => setIsEmojiPickerShowing(false)}
               onSelect={handleEmojiSelect}
            />
         </View>
      </>
   );
}

export default EmojiInput;

const styles = StyleSheet.create({
   subText: {
      fontSize: 14,
      paddingHorizontal: 12,
      color: ApplicationColors.black,
   },
   nameTextView: {
      borderBottomWidth: 1,
      borderBottomColor: '#f2f2f2',
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
