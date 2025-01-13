import videojs from 'video.js';
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

    [...div.querySelectorAll('button')].forEach((button) => {
      button.addEventListener('mousedown', () => {
        const direction = button.getAttribute('data-direction');

        this.panStart(direction);
      });
      button.addEventListener('touchstart', () => {
        const direction = button.getAttribute('data-direction');

        this.panStart(direction);
      });
      button.addEventListener('mouseup', () => this.panEnd());
      button.addEventListener('touchend', () => this.panEnd());
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
    this.player().on('keyup', () => this.panEnd());

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
}

videojs.registerComponent('VrNavigator', VrNavigator);

export default VrNavigator;
