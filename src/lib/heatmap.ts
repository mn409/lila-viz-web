/**
 * heatmap.ts — Gaussian heatmap rendered to ImageData
 * All computation happens client-side in JS (no scipy needed).
 */

const GRID = 256;   // internal resolution grid
const SIGMA = 6;    // gaussian spread

export function buildHeatmap(
  points: Array<{ px: number; py: number }>,
  canvasW: number,
  canvasH: number,
  imageSize = 1024
): ImageData | null {
  if (!points.length) return null;

  // Accumulate into grid
  const grid = new Float32Array(GRID * GRID);
  const scaleX = GRID / imageSize;
  const scaleY = GRID / imageSize;

  for (const { px, py } of points) {
    const gx = Math.floor(px * scaleX);
    const gy = Math.floor(py * scaleY);
    if (gx >= 0 && gx < GRID && gy >= 0 && gy < GRID) {
      grid[gy * GRID + gx] += 1;
    }
  }

  // Gaussian blur (separable 1D pass)
  const blurred = gaussianBlur(grid, GRID, GRID, SIGMA);

  // Normalize
  let maxVal = 0;
  for (let i = 0; i < blurred.length; i++) maxVal = Math.max(maxVal, blurred[i]);
  if (!maxVal) return null;

  // Render to canvas-sized ImageData
  const imgData = new ImageData(canvasW, canvasH);
  const scaleGX = GRID / canvasW;
  const scaleGY = GRID / canvasH;

  for (let cy = 0; cy < canvasH; cy++) {
    for (let cx = 0; cx < canvasW; cx++) {
      const gx = Math.min(GRID - 1, Math.floor(cx * scaleGX));
      const gy = Math.min(GRID - 1, Math.floor(cy * scaleGY));
      const v  = blurred[gy * GRID + gx] / maxVal;  // 0..1

      const idx = (cy * canvasW + cx) * 4;
      // Colour map: blue → cyan → green → yellow → red
      const [r, g, b] = heatColour(v);
      imgData.data[idx]     = r;
      imgData.data[idx + 1] = g;
      imgData.data[idx + 2] = b;
      imgData.data[idx + 3] = Math.floor(v * 200);  // alpha
    }
  }

  return imgData;
}

function heatColour(t: number): [number, number, number] {
  // 4-stop gradient: 0→blue, 0.33→cyan, 0.66→yellow, 1→red
  if (t < 0.33) {
    const s = t / 0.33;
    return [0, Math.floor(s * 255), 255];
  } else if (t < 0.66) {
    const s = (t - 0.33) / 0.33;
    return [0, 255, Math.floor((1 - s) * 255)];
  } else {
    const s = (t - 0.66) / 0.34;
    return [Math.floor(s * 255), Math.floor((1 - s) * 255), 0];
  }
}

function gaussianBlur(src: Float32Array, w: number, h: number, sigma: number): Float32Array {
  const kernel = makeGaussianKernel(sigma);
  const r = Math.floor(kernel.length / 2);
  const tmp = new Float32Array(w * h);
  const dst = new Float32Array(w * h);

  // Horizontal pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) {
        const xi = Math.max(0, Math.min(w - 1, x + k));
        s += src[y * w + xi] * kernel[k + r];
      }
      tmp[y * w + x] = s;
    }
  }

  // Vertical pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) {
        const yi = Math.max(0, Math.min(h - 1, y + k));
        s += tmp[yi * w + x] * kernel[k + r];
      }
      dst[y * w + x] = s;
    }
  }

  return dst;
}

function makeGaussianKernel(sigma: number): number[] {
  const r = Math.ceil(3 * sigma);
  const kernel: number[] = [];
  let sum = 0;
  for (let i = -r; i <= r; i++) {
    const v = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(v);
    sum += v;
  }
  return kernel.map(v => v / sum);
}
