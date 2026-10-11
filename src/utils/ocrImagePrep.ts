const MAX_EDGE_PX = 2048;
const JPEG_QUALITY = 0.82;
/** ~1.2MB raw base64 per page keeps under typical gateway limits with margin */
const TARGET_MAX_BASE64_CHARS = 1_600_000;

function estimateBase64Chars(dataUrl: string): number {
  const idx = dataUrl.indexOf(',');
  return idx >= 0 ? dataUrl.length - idx - 1 : dataUrl.length;
}

function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('تعذر تحميل الصورة للضغط قبل OCR'));
    img.src = dataUrl;
  });
}

function canvasToJpegDataUrl(canvas: HTMLCanvasElement, quality: number): string {
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Resize + JPEG compress a data URL (or pass-through if already small).
 */
export async function compressDataUrlForOcr(
  dataUrl: string,
  mimeType: string = 'image/jpeg'
): Promise<{ dataUrl: string; mimeType: string; beforeChars: number; afterChars: number }> {
  const beforeChars = estimateBase64Chars(dataUrl);
  if (beforeChars <= TARGET_MAX_BASE64_CHARS && mimeType === 'image/jpeg') {
    return { dataUrl, mimeType: 'image/jpeg', beforeChars, afterChars: beforeChars };
  }

  if (typeof document === 'undefined') {
    return { dataUrl, mimeType, beforeChars, afterChars: beforeChars };
  }

  const img = await loadImageFromDataUrl(dataUrl);
  let { width, height } = img;
  const maxEdge = Math.max(width, height);
  if (maxEdge > MAX_EDGE_PX) {
    const scale = MAX_EDGE_PX / maxEdge;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { dataUrl, mimeType, beforeChars, afterChars: beforeChars };
  }
  ctx.drawImage(img, 0, 0, width, height);

  let quality = JPEG_QUALITY;
  let out = canvasToJpegDataUrl(canvas, quality);
  let afterChars = estimateBase64Chars(out);
  while (afterChars > TARGET_MAX_BASE64_CHARS && quality > 0.45) {
    quality -= 0.08;
    out = canvasToJpegDataUrl(canvas, quality);
    afterChars = estimateBase64Chars(out);
  }

  if (import.meta.env.DEV && afterChars < beforeChars) {
    console.log('[OCR Image] compressed', {
      beforeChars,
      afterChars,
      width,
      height,
      quality,
    });
  }

  return { dataUrl: out, mimeType: 'image/jpeg', beforeChars, afterChars };
}

export async function prepareImageFileForOcr(file: File): Promise<{
  base64: string;
  mimeType: string;
  originalBytes: number;
  compressedBytes: number;
}> {
  const originalBytes = file.size;
  const readerData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const { dataUrl, mimeType, beforeChars, afterChars } = await compressDataUrlForOcr(
    readerData,
    file.type || 'image/jpeg'
  );

  return {
    base64: dataUrl,
    mimeType,
    originalBytes,
    compressedBytes: Math.round((afterChars / Math.max(beforeChars, 1)) * originalBytes),
  };
}
