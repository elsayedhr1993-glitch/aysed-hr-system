import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

let workerReady = false;

export function ensurePdfjsWorker(): void {
  if (typeof window === 'undefined') return;
  if (!workerReady) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    workerReady = true;
  }
}

export async function loadPdfDocument(source: Uint8Array | ArrayBuffer) {
  ensurePdfjsWorker();
  const data = source instanceof Uint8Array ? source : new Uint8Array(source);
  const task = pdfjsLib.getDocument({ data });
  return task.promise;
}

export async function renderPdfBytesToPageImages(
  source: Uint8Array | ArrayBuffer,
  maxPages = 4,
  scale = 2
): Promise<string[]> {
  const pdf = await loadPdfDocument(source);
  const pageCount = Math.min(pdf.numPages || 1, Math.max(1, maxPages));
  const images: string[] = [];

  for (let pageNo = 1; pageNo <= pageCount; pageNo++) {
    const page = await pdf.getPage(pageNo);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('فشل في إنشاء سياق Canvas');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport, canvas: canvas as HTMLCanvasElement }).promise;
    images.push(canvas.toDataURL('image/jpeg', 0.95));
  }

  return images;
}

export async function renderPdfFileToPageImages(file: File, maxPages = 4): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  return renderPdfBytesToPageImages(arrayBuffer, maxPages);
}
