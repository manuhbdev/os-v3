import { deepFreeze } from '../../utils.js';

function vibrate(duration = 200) {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  } else {
    console.log('Vibration API is not supported in this browser.');
  }
}

export const vibration = deepFreeze({
  vibrate,
});
