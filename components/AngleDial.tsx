
import React, { useRef, useState, useCallback, useEffect } from 'react';

interface AngleDialProps {
  angle: number;
  setAngle: (angle: number) => void;
}

export const AngleDial: React.FC<AngleDialProps> = ({ angle, setAngle }) => {
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dialRef.current) return;
    
    e.preventDefault();

    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    // Calculate angle in degrees. Add 90 to make 0 degrees point up.
    let newAngle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI + 90;
    if (newAngle < 0) {
      newAngle += 360;
    }
    setAngle(Math.round(newAngle));
  }, [setAngle]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleInteraction(e);
    }
  }, [isDragging, handleInteraction]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // For touch devices
    const touchMoveHandler = (e: TouchEvent) => {
      if (isDragging) {
        handleInteraction(e);
      }
    };
    const touchEndHandler = () => setIsDragging(false);

    window.addEventListener('touchmove', touchMoveHandler);
    window.addEventListener('touchend', touchEndHandler);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', touchMoveHandler);
      window.removeEventListener('touchend', touchEndHandler);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleInteraction]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleInteraction(e.nativeEvent);
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleInteraction(e.nativeEvent);
  };

  const indicatorAngle = angle - 90; // Adjust for CSS rotation (0deg is right)

  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        ref={dialRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="w-40 h-40 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center cursor-pointer relative shadow-inner"
        style={{ touchAction: 'none' }}
      >
        <div className="w-full h-full" style={{ transform: `rotate(${indicatorAngle}deg)` }}>
          <div className="absolute top-1/2 -mt-1 w-1/2 h-0.5 bg-indigo-500 origin-left">
             <div className="w-3 h-3 bg-indigo-600 rounded-full absolute -right-1.5 -top-1"></div>
          </div>
        </div>
        <div className="absolute text-center">
            <div className="text-2xl font-bold text-gray-800">{angle}°</div>
            <div className="text-xs text-gray-500">Light Angle</div>
        </div>
      </div>
    </div>
  );
};
