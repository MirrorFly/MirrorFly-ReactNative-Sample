import { PLAYER_STATES } from './constants/playerStates';
import ic_play from './assets/ic_play.png';
import ic_pause from './assets/ic_pause.png';
import ic_replay from './assets/ic_replay.png';

export const humanizeVideoDuration = seconds => {
  const [begin, end] = seconds >= 3600 ? [11, 8] : [14, 5];
  const date = new Date(0);

  date.setSeconds(seconds);
  return date.toISOString().substr(begin, end);
};

export const noop = () => {};

export const getPlayerStateIcon = playerState => {
  switch (playerState) {
    case PLAYER_STATES.PAUSED:
      return ic_play;
    case PLAYER_STATES.PLAYING:
      return ic_pause;
    case PLAYER_STATES.ENDED:
      return ic_replay;
    default:
      return null;
  }
};
