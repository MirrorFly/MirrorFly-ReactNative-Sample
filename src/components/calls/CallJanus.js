import {
  Alert,
  Button,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';
import { RTCView } from 'react-native-webrtc';
import { openSettings } from 'react-native-permissions';
import { clearStatusData } from '../../redux/Actions/statusAction';
import { clearStreamData } from '../../redux/Actions/streamAction';
import InCallManager from 'react-native-incall-manager';
import { requestCameraPermission } from '../../common/utils';
import Store from '../../redux/store';
import { SDK } from '../../SDK';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import RNVoipPushNotification from 'react-native-voip-push-notification';
import RNCallKeep from 'react-native-callkeep';
import { setupCallKit } from './ios';

const CallJanus = () => {
  const streamData = useSelector(state => state.streamData.data);
  const { status } = useSelector(state => state.stateData.data);
  const [localStream, setLocalStream] = React.useState(null);
  const [remoteStream, setRemoteStream] = React.useState([]);
  const [number, setNumber] = React.useState('');
  const [toJid, setToJid] = React.useState('');
  const [auth, setAuth] = React.useState(false);
  const [token, setToken] = React.useState('');

  const handleTernayAvoid = (callType = '') => {
    return callType ? `Incoming  ${callType} Call...` : '';
  };

  const callStatus = handleTernayAvoid(status);

  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      setupCallKit();

      // ===== Step 1: subscribe `register` event =====
      // --- this.onVoipPushNotificationRegistered
      RNVoipPushNotification.addEventListener('register', token => {
        // --- send token to your apn provider server
        setToken(token);
      });

      // ===== Step 2: subscribe `notification` event =====
      // --- this.onVoipPushNotificationiReceived
      RNVoipPushNotification.addEventListener(
        'notification',
        async notification => {
          // --- when receive remote voip push, register your VoIP client, show local notification ... etc
          // this.doSomething();
          let remoteMessage = {
            data: notification,
          };
          console.log(remoteMessage, 'remoteMessage');
          await SDK.getNotificationData(remoteMessage);
          // --- optionally, if you `addCompletionHandler` from the native side, once you have done the js jobs to initiate a call, call `completion()`
          RNVoipPushNotification.onVoipNotificationCompleted(notification.uuid);
        },
      );

      RNCallKeep.addEventListener('answerCall', async ({ callUUID }) => {
        console.log(callUUID, 'callUUID');
        let call = {};
        call = await SDK.answerCall();
        Store.dispatch(clearStatusData());
      });

      RNCallKeep.addEventListener('endCall', async ({ callUUID }) => {
        const res = await SDK.endCall();
        if (res.statusCode === 200) {
          Store.dispatch(clearStatusData());
          Store.dispatch(clearStreamData());
        }
      });

      // ===== Step 3: subscribe `didLoadWithEvents` event =====
      RNVoipPushNotification.addEventListener('didLoadWithEvents', events => {
        // --- this will fire when there are events occured before js bridge initialized
        // --- use this event to execute your event handler manually by event type
        console.log(events, 'eventssss');
        // if (!events || !Array.isArray(events) || events.length < 1) {
        //     return;
        // }
        // for (let voipPushEvent of events) {
        //     let { name, data } = voipPushEvent;
        //     if (name === RNVoipPushNotification.RNVoipPushRemoteNotificationsRegisteredEvent) {
        //         // this.onVoipPushNotificationRegistered(data);
        //     } else if (name === RNVoipPushNotification.RNVoipPushRemoteNotificationReceivedEvent) {
        //         // onVoipPushNotificationiReceived(data);
        //     }
        // }
      });
      // ===== Step 4: register =====
      // --- it will be no-op if you have subscribed before (like in native side)
      // --- but will fire `register` event if we have latest cahced voip token ( it may be empty if no token at all )
      RNVoipPushNotification.registerVoipToken(); // --- register token
    }

    (async () => {
      let cameraPermission = await requestCameraPermission();
      if (cameraPermission === 'granted' || cameraPermission === 'limited') {
        console.log('cameraPermission');
      } else {
        openSettings();
      }
      const credential = await AsyncStorage.getItem(
        'credential',
        JSON.stringify(register.data),
      );
      if (credential) {
        setAuth(true);
      }
    })();

    InCallManager.setKeepScreenOn(true);

    return () => {
      RNVoipPushNotification.removeEventListener('didLoadWithEvents');
      RNVoipPushNotification.removeEventListener('register');
      RNVoipPushNotification.removeEventListener('notification');
    };
  }, []);

  React.useEffect(() => {
    setLocalStream(streamData.localStream);
  }, [streamData.localStream]);

  React.useEffect(() => {
    setRemoteStream(streamData.remoteStream);
  }, [streamData.remoteStream]);

  const fcmTokenCheck = async () => {
    try {
      const fcmToken = await messaging().getToken();
      return fcmToken;
    } catch (error) {
      return false;
    }
  };

  const register = async () => {
    try {
      const fcmToken = await fcmTokenCheck();
      const register = await SDK.register(
        '91' + number,
        fcmToken,
        token,
        true,
      );
      const response = await SDK.connect(
        register.data.username,
        register.data.password,
      );
      if (register.statusCode === 200) {
        await AsyncStorage.setItem('credential', JSON.stringify(register.data));
        console.log(response, 'response');
        Alert.alert('Login Status', response.message, [
          { text: 'OK', onPress: () => Keyboard.dismiss() },
        ]);
        setAuth(true);
      }
    } catch (error) {
      console.log(error, 'error');
    }
  };

  const onMakeCall = async () => {
    Keyboard.dismiss();
    let calleJid = `${'91'}${toJid}${'@xmpp-uikit-qa.contus.us'}`;
    const response = await SDK.makeVideoCall([calleJid], '');
    console.log(response, 'rsponse');
  };

  const answerCall = async () => {
    let call = {};
    call = await SDK.answerCall();
    Keyboard.dismiss();
    Store.dispatch(clearStatusData());
    console.log('attend call', call);
  };

  const muteCall = async () => {
    const videoMuteResult = await SDK.muteVideo(true);
    console.log('videoMuteResult', videoMuteResult);
  };
  const unmuteCall = async () => {
    const videoMuteResult = await SDK.muteVideo(false);
    console.log('videoMuteResult', videoMuteResult);
  };
  const muteAudio = async () => {
    const audioMuteResult = await SDK.muteAudio(true);
    console.log('audioMuteResult', audioMuteResult);
  };
  const unMuteAudio = async () => {
    const audioUnMuteResult = await SDK.muteAudio(false);
    console.log('audioUnMuteResult', audioUnMuteResult);
  };

  const endCall = async () => {
    const res = await SDK.endCall();
    if (res.statusCode === 200) {
      Store.dispatch(clearStatusData());
      Store.dispatch(clearStreamData());
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        {!auth && (
          <View style={{ alignSelf: 'center', borderColor: '#000' }}>
            <TextInput
              style={{ borderColor: '#000', borderBottomWidth: 1 }}
              value={number}
              onChangeText={setNumber}
              placeholderTextColor="#000"
              placeholder="Enter Phone Number"
            />
            <Button title="Register" onPress={register} color="#000" />
          </View>
        )}
        {auth && (
          <View style={{ width: '100%' }}>
            <TextInput
              style={{
                alignSelf: 'center',
                borderColor: '#000',
                marginBottom: 10,
                borderBottomWidth: 1,
              }}
              value={toJid}
              onChangeText={setToJid}
              placeholderTextColor="#000"
              placeholder="Enter Phone Number"
            />
            <Button
              style={styles.button}
              onPress={onMakeCall}
              title="Make VideoCall"
              color="#841584"
            />
            <Button
              style={styles.button}
              onPress={answerCall}
              title="Answer VideoCall"
              color="#841584"
            />
            <Button
              style={styles.button}
              onPress={muteCall}
              title="Mute VideoCall"
              color="#841584"
            />
            <Button
              style={styles.button}
              onPress={unmuteCall}
              title="Unmute VideoCall"
              color="#841584"
            />
            <Button
              style={styles.button}
              onPress={muteAudio}
              title="Mute Audio"
              color="#841584"
            />
            <Button
              style={styles.button}
              onPress={unMuteAudio}
              title="UnMute Audio"
              color="#841584"
            />
            <Button
              style={styles.button}
              onPress={endCall}
              title="End VideoCall"
              color="#841584"
            />
            {status && (
              <Text
                style={{
                  textAlign: 'center',
                  backgroundColor: '#aaa',
                  padding: 10,
                }}>
                {callStatus}
              </Text>
            )}
            <View style={styles.videosContainer}>
              <View style={styles.videoWrapper}>
                {localStream !== null && (
                  <RTCView
                    streamURL={localStream?.video.toURL()}
                    style={styles.localVideo}
                    objectFit="cover"
                  />
                )}
              </View>
              <View style={styles.videoWrapper}>
                {remoteStream !== undefined &&
                  remoteStream.length !== 0 &&
                  remoteStream[0].stream.video !== null && (
                    <RTCView
                      streamURL={remoteStream[0].stream.video.id}
                      style={styles.remoteVideo}
                      objectFit="cover"
                    />
                  )}
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CallJanus;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 150,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  breathingSpace: {
    marginVertical: 10,
  },
  voiceSwitchWrapper: {
    flexDirection: 'row',
  },
  button: {
    padding: 1,
  },
  channelInput: {
    width: 300,
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 5,
  },
  videosContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 320,
    paddingVertical: 10,
  },
  videoWrapper: {
    flex: 1,
    marginHorizontal: 5,
    // padding: 10,
    backgroundColor: 'black',
    borderRadius: 10,
    overflow: 'hidden',
  },
  localVideo: {
    flex: 1,
  },
  remoteVideo: {
    flex: 1,
  },
});
