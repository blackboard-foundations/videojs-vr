import {
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  WebGLRenderer,
  XRTargetRaySpace,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type Projection =
  | "180"
  | "180_LR"
  | "180_TB"
  | "180_MONO"
  | "360"
  | "SPHERE"
  | "EQUIRECTANGULAR"
  | "CUBE"
  | "360_CUBE"
  | "NONE"
  | "AUTO"
  | "360_LR"
  | "360_TB"
  | "EAC"
  | "EAC_LR";

export interface VROptions {
  /**
   * Whether motion/gyro controls should be enabled.
   * @default true on ios and andriod
   */
  motionControls?: boolean;
  /**
   * The projection of the source video.
   *
   * @default "auto"
   */
  projection?: Projection;
  /**
   * This alters the number of segments in the spherical mesh onto which equirectangular
   * videos are projected. The default is `32` but in some circumstances you may notice
   * artifacts and need to increase this number.
   * @default 32
   */
  sphereDetail?: number;
  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;
  /**
   * Use this property to pass the Omnitone library object to the plugin.
   *
   * Please be aware of, the Omnitone library is not included in the build files.
   */
  omnitone?: any;
  omnitoneOptions?: any;
  disableTogglePlay?: boolean;
  /**
   * When enabled, adds the "Enter VR" button on top of the video player.
   * @default true
   */
  showEnterVR?: boolean;
  /**
   * When enabled, adds the navigator which indicates which portion of the video
   * is currently displayed, along with 4 navigator buttons to manually pan around.
   * @default true
   */
  showNavigator?: boolean;
}

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

  /**
   * The navigator element
   *
   * Initialized when the player is ready.
   */
  navigator?: VrNavigator;

  /** Resets and initializes the video for display in an interactive manner */
  init: () => void;

  /** Remove any 360 or VR references */
  reset: () => void;

  /**
   * Indicates to the browser that this page can offer an immersive-vr session.
   *
   * This will display an "Enter VR" button next to the browser's address bar on
   * those devices that support it. e.g., a Meta Quest.
   * When the device does not support WebXR, this method does nothing and resolves
   * immediately.
   *
   * This API mimicks the XRSystem#requestSession method. The promise is resolved
   * when the user clicks the "Enter VR" button and enters the immersive experience.
   */
  offerXRSession(): Promise<XRSession | undefined>;

  /**
   * Request a WebXR session
   *
   * Note this assumes you're calling this when handling a user action.
   * e.g. handling a button click
   *
   * If XR is not supported, this will not do anything.
   */
  requestXRSession(): Promise<XRSession>;

  /**
   * Set the projection of the video
   *
   * @param projection The projection to set
   */
  setProjection(projection: string): void;
}

export interface AnnotationOption {
  /** A valid CSS background color for the annotation */
  backgroundColor?: string;
}

export interface VrNavigator {
  /**
   * Add an annotation at the given coordinate
   *
   * Note that this only affects this component. It does not add any annotations
   * in the projected video.
   *
   * @param x The coordinate add an annotation. This is the x coordinate
   *  in the video texture. i.e., if your video is 2048px wide and you want to
   *  indicate something interesting halfway, you would pass 1024 here.
   * @param options An object with additional options. Specify a `color`
   *   key with a valid CSS color value to change the background color of the
   *   annotation.
   * @returns The annotation element that was added to the DOM
   */
  addAnnotation(x: number, options: AnnotationOption): HTMLSpanElement;

  /** Remove existing annotations from the DOM */
  clearAnnotations(): void;
}
