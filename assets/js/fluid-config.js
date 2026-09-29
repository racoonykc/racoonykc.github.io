// Configuration for the original homepage fluid simulation.
window.config = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 1024,
  CAPTURE_RESOLUTION: 512,
  DENSITY_DISSIPATION: 3.5,
  VELOCITY_DISSIPATION: 2,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 20,
  CURL: 30,
  SPLAT_RADIUS: 0.25,
  SPLAT_FORCE: 6000,
  SHADING: true,
  COLORFUL: true,
  COLOR_UPDATE_SPEED: 10,
  PAUSED: false,
  BLOOM: true,
  BLOOM_ITERATIONS: 8,
  BLOOM_RESOLUTION: 256,
  BLOOM_INTENSITY: 0.8,
  BLOOM_THRESHOLD: 0.6,
  BLOOM_SOFT_KNEE: 0.7,
  SUNRAYS: true,
  SUNRAYS_RESOLUTION: 196,
  SUNRAYS_WEIGHT: 1.0,
  TRANSPARENT: false,
  BACK_COLOR: { r: 5, g: 10, b: 20 }
};

// The original event handlers refer to these globals while the splash is open.
window.visibilityChangeEvent = document.hidden !== undefined ? "visibilitychange" : "webkitvisibilitychange";
window.switchPage = window.switchPage || { switched: false };
