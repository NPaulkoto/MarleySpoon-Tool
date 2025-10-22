import React from 'react';
import type { LightSettings, Tint } from '../types';

interface SvgPreviewProps {
  svgContent: string;
  viewBox: string;
  lightSettings: LightSettings;
  iconColor: string;
  tint: Tint;
  highContrast: boolean;
}

const tintClasses: Record<Tint, string> = {
  none: 'hidden',
  warm: 'mix-blend-soft-light bg-amber-400 opacity-50',
  cool: 'mix-blend-soft-light bg-sky-400 opacity-50',
};

export const SvgPreview: React.FC<SvgPreviewProps> = ({
  svgContent,
  viewBox,
  lightSettings,
  iconColor,
  tint,
  highContrast,
}) => {
  const { angle, intensity, softness } = lightSettings;
  const filterId = "directional-morph-effect";

  // Note: SVG rotation is clockwise, but CSS/math is counter-clockwise.
  // We subtract from 360 to align our dial's visual with the SVG transform.
  const gradientAngle = (360 - angle) % 360;

  const highContrastFilter = highContrast ? (
    <feComponentTransfer in="softMask" result="hardMask">
      <feFuncA type="linear" slope="100" intercept="-(100 * 0.5)" />
    </feComponentTransfer>
  ) : null;
  
  const finalMask = highContrast ? "hardMask" : "softMask";

  return (
    <div className="w-full max-w-lg aspect-square relative shadow-lg rounded-xl overflow-hidden p-12">
      <svg
        id="svg-preview-element"
        viewBox={viewBox}
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="highlight-mask-gradient" gradientTransform={`rotate(${gradientAngle} 0.5 0.5)`}>
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="50%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="shadow-mask-gradient" gradientTransform={`rotate(${gradientAngle} 0.5 0.5)`}>
            <stop offset="50%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>
          
          {/* Rects to be used by feImage for masking */}
          <rect id="highlight-rect-mask" width="100%" height="100%" fill="url(#highlight-mask-gradient)" />
          <rect id="shadow-rect-mask" width="100%" height="100%" fill="url(#shadow-mask-gradient)" />

          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            {/* Create eroded (thin) and dilated (thick) versions of the source alpha */}
            <feMorphology in="SourceAlpha" operator="erode" radius={intensity * 0.75} result="eroded" />
            <feMorphology in="SourceAlpha" operator="dilate" radius={intensity} result="dilated" />

            {/* Load the gradient rects as image masks */}
            <feImage href="#highlight-rect-mask" result="highlightMaskImage" />
            <feImage href="#shadow-rect-mask" result="shadowMaskImage" />
            
            {/* Mask the eroded shape to the lit side */}
            <feComposite in="eroded" in2="highlightMaskImage" operator="in" result="highlightSide" />
            {/* Mask the dilated shape to the shadow side */}
            <feComposite in="dilated" in2="shadowMaskImage" operator="in" result="shadowSide" />
            
            {/* Merge the two sides to create a complete shape */}
            <feMerge result="combinedMask">
              <feMergeNode in="shadowSide" />
              <feMergeNode in="highlightSide" />
            </feMerge>

            {/* Blur the combined mask to create the soft transition */}
            <feGaussianBlur in="combinedMask" stdDeviation={softness} result="softMask" />
            
            {/* Conditionally add the high-contrast filter */}
            {highContrastFilter}
            
            {/* Color the final shape using the chosen mask */}
            <feFlood floodColor={iconColor} result="finalColor" />
            <feComposite in="finalColor" in2={finalMask} operator="in" />
          </filter>
        </defs>
        
        <g dangerouslySetInnerHTML={{ __html: svgContent }} filter={`url(#${filterId})`} />
      </svg>
      <div className={`absolute inset-0 w-full h-full pointer-events-none ${tintClasses[tint]}`}></div>
    </div>
  );
};
