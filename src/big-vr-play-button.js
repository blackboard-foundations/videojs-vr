import videojs from 'video.js';
import window from 'global/window';

const BigPlayButton = videojs.getComponent('BigPlayButton');

class BigVrPlayButton extends BigPlayButton {
  constructor(player, options) {
    super(player, options);
  }

  buildCSSClass() {
    return `vjs-big-vr-play-button ${super.buildCSSClass()}`;
  }

  async handleClick(event) {
    // For iOS we need permission for the device orientation data, this will pop up an 'Allow' if not already set
    // eslint-disable-next-line
    if (this.options().vr.options_.motionControls &&
        typeof window.DeviceMotionEvent === 'function' &&
        typeof window.DeviceMotionEvent.requestPermission === 'function') {
      const response = await window.DeviceMotionEvent.requestPermission();

      if (response !== 'granted') {
        videojs.log('DeviceMotionEvent permissions not set');
      }
    }

    // Try to request an XR session if it's supported. If not, then this does nothing.
    this.options().vr.requestXRSession();

    // Start playing the video.
    super.handleClick(event);
  }
}

videojs.registerComponent('BigVrPlayButton', BigVrPlayButton);

export default BigVrPlayButton;
