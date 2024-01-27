import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

import PipHandler from '../customModules/PipModule';

/**
 * Hook that provides the current Pip mode state. Subscribe to this hook, to listen
 * to pip mode enter and exit events. Use the boolean to show, hide ui on the component
 *
 * @returns boolean, true when pip mode is entered and false when pip mode is exited
 * @example
 * ```js
 * import { usePipModeListener } from 'customModules/PipModule';
 *
 * function PlayerOverlay() {
 *   const isPipModeEnabled = usePipModeListener()
 *
 *   if (isPipModeEnabled) {
 *     showPlayerControls(false);
 *   } else {
 *     showPlayerControls(true);
 *   }
 * }
 * ```
 */
export function usePipModeListener() {
  const [isModeEnabled, setIsPipModeEnabled] = useState(false);

  useEffect(() => {
    let pipListener;
    if (Platform.OS === 'android') {
      pipListener = PipHandler.onPipModeChanged(setIsPipModeEnabled);
    }

    return () => {
      pipListener?.remove();
    };
  }, []);

  return isModeEnabled;
}

export default usePipModeListener;
