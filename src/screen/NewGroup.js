import React from 'react';
import {
  BackHandler,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import commonStyles from '../common/commonStyles';
import IconButton from '../common/IconButton';
import {
  KeyboardIcon,
  LeftArrowIcon,
  SendBlueIcon,
  SmileIcon,
} from '../common/Icons';
import ApplicationColors from '../config/appColors';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Avathar from '../common/Avathar';
import Pressable from '../common/Pressable';
import CameraIcon from '../assets/camera.png';
import { getImageSource } from '../common/utils';
import Graphemer from 'graphemer';
import EmojiOverlay from '../components/EmojiPicker';
import { showToast } from '../Helper';
import { useNetworkStatus } from '../hooks';
import { CONTACTLIST, NEW_GROUP } from '../constant';

const LeftArrowComponent = () => LeftArrowIcon();

function NewGroup() {
  const isConnected = useNetworkStatus();
  const toastConfig = {
    id: 'new-grp-toast',
    duration: 2500,
    avoidKeyboard: true,
  };
  const inputRef = React.useRef();
  const messageInputRef = React.useRef();
  const navigation = useNavigation();
  const allowedMaxLimit = 25;
  const splitter = new Graphemer();
  const headerBg = useSelector(state => state.safeArea.color);
  const [content, setContent] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [isEmojiPickerShowing, setIsEmojiPickerShowing] = React.useState(false);
  const [pressedKey, setPressedKey] = React.useState('');

  const handleBackBtn = () => {
    if (isEmojiPickerShowing) {
      setIsEmojiPickerShowing(!isEmojiPickerShowing);
    } else {
      navigation.goBack();
    }
    return true;
  };

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    handleBackBtn,
  );

  React.useEffect(() => {
    return () => {
      backHandler.remove();
    };
  }, []);

  const handlingBackBtn = () => {
    navigation.goBack();
  };

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

  const handleImage = position => {
    Keyboard.dismiss();
    if (!isConnected) {
      return showToast('Please check your internet connectivity', toastConfig);
    }
  };

  const onMessageSend = () => {
    setMessage('');
  };

  const handleNext = () => {
    navigation.navigate(CONTACTLIST, { prevScreen: NEW_GROUP, grpName: content });
  };

  return (
    <>
      <View
        style={[
          styles.container,
          commonStyles.hstack,
          { backgroundColor: headerBg },
        ]}>
        <View
          style={[
            commonStyles.hstack,
            commonStyles.alignItemsCenter,
            commonStyles.flex1,
            commonStyles.marginLeft_10,
          ]}>
          <IconButton onPress={handlingBackBtn}>
            <LeftArrowComponent />
          </IconButton>
          <Text style={styles.titleText}>New Group</Text>
        </View>
        <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
          <IconButton onPress={handleNext}>
            <Text style={styles.subText}>NEXT</Text>
          </IconButton>
        </View>
      </View>
      <View style={[commonStyles.bg_white, commonStyles.flex1]}>
        <View style={[commonStyles.alignItemsCenter, commonStyles.mt_50]}>
          <View
            style={{
              height: 157,
              width: 157,
              position: 'relative',
            }}>
            <Pressable
              style={[
                commonStyles.borderRadius_50,
                commonStyles.overflowHidden,
              ]}
              pressedStyle={{}}
              onPress={() => handleImage('big')}>
              <Avathar fontSize={60} width={157} height={157} />
            </Pressable>
            <Pressable
              onPress={() => handleImage('small')}
              style={[
                commonStyles.borderRadius_50,
                commonStyles.overflowHidden,
                commonStyles.positionAbsolute,
                commonStyles.r_0,
                commonStyles.b_0,
              ]}>
              <Image
                resizeMode="contain"
                source={getImageSource(CameraIcon)}
                style={styles.cameraImage}
              />
            </Pressable>
          </View>
        </View>
        <View
          style={[
            commonStyles.hstack,
            commonStyles.alignItemsCenter,
            styles.nameTextView,
          ]}>
          <TextInput
            cursorColor={ApplicationColors.mainColor}
            ref={inputRef}
            placeholder="Type group name here"
            style={styles.nameTextInput}
            multiline={true}
            value={content}
            onChangeText={handleInput}
            placeholderTextColor={ApplicationColors.placeholderTextColor}
            keyboardType="default"
            onKeyPress={handleOnKeyPress}
          />
          <Text style={styles.subText}>{count()}</Text>
          <View style={commonStyles.marginRight_12}>
            <IconButton
              onPress={() => {
                if (isEmojiPickerShowing) inputRef.current.focus();
                setIsEmojiPickerShowing(!isEmojiPickerShowing);
              }}>
              {!isEmojiPickerShowing ? <SmileIcon /> : <KeyboardIcon />}
            </IconButton>
          </View>
        </View>
        <Text
          style={[
            commonStyles.pt_15,
            commonStyles.fw_600,
            commonStyles.colorBlack,
            commonStyles.txtCenter,
          ]}>
          Provide a Group Name and Icon
        </Text>
        <View
          style={[
            commonStyles.hstack,
            commonStyles.alignItemsCenter,
            styles.nameTextView,
          ]}>
          <TextInput
            ref={messageInputRef}
            placeholder="Start Typing"
            style={styles.nameTextInput}
            multiline={true}
            value={message}
            onChangeText={setMessage}
            placeholderTextColor={ApplicationColors.placeholderTextColor}
            keyboardType="default"
          />
          <IconButton
            onPress={onMessageSend}
            style={commonStyles.marginRight_12}
            pressedStyle={{ bg: 'rgba(50,118,226, 0.1)' }}>
            <SendBlueIcon />
          </IconButton>
        </View>
      </View>
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

export default NewGroup;

const styles = StyleSheet.create({
  container: {
    height: 60,
  },
  titleText: {
    fontSize: 18,
    paddingHorizontal: 12,
    fontWeight: '500',
    color: ApplicationColors.black,
  },
  subText: {
    fontSize: 14,
    paddingHorizontal: 12,
    color: ApplicationColors.black,
  },
  cameraImage: {
    height: 42,
    width: 42,
    padding: 10,
  },
  nameTextView: {
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  nameTextInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    marginTop: 5,
    paddingLeft: 40,
  },
});
