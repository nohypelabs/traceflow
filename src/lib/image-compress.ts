/**
 * Client-side image compression utility.
 * Resizes and compresses an image file to fit under a target size (in bytes).
 * Uses Canvas API — browser only.
 */

const MAX_FILE_SIZE = 100 * 1024; // 100KB
const MAX_DIMENSION = 512; // max width/height in px
const INITIAL_QUALITY = 0.8;

export async function compressImage(file: File): Promise<Blob> {
  // Validate input
  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar');
  }

  // Load image
  const img = await loadImage(file);

  // Calculate new dimensions (keep aspect ratio)
  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // Draw to canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);

  // Compress iteratively until under target size
  let quality = INITIAL_QUALITY;
  let blob: Blob | null = null;

  while (quality > 0.1) {
    blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    if (blob.size <= MAX_FILE_SIZE) return blob;
    quality -= 0.1;
  }

  // If still too large, reduce dimensions
  let scale = 0.8;
  while (scale > 0.3) {
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    blob = await canvasToBlob(canvas, 'image/jpeg', 0.6);
    if (blob.size <= MAX_FILE_SIZE) return blob;
    scale -= 0.1;
  }

  throw new Error('Gambar terlalu besar, tidak bisa dikompres di bawah 100KB');
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal memuat gambar'));
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Gagal mengompres gambar'));
      },
      type,
      quality,
    );
  });
}
