import type { ExportOptions, Tint } from '../types';

const tintOverlayStyles: Record<Tint, string> = {
  none: '',
  warm: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; mix-blend-mode: soft-light; background-color: #fBBF24; opacity: 0.5;',
  cool: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; mix-blend-mode: soft-light; background-color: #38BDF8; opacity: 0.5;',
};

const createFullSvgString = (options: ExportOptions): string => {
  const { svgContent, viewBox, lightSettings, iconColor, highContrast } = options;
  const { angle, intensity, softness } = lightSettings;
  const filterId = "directional-morph-effect-export";
  const gradientAngle = (360 - angle) % 360;

  const highContrastFilterString = highContrast ? `
    <feComponentTransfer in="softMask" result="hardMask">
      <feFuncA type="linear" slope="100" intercept="-50" />
    </feComponentTransfer>
  ` : '';

  const finalMask = highContrast ? "hardMask" : "softMask";

  return `
    <svg 
      viewBox="${viewBox}" 
      width="512" 
      height="512" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="highlight-mask-gradient-export" gradientTransform="rotate(${gradientAngle} 0.5 0.5)">
          <stop offset="0%" stop-color="white" stop-opacity="1" />
          <stop offset="50%" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="shadow-mask-gradient-export" gradientTransform="rotate(${gradientAngle} 0.5 0.5)">
          <stop offset="50%" stop-color="white" stop-opacity="0" />
          <stop offset="100%" stop-color="white" stop-opacity="1" />
        </linearGradient>
        
        <rect id="highlight-rect-mask-export" width="100%" height="100%" fill="url(#highlight-mask-gradient-export)" />
        <rect id="shadow-rect-mask-export" width="100%" height="100%" fill="url(#shadow-mask-gradient-export)" />

        <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">
          <feMorphology in="SourceAlpha" operator="erode" radius="${intensity * 0.75}" result="eroded" />
          <feMorphology in="SourceAlpha" operator="dilate" radius="${intensity}" result="dilated" />

          <feImage href="#highlight-rect-mask-export" result="highlightMaskImage" />
          <feImage href="#shadow-rect-mask-export" result="shadowMaskImage" />

          <feComposite in="eroded" in2="highlightMaskImage" operator="in" result="highlightSide" />
          <feComposite in="dilated" in2="shadowMaskImage" operator="in" result="shadowSide" />
          
          <feMerge result="combinedMask">
            <feMergeNode in="shadowSide" />
            <feMergeNode in="highlightSide" />
          </feMerge>

          <feGaussianBlur in="combinedMask" stdDeviation="${softness}" result="softMask" />
          
          ${highContrastFilterString}

          <feFlood flood-color="${iconColor}" result="finalColor" />
          <feComposite in="finalColor" in2="${finalMask}" operator="in" />
        </filter>
      </defs>
      <g filter="url(#${filterId})">
        ${svgContent}
      </g>
    </svg>
  `;
};

const triggerDownload = (href: string, filename: string) => {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (href.startsWith('blob:')) {
    URL.revokeObjectURL(href);
  }
};

export const exportAsSvg = async (options: ExportOptions): Promise<void> => {
  const svgString = createFullSvgString(options);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, 'icon-light-effect.svg');
};

export const exportAsPng = async (options: ExportOptions): Promise<void> => {
  // To include background and tint, we must wrap the SVG in an HTML structure.
  const svgString = createFullSvgString(options);
  const fullHtml = `
    <div style="position: relative; width: 512px; height: 512px; background-color: ${options.backgroundColor};">
      ${svgString}
      <div style="${tintOverlayStyles[options.tint]}"></div>
    </div>
  `;
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${fullHtml.replace(/"/g, "'").replace(/#/g, "%23")}
        </div>
      </foreignObject>
    </svg>`
  )}`;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return reject(new Error('Could not get canvas context'));
    }

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      triggerDownload(pngUrl, 'icon-light-effect.png');
      resolve();
    };
    img.onerror = (e) => {
      console.error("Image loading failed:", e);
      reject(new Error('Failed to load SVG into image for PNG conversion.'));
    };
    img.src = dataUrl;
  });
};
