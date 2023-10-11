import {
  Alert,
  Button,
  Keyboard,
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

const CallJanus = () => {
  const streamData = useSelector(state => state.streamData.data);
  const { status } = useSelector(state => state.stateData.data);
  const [localStream, setLocalStream] = React.useState(null);
  const [remoteStream, setRemoteStream] = React.useState([]);
  const [number, setNumber] = React.useState('');
  const [toJid, setToJid] = React.useState('');
  const [auth, setAuth] = React.useState(false);
  const handleTernayAvoid = (callType = '') => {
    return callType ? `Incoming  ${callType} Call...` : '';
  };

  const callStatus = handleTernayAvoid(status);

  React.useEffect(() => {
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
      const register = await SDK.register('91' + number, fcmToken);
      const response = await SDK.connect(
        register.data.username,
        register.data.password,
      );
      await AsyncStorage.setItem('credential', JSON.stringify(register.data));
      console.log(response, 'response');
      Alert.alert('Login Status', response.message, [
        { text: 'OK', onPress: () => Keyboard.dismiss() },
      ]);
      setAuth(true);
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
