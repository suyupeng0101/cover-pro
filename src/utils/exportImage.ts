import { toCanvas } from 'html-to-image';

export async function exportCoverAsPng(node: HTMLElement, width: number, height: number, filename: string) {
  const { host, clone } = createExportHost(node, width, height);
  document.body.appendChild(host);

  try {
    await document.fonts?.ready;
  } catch {
    // Font readiness is best-effort; export should still continue.
  }

  try {
    await waitForImages(clone);
    const canvas = await renderToCanvas(clone, width, height);
    const finalCanvas = hasVisiblePixels(canvas) ? canvas : await renderToCanvas(node, width, height);
    if (!hasVisiblePixels(finalCanvas)) {
      throw new Error('导出的图片为空，请稍后重试或刷新页面后再导出。');
    }

    const dataUrl = finalCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } finally {
    host.remove();
  }
}

function createExportHost(node: HTMLElement, width: number, height: number) {
  const host = document.createElement('div');
  const clone = node.cloneNode(true) as HTMLElement;

  host.style.position = 'fixed';
  host.style.left = '0';
  host.style.top = '0';
  host.style.width = `${width}px`;
  host.style.height = `${height}px`;
  host.style.overflow = 'hidden';
  host.style.opacity = '0';
  host.style.pointerEvents = 'none';
  host.style.zIndex = '2147483647';

  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.minWidth = `${width}px`;
  clone.style.minHeight = `${height}px`;
  clone.style.maxWidth = 'none';
  clone.style.maxHeight = 'none';
  clone.style.transform = 'none';
  clone.style.position = 'relative';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.zIndex = '0';
  clone.style.opacity = '1';
  clone.style.visibility = 'visible';
  clone.style.pointerEvents = 'none';
  clone.style.boxShadow = 'none';
  clone.style.contain = 'layout paint style';
  clone.setAttribute('data-exporting', 'true');

  host.appendChild(clone);
  return { host, clone };
}

async function renderToCanvas(node: HTMLElement, width: number, height: number) {
  return toCanvas(node, {
    width,
    height,
    canvasWidth: width,
    canvasHeight: height,
    pixelRatio: 1,
    cacheBust: true,
    skipFonts: false,
    skipAutoScale: true,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      maxWidth: 'none',
      maxHeight: 'none',
      transform: 'none',
      boxShadow: 'none',
    },
    filter: (element) => {
      return !(element instanceof HTMLElement && element.classList.contains('safe-area'));
    },
  });
}

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    images.map(async (image) => {
      if (image.complete && image.naturalWidth > 0) return;
      try {
        await image.decode();
      } catch {
        await new Promise<void>((resolve) => {
          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        });
      }
    }),
  );
}

function hasVisiblePixels(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return false;

  const sampleWidth = Math.min(canvas.width, 240);
  const sampleHeight = Math.min(canvas.height, 240);
  const stepX = Math.max(1, Math.floor(canvas.width / sampleWidth));
  const stepY = Math.max(1, Math.floor(canvas.height / sampleHeight));
  const data = context.getImageData(0, 0, canvas.width, canvas.height).data;

  for (let y = 0; y < canvas.height; y += stepY) {
    for (let x = 0; x < canvas.width; x += stepX) {
      const index = (y * canvas.width + x) * 4;
      if (data[index + 3] > 0) return true;
    }
  }
  return false;
}
