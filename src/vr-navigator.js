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
      <div class="vjs-vr-circle"></div>
      <div class="vjs-vr-slice"></div>
      <div class="vjs-vr-cutout">
        <button class="vjs-vr-btn-row" data-direction="up" title="${this.player().localize('Up')}">
          <svg width="12" height="7" viewBox="0 0 12 7" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.7071 6.70711C11.3166 7.09763 10.6834 7.09763 10.2929 6.70711L6 2.41421L1.70711 6.70711C1.31658 7.09763 0.683418 7.09763 0.292894 6.70711C-0.0976312 6.31658 -0.0976312 5.68342 0.292894 5.29289L5.29289 0.292893C5.68342 -0.0976311 6.31658 -0.0976311 6.70711 0.292893L11.7071 5.29289C12.0976 5.68342 12.0976 6.31658 11.7071 6.70711Z"/>
          </svg>
        </button>
        <div class="vjs-vr-btn-row vjs-vr-left-right">
          <button data-direction="left" title="${this.player().localize('Left')}">
            <svg width="12" height="7" viewBox="0 0 12 7" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M11.7071 6.70711C11.3166 7.09763 10.6834 7.09763 10.2929 6.70711L6 2.41421L1.70711 6.70711C1.31658 7.09763 0.683418 7.09763 0.292894 6.70711C-0.0976312 6.31658 -0.0976312 5.68342 0.292894 5.29289L5.29289 0.292893C5.68342 -0.0976311 6.31658 -0.0976311 6.70711 0.292893L11.7071 5.29289C12.0976 5.68342 12.0976 6.31658 11.7071 6.70711Z"/>
            </svg>
          </button>
          <button data-direction="right" title="${this.player().localize('Right')}">
            <svg width="12" height="7" viewBox="0 0 12 7" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M11.7071 6.70711C11.3166 7.09763 10.6834 7.09763 10.2929 6.70711L6 2.41421L1.70711 6.70711C1.31658 7.09763 0.683418 7.09763 0.292894 6.70711C-0.0976312 6.31658 -0.0976312 5.68342 0.292894 5.29289L5.29289 0.292893C5.68342 -0.0976311 6.31658 -0.0976311 6.70711 0.292893L11.7071 5.29289C12.0976 5.68342 12.0976 6.31658 11.7071 6.70711Z"/>
            </svg>
          </button>
        </div>
        <button class="vjs-vr-btn-row" data-direction="down" title="${this.player().localize('Down')}">
          <svg width="12" height="7" viewBox="0 0 12 7" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.7071 6.70711C11.3166 7.09763 10.6834 7.09763 10.2929 6.70711L6 2.41421L1.70711 6.70711C1.31658 7.09763 0.683418 7.09763 0.292894 6.70711C-0.0976312 6.31658 -0.0976312 5.68342 0.292894 5.29289L5.29289 0.292893C5.68342 -0.0976311 6.31658 -0.0976311 6.70711 0.292893L11.7071 5.29289C12.0976 5.68342 12.0976 6.31658 11.7071 6.70711Z"/>
          </svg>
        </button>
      </div>`;

    const panStartHandler = (event) => {
      const direction = event.currentTarget.getAttribute('data-direction');

      this.panStart(direction);
    };
    const panEndHandler = (event) => {
      this.panEnd();
    };
    const panStartKeyHandler = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopImmediatePropagation();
        panStartHandler(event);
      }
    };
    const panEndKeyHandler = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopImmediatePropagation();
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

    // Apply a custom hitzone to the cutout div. As the buttons are a bit small,
    // this allows for clicking _next_ to the actual button as well. The custom
    // hitzone divides the circle in four quarters.
    const cutout = div.querySelector('.vjs-vr-cutout');

    cutout.addEventListener('mousedown', (event) => {
      const cutoutRect = cutout.getBoundingClientRect();
      const w = event.clientX - cutoutRect.left;
      const h = event.clientY - cutoutRect.top;

      const y = (cutoutRect.height / 2) - h;
      const x = w - cutoutRect.width / 2;

      // Calculate the angle between the center of the circle and the clicked point
      let angle = Math.atan(y / x) * 180 / Math.PI;

      if (y > 0 && x < 0) {
        angle = 90 + (90 - Math.abs(angle));
      } else if (y < 0 && x < 0) {
        angle = 180 + angle;
      } else if (y < 0 && x > 0) {
        angle = 270 + (90 - Math.abs(angle));
      }

      if (angle < 135 && angle > 45) {
        this.panStart('up');
      } else if (angle > 135 && angle < 225) {
        this.panStart('left');
      }
      if (angle > 225 && angle < 315) {
        this.panStart('down');
      }
      if (angle > 315 || angle < 45) {
        this.panStart('right');
      }
    });
    cutout.addEventListener('mouseup', panEndHandler);
    cutout.addEventListener('mouseout', panEndHandler);

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
   * @param {number} y The coordinate add an annotation. This is the y coordinate
   *  in the video texture. i.e., if your video is 1024px tall and you want to
   *  indicate something interesting halfway, you would pass 512 here.
   * @return The annotation element that was added to the DOM
   */
  addAnnotation(x, y, options) {
    const styles = (options && options.styles) || {};
    const annotation = document.createElement('span');

    annotation.className = 'vjs-vr-annotation';
    Object.keys(styles).forEach((style) => {
      annotation.style[style] = styles[style];
    });

    const width = this.options().vr.videoTexture.image.videoWidth;
    const height = this.options().vr.videoTexture.image.videoHeight;
    const angle = 360 * x / width + 90;
    const angleRads = angle * Math.PI / 180;

    const length = 18 + (22 * y / height);

    // 30px gets to halfway the moving "viewing" bar of the navigator
    const translateX = Math.floor(Math.cos(angleRads) * length);
    const translateY = Math.floor(Math.sin(angleRads) * length);

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
