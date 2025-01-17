import videojs from 'video.js';
import document from 'global/document';
const Component = videojs.getComponent('Component');

class VrNavigator extends Component {
  constructor(player, options) {
    super(player, options);
    this.panInterval = null;
  }

  createEl() {
    const div = videojs.dom.createEl('div', {
      className: 'vjs-vr-navigator'
    });

    div.innerHTML = `
      <div class="vjs-vr-slice"></div>
      <div class="vjs-vr-cutout">
        <button class="vjs-vr-btn-row" data-direction="up" title="${this.player().localize('Up')}">&#9650;</button>
        <div class="vjs-vr-btn-row vjs-vr-left-right">
          <button data-direction="left" title="${this.player().localize('Left')}">&#9664;</button>
          <button data-direction="right" title="${this.player().localize('Right')}">&#9654;</button>
        </div>
        <button class="vjs-vr-btn-row" data-direction="down" title="${this.player().localize('Down')}">&#9660;</button>
      </div>`;

    const panStartHandler = (event) => {
      const direction = event.target.getAttribute('data-direction');

      this.panStart(direction);
    };
    const panEndHandler = () => this.panEnd();
    const panStartKeyHandler = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        panStartHandler(event);
      }
    };
    const panEndKeyHandler = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        this.panEnd();
      }
    };

    [...div.querySelectorAll('button')].forEach((button) => {
      button.addEventListener('mousedown', panStartHandler);
      button.addEventListener('mouseup', panEndHandler);
      button.addEventListener('mouseout', panEndHandler);
      button.addEventListener('keydown', panStartKeyHandler);
      button.addEventListener('keyup', panEndKeyHandler);
      button.addEventListener('touchstart', panStartHandler);
      button.addEventListener('touchend', panEndHandler);
      button.addEventListener('touchmove', (event) => {
        const item = event.changedTouches.item(0);
        const isOnButton = button.getBoundingClientRect().right > item.clientX &&
          button.getBoundingClientRect().left < item.clientX &&
          button.getBoundingClientRect().top < item.clientY &&
          button.getBoundingClientRect().bottom > item.clientY;

        if (!isOnButton) {
          this.panEnd();
        }
      });
    });

    // Use W-A-S-D keys to pan the video. This is in addition to threejs its
    // own key bindings. Unfortunately, the out of the box bindings are
    // shift+arrows and not customizable. Those aren't very friendly, so add
    // WASD as well.
    this.player().on('keydown', (event) => {
      if (event.key === 'w') {
        this.panStart('up');
      } else if (event.key === 'a') {
        this.panStart('left');
      } else if (event.key === 's') {
        this.panStart('down');
      } else if (event.key === 'd') {
        this.panStart('right');
      }
    });
    this.player().on('keyup', panEndHandler);

    const quarterEl = div.querySelector('.vjs-vr-slice');
    const vr = this.options().vr;

    vr.controls3d.orbit.addEventListener('change', () => {
      const orbit = vr.controls3d.orbit;
      const rotationXInRadians = orbit.getAzimuthalAngle();
      const rotationXInDegrees = 45 + (-1 * rotationXInRadians * 180) / Math.PI;

      quarterEl.style.transform = `rotate(${rotationXInDegrees}deg)`;
    });

    return div;
  }

  panStart(direction) {
    this.panEnd();

    const vr = this.options().vr;
    // Use increments of 1 degree every x milliseconds to ensure smooth panning
    const oneMovement = (Math.PI * 2) / 360;

    this.panInterval = setInterval(() => {
      switch (direction) {
      case 'up':
        vr.controls3d.orbit._rotateUp(-oneMovement);
        break;
      case 'down':
        vr.controls3d.orbit._rotateUp(oneMovement);
        break;
      case 'left':
        vr.controls3d.orbit._rotateLeft(-oneMovement);
        break;
      case 'right':
        vr.controls3d.orbit._rotateLeft(oneMovement);
        break;
      }
    }, 10);
  }

  panEnd() {
    clearInterval(this.panInterval);
  }

  /**
   * Add an annotation at the given coordinate
   *
   * Note that this only affects this component. It does not add any annotations
   * in the projected video.
   *
   * @param {number} x The coordinate add an annotation. This is the x coordinate
   *  in the video texture. i.e., if your video is 2048px wide and you want to
   *  indicate something interesting halfway, you would pass 1024 here.
   * @param {Object} options An object with additional options. Specify a `backgroundColor`
   *   key with a valid CSS color value to change the background color of the
   *   annotation.
   * @return The annotation element that was added to the DOM
   */
  addAnnotation(x, options = { backgroundColor: '#FFF' }) {
    const annotation = document.createElement('span');

    annotation.className = 'vjs-vr-annotation';
    if (options.backgroundColor) {
      annotation.style.backgroundColor = options.backgroundColor;
    }

    const width = this.options().vr.videoTexture.image.videoWidth;
    const angle = 360 * x / width;
    const angleRads = angle * Math.PI / 180;
    // 51px gets to halfway the moving "viewing" bar of the navigator
    const translateX = Math.floor(-51 * Math.sin(angleRads));
    const translateY = Math.floor(51 * Math.cos(angleRads));

    annotation.style.transform = `translate(${translateX}px, ${translateY}px)`;
    this.el().appendChild(annotation);
    return annotation;
  }

  /** Remove existing annotations from the DOM */
  clearAnnotations() {
    [...this.el().querySelectorAll('.vjs-vr-annotation')].forEach((el) => el.remove());
  }
}

videojs.registerComponent('VrNavigator', VrNavigator);

export default VrNavigator;
