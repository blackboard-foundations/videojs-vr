import {
  Euler,
  EventDispatcher,
  MathUtils,
  Quaternion,
  Vector3
} from 'three';

const _zee = new Vector3( 0, 0, 1 );
const _euler = new Euler();
const _q0 = new Quaternion();
const _q1 = new Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

const _changeEvent = { type: 'change' };

class DeviceOrientationControls extends EventDispatcher {

  constructor( object ) {
    super();
    const scope = this;

    const EPS = 0.000001;
    const lastQuaternion = new Quaternion();

    this.object = object;
    this.object.rotation.reorder( 'YXZ' );

    this.enabled = window.isSecureContext;

    this.deviceOrientation = {};
    this.screenOrientation = 0;

    this.alphaOffset = 0; // radians

    const onDeviceOrientationChangeEvent = function (event) {

      scope.deviceOrientation = event;
    };

    const onScreenOrientationChangeEvent = function () {

      scope.screenOrientation = window.orientation || 0;

    };

    // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

    const setObjectQuaternion = function ( quaternion, alpha, beta, gamma, orient ) {

      _euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

      quaternion.setFromEuler( _euler ); // orient the device

      quaternion.multiply( _q1 ); // camera looks out the back of the device, not the top

      quaternion.multiply( _q0.setFromAxisAngle( _zee, - orient ) ); // adjust for screen orientation

    };

    this.connect = function () {
      onScreenOrientationChangeEvent(); // run once on load
      window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent );
      window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );
    };

    this.disconnect = function () {

      window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent );
      window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );

      scope.enabled = false;

    };

    this.update = function () {

      if ( scope.enabled === false ) return;

      const device = scope.deviceOrientation;

      if ( device ) {

        const alpha = device.alpha ? MathUtils.degToRad( device.alpha ) + scope.alphaOffset : 0; // Z

        const beta = device.beta ? MathUtils.degToRad( device.beta ) : 0; // X'

        const gamma = device.gamma ? MathUtils.degToRad( device.gamma ) : 0; // Y''

        const orient = scope.screenOrientation ? MathUtils.degToRad( scope.screenOrientation ) : 0; // O

        if (alpha !== 0 && beta !== 0 && gamma !== 0) {
          setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient);
          if (8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
            lastQuaternion.copy(scope.object.quaternion);
            scope.dispatchEvent(_changeEvent);
          }
        }

        return true;
      }

    };

    this.dispose = function () {

      scope.disconnect();

    };

    this.connect();

  }

}

export { DeviceOrientationControls };
