import videojs from 'video.js';
import window from 'global/window';

const BigPlayButton = videojs.getComponent('BigPlayButton');

class BigVrPlayButton extends BigPlayButton {
  buildCSSClass() {
    return `vjs-big-vr-play-button ${super.buildCSSClass()}`;
  }

  async handleClick(event) {
    // For iOS we need permission for the device orientation data, this will pop up an 'Allow' if not already set
    // eslint-disable-next-line
    if (typeof window.DeviceMotionEvent === 'function' &&
        typeof window.DeviceMotionEvent.requestPermission === 'function') {
      const response = await window.DeviceMotionEvent.requestPermission();

      if (response !== 'granted') {
        videojs.log('DeviceMotionEvent permissions not set');
      }
    }

    if (window.navigator.xr && window.navigator.xr.requestSession) {
      const sessionInit = {optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']};

      try {
        const session = await window.navigator.xr.requestSession('immersive-vr', sessionInit);

        await window.navigator.xr.setSession(session);
      } catch (err) {
        // immersive-vr not supported
        videojs.log('VR: immersive-vr not supported');
      }
    }
    super.handleClick(event);
  }
}

videojs.registerComponent('BigVrPlayButton', BigVrPlayButton);

export default BigVrPlayButton;
