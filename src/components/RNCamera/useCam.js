import { useState } from 'react';
import TimerService from './TimerService';

const timerService = new TimerService();

const useCamera = ref => {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(45);

  const cameraActionProxy = cb => {
    if (!ref) {
      return () => 0;
    }
    return () => cb(ref);
  };

  const takePicture = async camera => {
    try {
      const res = await camera.takePictureAsync();
      return res;
    } catch (e) {
      console.log('Failed to take a picture: ', e);
    }
  };

  const startRecordingVideo = async camera => {
    try {
      timerService.startTimer(countdown);
      setRecording(true);
      const res = await camera.recordAsync();
      return res;
    } catch (e) {
      console.log('Failed to start recording: ', e);
    }
  };

  const stopRecordingVideo = async camera => {
    if (!recording) {
      return;
    }
    try {
      timerService.stopTimer();
      setSeconds(45);
      setRecording(false);
      await camera.stopRecording();
    } catch (e) {
      console.log('Failed to stop recording: ', e);
    }
  };

  const countdown = () => {
    setSeconds(prevSeconds => {
      const newSeconds = prevSeconds - 1;
      if (newSeconds === 0) {
        timerService.stopTimer();
        cameraActionProxy(stopRecordingVideo)();
      }
      return newSeconds;
    });
  };

  return {
    seconds,
    recording,
    takePicture: cameraActionProxy(takePicture),
    startRecordingVideo: cameraActionProxy(startRecordingVideo),
    stopRecordingVideo: cameraActionProxy(stopRecordingVideo),
  };
};

export default useCamera;
