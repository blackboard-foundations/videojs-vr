import {
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  WebGLRenderer,
  XRTargetRaySpace
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * The video.js VR plugin class
 */
export interface VR {
  /**
   * The three.js scene that contains the movie screen, controllers and any other
   * elements that need to be visually rendered.
   *
   * Initialized when the player is ready.
   */
  scene?: Scene;
  /**
   * The WebGL renderer that renders the scene to the canvas
   *
   * Initialized when the player is ready.
   */
  renderer?: WebGLRenderer;
  /**
   * The camera that captures which part of the scene that's visible on the canvas
   *
   * Initialized when the player is ready.
   */
  camera?: PerspectiveCamera;
  /**
   * The sphere on which the 360 video is projected.
   * The camera is effectively positioned at the center of the sphere.
   * When rotating, the sphere is rotating around the camera
   *
   * Initialized when the player is ready.
   * */
  movieScreen?: Mesh<SphereGeometry, MeshBasicMaterial>;

  /**
   * The DeviceOrientationControls which holds the OrbitControls
   *
   * Initialized when the player is ready
   */
  controls3d?: {
    orbit: OrbitControls;
  };

  /** The XR session is only defined when it's started */
  currentSession?: XRSession;

  /**
   * The left and right VR controllers
   *
   * Is undefined when the user agent does not support immersive VR
   */
  controllers?: XRTargetRaySpace[];

  /** Resets and initializes the video */
  init: () => void;
}
