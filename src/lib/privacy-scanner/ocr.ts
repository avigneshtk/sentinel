/**
 * TRACELESS — browser-side OCR runner.
 *
 * Uses Tesseract.js entirely in the browser. The image
 * never leaves the device; there is no server route and
 * no external AI service involved.
 *
 * This module is browser-only. It must be imported
 * dynamically from a client component.
 */

export interface OcrProgress {
  status: string;
  progress: number; // 0..1
}

export interface OcrResult {
  text: string;
  confidence: number;
}

export async function runOcr(
  imageUrl: string,
  onProgress?: (p: OcrProgress) => void
): Promise<OcrResult> {
  // Dynamic import keeps the heavy engine out of the
  // server bundle and initial page load.
  const Tesseract = await import('tesseract.js');

  const result = await Tesseract.recognize(imageUrl, 'eng', {
    logger: (m) => {
      if (onProgress && m.status === 'recognizing text') {
        onProgress({ status: 'Reading text from image…', progress: m.progress });
      } else if (onProgress) {
        onProgress({ status: m.status, progress: 0 });
      }
    },
  });

  return {
    text: result.data.text,
    confidence: result.data.confidence,
  };
}

export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/bmp',
];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface ImageValidationResult {
  ok: boolean;
  error?: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      ok: false,
      error:
        'Unsupported file type. Please use PNG, JPEG, WebP, GIF, or BMP images.',
    };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      ok: false,
      error:
        'This image is larger than 5 MB. Please choose a smaller image — smaller images also give more accurate OCR.',
    };
  }
  if (file.size === 0) {
    return { ok: false, error: 'This file appears to be empty.' };
  }
  return { ok: true };
}
