import RNCallKeep from "react-native-callkeep";
import React from "react";

export const setupCallKit = async () => {
    await RNCallKeep.setup({
      ios: {
        appName: 'mirrorfly_rn',
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