
import React, { useRef } from 'react';

interface ColorPickerProps {
  label: string;
  color: string;
  setColor: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, setColor }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center space-x-2 border border-gray-300 rounded-md p-1">
        <div
          className="w-8 h-8 rounded-md cursor-pointer border border-gray-200"
          style={{ backgroundColor: color }}
          onClick={handleClick}
        ></div>
        <input
          type="text"
          value={color.toUpperCase()}
          onChange={(e) => setColor(e.target.value)}
          className="w-full font-mono text-sm p-1 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 border-none"
        />
        <input
          ref={inputRef}
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="opacity-0 w-0 h-0 absolute"
        />
      </div>
    </div>
  );
};
