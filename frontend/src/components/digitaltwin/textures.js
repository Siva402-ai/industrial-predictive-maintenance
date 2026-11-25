import * as THREE from 'three';

/**
 * Creates a procedural 45-degree yellow-and-black industrial hazard stripe texture.
 * Lightweight, resolution-independent, zero network assets required.
 */
export function createHazardTexture(stripeWidth = 16, width = 128, height = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#eab308'; // Safety yellow
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#18181b'; // Dark industrial charcoal
  ctx.beginPath();
  for (let x = -width; x < width * 2; x += stripeWidth * 2) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x + stripeWidth, 0);
    ctx.lineTo(x + stripeWidth + height, height);
    ctx.lineTo(x + height, height);
    ctx.closePath();
  }
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates a subtle concrete floor tile texture with micro-grain and seam borders
 * formatted for a modern bright industrial epoxy / polished concrete finish.
 */
export function createConcreteTexture(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base modern light industrial concrete / epoxy tone (Slate-200)
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, size, size);

  // Soft micro-speckles for authentic floor texture without dark muddiness
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 12;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Subtle clean expansion joint border lines
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates stenciled floor lettering for industrial machine bays.
 */
export function createBayStripeTexture(bayLabel) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Modern clean dark slate placard for high legibility on light floor
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 128);

  // Border outline
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 120);

  // Bay title
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bayLabel, 128, 50);

  // Subtitle
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('EQUIPMENT ZONE', 128, 90);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

