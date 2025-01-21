import React from 'react';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';
import { getImageSource } from '../../helpers/chatHelpers';
import { Props } from './MediaControls';
import styles from './MediaControls.style';
import { PLAYER_STATES } from './constants/playerStates';
import { getPlayerStateIcon } from './utils';

type ControlsProps = Pick<Props, 'isLoading' | 'primaryColor' | 'playerState' | 'onReplay'> & {
   onPause: () => void;
};

const Controls = (props: ControlsProps) => {
   const { isLoading, primaryColor, playerState, onReplay, onPause } = props;
   const icon = getPlayerStateIcon(playerState);
   const pressAction = playerState === PLAYER_STATES.ENDED ? onReplay : onPause;

   const content = isLoading ? (
      <ActivityIndicator size="large" color="#FFF" />
   ) : (
      <TouchableOpacity
         style={[styles.playButton, { backgroundColor: primaryColor }]}
         onPress={pressAction}
         accessibilityLabel={PLAYER_STATES.PAUSED ? 'Tap to Play' : 'Tap to Pause'}
         accessibilityHint={'Plays and Pauses the Video'}>
         <Image source={getImageSource(icon)} style={styles.playIcon} />
      </TouchableOpacity>
   );

   return <View style={[styles.controlsRow]}>{content}</View>;
};

export { Controls };
