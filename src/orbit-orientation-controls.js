import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DeviceOrientationControls } from '../vendor/three/DeviceOrientationControls.js';

/**
 * Convert a quaternion to an angle
 *
 * Taken from https://stackoverflow.com/a/35448946
 * Thanks P. Ellul
 */
function Quat2Angle(x, y, z, w) {
  const test = x * y + z * w;

  // singularity at north pole
  if (test > 0.499) {
    const yaw = 2 * Math.atan2(x, w);
    const pitch = Math.PI / 2;
    const roll = 0;

    return new THREE.Vector3(pitch, roll, yaw);
  }

  // singularity at south pole
  if (test < -0.499) {
    const yaw = -2 * Math.atan2(x, w);
    const pitch = -Math.PI / 2;
    const roll = 0;

    return new THREE.Vector3(pitch, roll, yaw);
  }

  const sqx = x * x;
  const sqy = y * y;
  const sqz = z * z;
  const yaw = Math.atan2(2 * y * w - 2 * x * z, 1 - 2 * sqy - 2 * sqz);
  const pitch = Math.asin(2 * test);
  const roll = Math.atan2(2 * x * w - 2 * y * z, 1 - 2 * sqx - 2 * sqz);

  return new THREE.Vector3(pitch, roll, yaw);
}

class OrbitOrientationControls {
  constructor(options) {
    this.object = options.camera;
    this.domElement = options.canvas;
    this.orbit = new OrbitControls(this.object, this.domElement);

    // Listen for key events on the videojs player as that gets focussed
    this.orbit.listenToKeyEvents(options.canvas.parentElement);

    this.speed = 5;
    this.orbit.target.set(0, 0, -1);
    this.orbit.enableZoom = false;
    this.orbit.enablePan = false;
    this.orbit.keyRotateSpeed = -this.speed;

    // if projection is not full view
    // limit the rotation angle in order to not display back half view
    if (options.halfView) {
      this.orbit.minAzimuthAngle = -Math.PI / 4;
      this.orbit.maxAzimuthAngle = Math.PI / 4;
    }
  }

  enableOrientation() {
    this.orientation = new DeviceOrientationControls(this.object);
  }

  update() {
    // orientation updates the camera using quaternions and
    // orbit updates the camera using angles. They are incompatible
    // and one update overrides the other. So before
    // orbit overrides orientation we convert our quaternion changes to
    // an angle change. Then save the angle into orbit so that
    // it will take those into account when it updates the camera and overrides
    // our changes
    if (this.orientation) {
      // if orientation is not updated, we don't want to update the orbit. This
      // can happen if the user has not given permission to access the orientation
      if (!this.orientation.update()) {
        return;
      }

      const quat = this.orientation.object.quaternion;
      const currentAngle = Quat2Angle(quat.x, quat.y, quat.z, quat.w);

      // we also have to store the last angle since quaternions are b
      if (typeof this.lastAngle_ === 'undefined') {
        this.lastAngle_ = currentAngle;
      }

      this.orbit._rotateLeft((this.lastAngle_.z - currentAngle.z) * (1 + this.speed));
      this.orbit._rotateUp((this.lastAngle_.y - currentAngle.y) * (1 + this.speed));
      this.lastAngle_ = currentAngle;
    }

    this.orbit.update();
  }

  dispose() {
    this.orbit.dispose();

    if (this.orientation) {
      this.orientation.dispose();
    }
  }

}

export default OrbitOrientationControls;
