import { useState } from 'react';

function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * Returns true when a WebGL context can actually be created. The 3D hero
 * scene needs a real GPU context, which jsdom (unit tests) and some older
 * devices lack — the hero falls back to the photo composition in those cases.
 * Determined on first render so there is no flash between the photo and the
 * 3D scene.
 */
export function useWebGLAvailable(): boolean {
  return useState(detectWebGL)[0];
}
