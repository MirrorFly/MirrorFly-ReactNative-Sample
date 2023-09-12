/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {Alert, SafeAreaView, StatusBar, useColorScheme} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {SDK} from './build/index';
const callBacks = {
  connectionListener: response => {
    console.log('connectionListener', response);
    if (response.status === 'CONNECTED') {
      console.log('Connection Established');
    } else if (response.status === 'DISCONNECTED') {
      console.log('Disconnected');
    } else if (response.status === 'LOGOUT') {
      console.log('LOGOUT');
    }
  },
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const API_URL = 'https://api-uikit-qa.contus.us/api/v1';
  const QALisenceKey = 'ckIjaccWBoMNvxdbql8LJ2dmKqT5bp';

  React.useEffect(() => {
    (async () => {
      await SDK.initializeSDK({
        apiBaseUrl: 'https://api-uikit-qa.contus.us/api/v1',
        licenseKey: 'ckIjaccWBoMNvxdbql8LJ2dmKqT5bp',
        callbackListeners: callBacks,
        isSandbox: false,
      });
      try {
        const register = await SDK.register('91' + '7868080431');
        const {data} = register;
        let connect = await SDK.connect(data.username, data.password);
        console.log(connect, 'connect');
        Alert.alert('Alert Title', data.message, [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ]);
      } catch (error) {
        console.log(error, 'error');
      }
    })();
  }, []);

  return (
    <>
      {/* <ChatApp apiUrl={API_URL} licenseKey={QALisenceKey} /> */}
      {/* <Image style={{width: 100, heigth: 100}} source={background} /> */}
    </>
  );
};

export default App;
