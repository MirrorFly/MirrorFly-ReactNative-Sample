import { Alert, AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-get-random-values';
import messaging from '@react-native-firebase/messaging';
import SDK from './src/SDK/SDK';
import CryptoJS from 'react-native-crypto-js';
import CryptoES from 'crypto-es';

const decrypt = (data, key, iv) => {
  const decryptKey = CryptoES.enc.Hex.parse(CryptoES.SHA256(key, 32));
  return decodeURIComponent(
    CryptoES.AES.decrypt(data, decryptKey, {
      iv: iv,
      mode: CryptoES.mode.ECB,
    }).toString(CryptoES.enc.Utf8),
  );
};

messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    console.log(
      'setBackgroundMessageHandler remoteMessage',
      JSON.stringify(remoteMessage, null, 2),
    );
    const notify = await SDK.getNotificationData(remoteMessage);
    const content = 'my message';
    let key = 'secret-key-123';
    let iv = 'ddc0f15cc2c90fca';
    let ciphertext = CryptoJS.AES.encrypt(content, key).toString();
    if (notify.status === 200) {
      ciphertext = notify.data.messageContent;
      console.log(notify.data.messageId, 'notify.data.messageId');
      key = notify.data.messageId;
      console.log(ciphertext, key, 'ciphertext, key');
    }
    // const decryptedText = CryptoJS.AES.decrypt(ciphertext, key, {
    //   iv: iv,
    //   mode: CryptoJS.mode.CFB,
    // });
    // let bytes = CryptoJS.AES.decrypt(ciphertext.toString(), key, {
    //   iv: iv,
    // });
    // console.log(decryptedText, 'decryptedText');
    // let originalText = decryptedText.toString(CryptoJS.enc.Utf8);
    // console.log(originalText, 'originalText');
    const decryptedText = decrypt(ciphertext, key, iv);
    console.log(decryptedText, 'decryptedText');
  } catch (error) {
    console.log('messaging().setBackgroundMessageHandler', error);
  }
});

messaging().onMessage(async remoteMessage => {
  console.log(
    'Message handled in the forground!',
    JSON.stringify(remoteMessage, null, 2),
  );
  Alert.alert(
    'A new FCM message arrived!',
    JSON.stringify(remoteMessage, null, 2),
  );
});

AppRegistry.registerComponent(appName, () => App);
