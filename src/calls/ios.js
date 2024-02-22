import { PermissionsAndroid } from 'react-native';
import RNCallKeep from 'react-native-callkeep';

export const setupCallKit = async () => {
   await RNCallKeep.setup({
      ios: {
         appName: 'Mirrorfly RN',
         supportsVideo: true,
         maximumCallGroups: '1',
         maximumCallsPerCallGroup: '8',
         includesCallsInRecents: true,
         ringtoneSound: 'ringing.mp3',
      },
      android: {
         alertTitle: 'noop',
         alertDescription: 'noop',
         cancelButton: 'noop',
         okButton: 'noop',
         additionalPermissions: [],
      },
   });
};
