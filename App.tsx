import React, { useState, useCallback } from 'react';
import { ControlsPanel } from './components/ControlsPanel';
import { SvgPreview } from './components/SvgPreview';
import { DEFAULT_SVG_CONTENT } from './constants';
import { exportAsPng, exportAsSvg } from './services/svgExport';
import type { LightSettings, Tint } from './types';

const App: React.FC = () => {
  const [svgContent, setSvgContent] = useState<string>(DEFAULT_SVG_CONTENT);
  const [viewBox, setViewBox] = useState<string>('0 0 100 100');
  const [lightSettings, setLightSettings] = useState<LightSettings>({
    angle: 315,
    intensity: 2,
    softness: 1.5,
  });
  const [iconColor, setIconColor] = useState<string>('#8A817C');
  const [backgroundColor, setBackgroundColor] = useState<string>('#F0EAD6');
  const [tint, setTint] = useState<Tint>('none');
  const [isExporting, setIsExporting] = useState(false);
  const [highContrast, setHighContrast] = useState<boolean>(true);

  const handleSvgUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'image/svg+xml');
          const svgElement = doc.querySelector('svg');
          if (!svgElement) {
            alert('Invalid SVG file: missing <svg> tag.');
            return;
          }
          const vb = svgElement.getAttribute('viewBox');
          setViewBox(vb || '0 0 100 100');
          
          const paths = Array.from(svgElement.querySelectorAll('path'))
            .map(p => p.outerHTML)
            .join('');
          
          if(!paths) {
            alert('Could not find any <path> elements in the uploaded SVG.');
            return;
          }

          setSvgContent(paths);
        } catch (error) {
          console.error('Error parsing SVG:', error);
          alert('Could not parse the SVG file. Please ensure it is valid.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleExport = useCallback(async (format: 'svg' | 'png') => {
    setIsExporting(true);
    const exportOptions = {
      svgContent,
      viewBox,
      lightSettings,
      iconColor,
      backgroundColor,
      tint,
      highContrast,
    };
    try {
      if (format === 'svg') {
        await exportAsSvg(exportOptions);
      } else {
        await exportAsPng(exportOptions);
      }
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
      alert(`Failed to export as ${format}. See console for details.`);
    } finally {
      setIsExporting(false);
    }
  }, [svgContent, viewBox, lightSettings, iconColor, backgroundColor, tint, highContrast]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-gray-800">
      <main className="flex-1 flex items-center justify-center p-4 lg:p-8 transition-colors duration-300" style={{ backgroundColor }}>
        <SvgPreview
          svgContent={svgContent}
          viewBox={viewBox}
          lightSettings={lightSettings}
          iconColor={iconColor}
          tint={tint}
          highContrast={highContrast}
        />
      </main>
      <aside className="w-full lg:w-96 bg-white shadow-2xl lg:shadow-none p-6 space-y-6 overflow-y-auto">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">SVG Light Shading</h1>
          <p className="text-sm text-gray-500 mt-1">Adjust the controls to simulate directional lighting on your icon.</p>
        </header>
        <ControlsPanel
          lightSettings={lightSettings}
          setLightSettings={setLightSettings}
          iconColor={iconColor}
          setIconColor={setIconColor}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          tint={tint}
          setTint={setTint}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
          onSvgUpload={handleSvgUpload}
          onExport={handleExport}
          isExporting={isExporting}
        />
      </aside>
    </div>
  );
};

export default App;
