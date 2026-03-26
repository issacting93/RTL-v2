/** Serialise an SVG element and trigger a download. */
export function exportSvg(svgElement: SVGSVGElement, filename = 'figure.svg'): void {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const blob = new Blob([clone.outerHTML], { type: 'image/svg+xml' });
  triggerDownload(blob, filename);
}

/** Rasterise an SVG element to PNG and trigger a download. */
export function exportPng(svgElement: SVGSVGElement, filename = 'figure.png', scale = 2): void {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const svgData = new XMLSerializer().serializeToString(clone);
  const vb = svgElement.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 800, 600];
  const w = vb[2] * scale;
  const h = vb[3] * scale;

  const svgUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('exportPng: failed to get canvas 2d context');
      return;
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    canvas.toBlob(blob => {
      if (blob) triggerDownload(blob, filename);
    }, 'image/png');
  };

  img.onerror = () => {
    console.error('exportPng: failed to load SVG as image — the SVG may contain invalid markup or external references');
  };

  img.src = svgUrl;
}

/** Export a JSON object as a downloadable file. */
export function exportJson(data: unknown, filename = 'data.json'): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
