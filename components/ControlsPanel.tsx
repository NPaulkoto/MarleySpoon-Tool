import React, { useRef } from 'react';
import type { LightSettings, Tint } from '../types';
import { AngleDial } from './AngleDial';
import { ColorPicker } from './ColorPicker';
import { Slider } from './Slider';
import { UploadIcon, DownloadIcon } from './icons';

interface ControlsPanelProps {
  lightSettings: LightSettings;
  setLightSettings: React.Dispatch<React.SetStateAction<LightSettings>>;
  iconColor: string;
  setIconColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color:string) => void;
  tint: Tint;
  setTint: (tint: Tint) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  onSvgUpload: (file: File) => void;
  onExport: (format: 'svg' | 'png') => void;
  isExporting: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  lightSettings,
  setLightSettings,
  iconColor,
  setIconColor,
  backgroundColor,
  setBackgroundColor,
  tint,
  setTint,
  highContrast,
  setHighContrast,
  onSvgUpload,
  onExport,
  isExporting,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateSettings = (key: keyof LightSettings, value: number) => {
    setLightSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      onSvgUpload(file);
    } else if (file) {
      alert('Please upload a valid .svg file.');
    }
  };

  const tintOptions: { value: Tint; label: string; color: string }[] = [
    { value: 'none', label: 'None', color: 'bg-transparent border-gray-300' },
    { value: 'warm', label: 'Warm', color: 'bg-amber-300' },
    { value: 'cool', label: 'Cool', color: 'bg-sky-300' },
  ];

  return (
    <div className="divide-y divide-gray-200">
      <div className="py-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Light Source</h3>
        <div className="flex justify-center items-center">
          <AngleDial
            angle={lightSettings.angle}
            setAngle={(value) => handleUpdateSettings('angle', value)}
          />
        </div>
      </div>

      <div className="py-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Edge Simulation</h3>
        <Slider
          label="Intensity"
          min={0}
          max={20}
          step={0.1}
          value={lightSettings.intensity}
          onChange={(e) => handleUpdateSettings('intensity', parseFloat(e.target.value))}
        />
        <Slider
          label="Blur"
          min={0}
          max={5}
          step={0.1}
          value={lightSettings.softness}
          onChange={(e) => handleUpdateSettings('softness', parseFloat(e.target.value))}
        />
        <div className="flex justify-between items-center pt-2">
          <label htmlFor="contrast-toggle" className="text-sm font-medium text-gray-700">
            High Contrast Edge
            <p className="text-xs text-gray-500 font-normal">Enable for a solid, hard-edged look.</p>
          </label>
          <button
            id="contrast-toggle"
            role="switch"
            aria-checked={highContrast}
            onClick={() => setHighContrast(!highContrast)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              highContrast ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                highContrast ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="py-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Colors & Style</h3>
        <div className="grid grid-cols-2 gap-4">
          <ColorPicker label="Icon Color" color={iconColor} setColor={setIconColor} />
          <ColorPicker label="Background" color={backgroundColor} setColor={setBackgroundColor} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Light Tint</label>
          <div className="flex items-center space-x-2">
            {tintOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setTint(option.value)}
                className={`w-full text-center px-3 py-2 text-sm rounded-md transition-all ${
                  tint === option.value
                    ? 'ring-2 ring-indigo-500 ring-offset-1 font-semibold text-indigo-700 bg-indigo-50'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="py-6 space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">File Actions</h3>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/svg+xml"
          className="hidden"
        />
        <button
          onClick={handleUploadClick}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <UploadIcon className="w-5 h-5 mr-2" />
          Upload SVG Icon
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onExport('svg')}
            disabled={isExporting}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            <DownloadIcon className="w-5 h-5 mr-2" />
            {isExporting ? 'Exporting...' : 'Export SVG'}
          </button>
          <button
            onClick={() => onExport('png')}
            disabled={isExporting}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
             <DownloadIcon className="w-5 h-5 mr-2" />
             {isExporting ? 'Exporting...' : 'Export PNG'}
          </button>
        </div>
      </div>
    </div>
  );
};